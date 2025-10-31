"use client";

import React, { useRef, useEffect, useMemo, useState } from "react";
import { Niivue, NVImage } from "@niivue/niivue";
import { getSlice, type Plane } from "@/api/main_api";

type BrainSliceViewerProps = {
  /** NIfTI 파일 소스: presigned S3 URL(string) 또는 File */
  imageUrl?: string | File;
  /** 라벨/마스크 NIfTI (선택) */
  drawingUrl?: string | File;
  /** 보기 타입 */
  viewType: "axial" | "coronal" | "sagittal" | "render";
  /** 서버 PNG 슬라이스 모드 (true면 NIfTI+WebGL 모드 비활성) */
  useApiSlices?: boolean;
  /** 서버 슬라이스 모드에서 필요한 세션ID */
  sessionId?: string;
  /** 서버 슬라이스 모드에서 사용하는 평면/인덱스 (NIfTI 모드에서는 무시) */
  plane?: Plane;
  index?: number;
};

function isNonEmptyString(s: unknown): s is string {
  return typeof s === "string" && s.trim().length > 0;
}

/** string/File -> objectURL (File일 때만 생성) */
function toBlobUrl(src?: string | File | null): { url: string | null; revoke?: () => void } {
  if (!src) return { url: null };
  if (typeof src === "string") return { url: src, revoke: undefined };
  const u = URL.createObjectURL(src);
  return { url: u, revoke: () => URL.revokeObjectURL(u) };
}

/** 확장자 힌트 (loadFromUrl 쓸 때만 의미 있음) */
function guessExt(src?: string | File | null): "NII" | "NII.GZ" {
  if (!src) return "NII";
  const pick = (s: string) => (s.endsWith(".nii.gz") ? "NII.GZ" : "NII");
  if (typeof src === "string") {
    try {
      const path = new URL(src).pathname.toLowerCase();
      return pick(path);
    } catch {
      return pick(src.toLowerCase());
    }
  } else {
    const name = (src.name || "").toLowerCase();
    return pick(name);
  }
}

const BrainSliceViewer: React.FC<BrainSliceViewerProps> = ({
  imageUrl,
  drawingUrl,
  viewType,
  useApiSlices = false,
  sessionId,
  plane = "axial",
  index = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nvRef = useRef<Niivue | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // ✅ 빈 URL이면 아예 렌더/초기화하지 않음 (에러 원천 차단)
  if (!imageUrl || (typeof imageUrl === "string" && imageUrl.trim() === "")) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-black">
        loading …
      </div>
    );
  }

  // 디버그 패널에 표시할 정보
  const debugInfo = useMemo(() => {
    return {
      imageUrlType: typeof imageUrl,
      imageUrlPreview:
        typeof imageUrl === "string"
          ? imageUrl.slice(0, 120)
          : imageUrl
          ? (imageUrl as File).name
          : null,
      drawingUrlType: typeof drawingUrl,
      drawingUrlPreview:
        typeof drawingUrl === "string"
          ? drawingUrl.slice(0, 120)
          : drawingUrl
          ? (drawingUrl as File).name
          : null,
      viewType,
      useApiSlices,
      sessionId: sessionId?.slice(0, 12) ?? null,
      plane,
      index,
    };
  }, [imageUrl, drawingUrl, viewType, useApiSlices, sessionId, plane, index]);

  // ---------------- A) 서버 PNG 슬라이스 모드 ----------------
  const [sliceSrc, setSliceSrc] = useState<string>("");

  useEffect(() => {
    if (!useApiSlices) return;
    if (!sessionId) {
      setErr("Missing sessionId");
      return;
    }

    let cancelled = false;
    let prevBlobUrl: string | null = null;

    (async () => {
      try {
        setErr(null);
        const data = await getSlice(sessionId, plane, index);
        if (cancelled) return;
        if (prevBlobUrl) {
          try { URL.revokeObjectURL(prevBlobUrl); } catch {}
          prevBlobUrl = null;
        }
        setSliceSrc(data);
        if (typeof data === "string" && data.startsWith("blob:")) {
          prevBlobUrl = data;
        }
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Failed to load slice");
      }
    })();

    return () => {
      cancelled = true;
      if (prevBlobUrl) {
        try { URL.revokeObjectURL(prevBlobUrl); } catch {}
      }
      setSliceSrc("");
    };
  }, [useApiSlices, sessionId, plane, index]);

  // ---------------- B) NIfTI + Niivue 모드 ----------------
  useEffect(() => {
    if (useApiSlices) return;
    if (!canvasRef.current) return;

    // 화면 + 콘솔에 모두 찍기
    console.warn("[BrainSliceViewer] props(debug):", debugInfo);

    // 객체URL (File일 때만 생성)
    const baseObj = toBlobUrl(imageUrl);
    const overlayObj = toBlobUrl(drawingUrl);

    // 기존 인스턴스 파기
    if (nvRef.current) {
      try { (nvRef.current as any)?.destroy?.(); } catch {}
      nvRef.current = null;
    }

    const nv = new Niivue({
      backColor: [0, 0, 0, 1],
      show3Dcrosshair: true,
      trustCalMinMax: true,
    });

    try {
      nv.attachToCanvas(canvasRef.current);
    } catch (e: any) {
      console.error(e);
      setErr("WebGL2 is unavailable in this environment.");
      return;
    }
    // crosshair 숨김
    // @ts-ignore
    nv.opts.crosshairColor = [0, 0, 0, 0];

    nvRef.current = nv;
    let mounted = true;

    (async () => {
      try {
        setErr(null);

        // ----- BASE (문자열: fetch+ArrayBuffer / File: file.arrayBuffer) -----
        let baseImage: any;
        if (isNonEmptyString(imageUrl)) {
          console.warn("[BrainSliceViewer] fetching NIfTI via fetch(ArrayBuffer) …");
          const res = await fetch(imageUrl, { mode: "cors", cache: "no-store" });
          if (!res.ok) throw new Error(`fetch failed: ${res.status} ${res.statusText}`);
          const buf = await res.arrayBuffer();
          baseImage = new NVImage(buf, imageUrl);
        } else if (imageUrl instanceof File) {
          const buf = await imageUrl.arrayBuffer();
          baseImage = new NVImage(buf, imageUrl.name || "volume.nii.gz");
        } else if (baseObj.url) {
          // 안전망: File을 objectURL로 만들어 둔 경우
          const baseExt = guessExt(imageUrl);
          baseImage = await (NVImage.loadFromUrl as any)(baseObj.url, baseExt);
        } else {
          throw new Error("imageUrl is empty (no File or empty string)");
        }

        baseImage.colormap = "gray";
        baseImage.opacity = 1.0;
        if (!mounted) return;
        await nv.addVolume(baseImage);

        // ----- OVERLAY (문자열/파일 동일 패턴) -----
        if (drawingUrl) {
          let maskImage: any;
          if (isNonEmptyString(drawingUrl)) {
            console.warn("[BrainSliceViewer] fetching MASK via fetch(ArrayBuffer) …");
            const res = await fetch(drawingUrl as string, { mode: "cors", cache: "no-store" });
            if (!res.ok) throw new Error(`mask fetch failed: ${res.status} ${res.statusText}`);
            const buf = await res.arrayBuffer();
            maskImage = new NVImage(buf, drawingUrl as string);
          } else if (drawingUrl instanceof File) {
            const buf = await drawingUrl.arrayBuffer();
            maskImage = new NVImage(buf, drawingUrl.name || "mask.nii.gz");
          } else if (overlayObj.url) {
            const overlayExt = guessExt(drawingUrl);
            maskImage = await (NVImage.loadFromUrl as any)(overlayObj.url, overlayExt);
          }

          if (maskImage) {
            maskImage.isLabel = true;
            maskImage.colormap = "red";
            maskImage.opacity = 0.6;
            if (!mounted) return;
            await nv.addVolume(maskImage);
          }
        }

        // 뷰 타입
        const vt = (viewType ?? "axial").toUpperCase();
        if (vt === "RENDER" || vt === "3D") nv.setSliceType(nv.sliceTypeRender);
        else if (vt === "CORONAL") nv.setSliceType(nv.sliceTypeCoronal);
        else if (vt === "SAGITTAL") nv.setSliceType(nv.sliceTypeSagittal);
        else nv.setSliceType(nv.sliceTypeAxial);

        nv.updateGLVolume();
      } catch (e: any) {
        console.error("Error loading volumes:", e);
        setErr(e?.message ?? "Failed to load volumes");
      }
    })();

    return () => {
      mounted = false;
      try { (nv as any)?.destroy?.(); } catch {}
      nvRef.current = null;
      baseObj.revoke?.();
      overlayObj.revoke?.();
    };
  }, [useApiSlices, imageUrl, drawingUrl, viewType, debugInfo]);

  // viewType만 바뀔 때 재로딩 금지
  useEffect(() => {
    if (useApiSlices) return;
    const nv = nvRef.current;
    if (!nv) return;
    const vt = (viewType ?? "axial").toUpperCase();
    if (vt === "RENDER" || vt === "3D") nv.setSliceType(nv.sliceTypeRender);
    else if (vt === "CORONAL") nv.setSliceType(nv.sliceTypeCoronal);
    else if (vt === "SAGITTAL") nv.setSliceType(nv.sliceTypeSagittal);
    else nv.setSliceType(nv.sliceTypeAxial);
    nv.updateGLVolume();
  }, [viewType, useApiSlices]);

  // ---------------- 렌더 ----------------
  if (useApiSlices) {
    if (err) {
      return <div className="w-full h-full flex items-center justify-center text-red-400">{err}</div>;
    }
    if (!sliceSrc) {
      return <div className="w-full h-full flex items-center justify-center text-white">Loading slice…</div>;
    }
    return (
      <img
        src={sliceSrc}
        alt={`${plane} ${index}`}
        className="w-full h-full object-contain bg-black"
        draggable={false}
      />
    );
  }

  return (
    <div className="w-full h-full bg-black relative">
      {/* 🔎 디버그 패널 */}
      <div className="absolute top-2 left-2 z-20 bg-black/70 text-white text-xs p-2 rounded max-w-[60vw] space-y-1">
        <div><b>imageUrlType:</b> {typeof imageUrl}</div>
        <div><b>imageUrl:</b> {isNonEmptyString(imageUrl) ? imageUrl.slice(0, 140) : (imageUrl as File)?.name ?? "null"}</div>
        <div><b>drawingUrlType:</b> {typeof drawingUrl}</div>
        <div><b>drawingUrl:</b> {isNonEmptyString(drawingUrl) ? (drawingUrl as string).slice(0, 140) : (drawingUrl as File)?.name ?? "null"}</div>
        <div><b>viewType:</b> {viewType} | <b>useApiSlices:</b> {String(useApiSlices)}</div>
        {sessionId && <div><b>sessionId:</b> {sessionId.slice(0, 12)}</div>}
        <div><b>plane/index:</b> {plane}/{index}</div>
        {err && <div className="text-red-400"><b>err:</b> {err}</div>}
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
};

export default BrainSliceViewer;

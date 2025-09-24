"use client";

import React, { useRef, useEffect, useState } from "react";
import { Niivue, NVImage } from "@niivue/niivue";
import { getSlice, type Plane } from "@/api/main_api";

type BrainSliceViewerProps = {
  imageUrl?: string | File;                 // NIfTI (string URL or File)
  drawingUrl?: string | File;               // NIfTI mask
  viewType: "axial" | "coronal" | "sagittal" | "render";

  // Server PNG slice mode
  useApiSlices?: boolean;
  sessionId?: string;
  plane?: Plane;
  index?: number;
};

// string/File -> blob URL
function toBlobUrl(src?: string | File | null): { url: string | null; revoke?: () => void } {
  if (!src) return { url: null };
  if (typeof src === "string") return { url: src };
  const u = URL.createObjectURL(src);
  return { url: u, revoke: () => URL.revokeObjectURL(u) };
}

// 확장자 힌트 (Niivue가 필요)
function guessExt(src?: string | File | null): "NII" | "NII.GZ" {
  if (!src) return "NII";
  const pick = (s: string) => (s.endsWith(".nii.gz") ? "NII.GZ" : s.endsWith(".nii") ? "NII" : "NII");
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

  // ---------- A) 서버 PNG 슬라이스 모드 ----------
  const [sliceSrc, setSliceSrc] = useState<string>("");

  useEffect(() => {
    if (!useApiSlices) return;
    if (!sessionId) {
      setErr("Missing sessionId");
      return;
    }
    let cancelled = false;
    let prevUrl: string | null = null;

    (async () => {
      try {
        setErr(null);
        const url = await getSlice(sessionId, plane, index); // blob URL
        if (cancelled) return;
        if (prevUrl) URL.revokeObjectURL(prevUrl);
        setSliceSrc(url);
        prevUrl = url;
      } catch (e: any) {
        if (!cancelled) setErr(e?.message ?? "Failed to load slice");
      }
    })();

    return () => {
      cancelled = true;
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      setSliceSrc("");
    };
  }, [useApiSlices, sessionId, plane, index]);

  // ---------- B) NIfTI + Niivue 모드 ----------
  useEffect(() => {
    if (useApiSlices) return;                 // API 모드면 건너뜀
    if (!imageUrl || !canvasRef.current) return;

    // 이전 인스턴스 정리
    if (nvRef.current) {
      try {
        const nvOld: any = nvRef.current;
        if (nvOld.volumes?.length) {
          for (const v of nvOld.volumes) nvOld.removeVolume(v);
        }
        // @ts-ignore
        nvOld.gl = null;
      } catch {}
      nvRef.current = null;
    }

    const nv = new Niivue({
      backColor: [0, 0, 0, 1],
      show3Dcrosshair: true,
      trustCalMinMax: true,
    });

    // WebGL 컨텍스트 획득 실패에 대비
    try {
      nv.attachToCanvas(canvasRef.current);
    } catch (e: any) {
      console.error(e);
      // 폴백: 세션이 있으면 API 슬라이스 모드로 전환
      if (sessionId) {
        setErr("WebGL2 unavailable — switched to server PNG slices.");
        // 간단: 외부에서 useApiSlices를 true로 넘겨주게 하거나,
        // 여기서 임시로 한 장을 그려주는 등의 처리 가능. (지금은 메시지만)
      } else {
        setErr("WebGL2 is unavailable in this environment.");
      }
      return;
    }

    nvRef.current = nv;

    // 교차선 숨기기
    // @ts-ignore
    nv.opts.crosshairColor = [0, 0, 0, 0];

    const base = toBlobUrl(imageUrl);
    const overlay = toBlobUrl(drawingUrl);
    const baseExt = guessExt(imageUrl);
    const overlayExt = drawingUrl ? guessExt(drawingUrl) : undefined;

    const run = async () => {
      try {
        if (!base.url) throw new Error("imageUrl is required");
        setErr(null);

        // 1) 베이스 볼륨: NVImage로 로딩 후 addVolume
        // base volume
        const baseImg = await (NVImage.loadFromUrl as any)(base.url, baseExt);
        baseImg.colormap = "gray";
        baseImg.opacity = 1.0;
        await nv.addVolume(baseImg);

        // overlay volume (mask)
        if (overlay.url) {
          const maskImg = await (NVImage.loadFromUrl as any)(overlay.url, overlayExt);
          maskImg.isLabel = true;
          maskImg.colormap = "red";
          maskImg.opacity = 0.6;
          await nv.addVolume(maskImg);
        }

        // 3) 뷰 타입
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
    };

    run();

    return () => {
      try {
        const nvEnd: any = nv;
        if (nvEnd.volumes?.length) {
          for (const v of nvEnd.volumes) nvEnd.removeVolume(v);
        }
        // @ts-ignore
        nvEnd.gl = null;
      } catch {}
      nvRef.current = null;
      base.revoke?.();
      overlay.revoke?.();
    };
  }, [useApiSlices, imageUrl, drawingUrl, viewType, sessionId]);

  // ---------- 렌더 ----------
  if (useApiSlices) {
    if (err) return <div className="w-full h-full flex items-center justify-center text-red-400">{err}</div>;
    if (!sliceSrc) return <div className="w-full h-full flex items-center justify-center text-white">Loading slice…</div>;
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
      {err && <div className="absolute z-10 top-2 left-2 text-red-400">{err}</div>}
      {/* 실제 속성 width/height도 지정 (WebGL 초기화 안정성) */}
      <canvas ref={canvasRef} width={800} height={600} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
};

export default BrainSliceViewer;

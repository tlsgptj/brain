"use client"

import React, { useRef, useEffect, useState } from "react";
import { Niivue } from "@niivue/niivue";

type BrainSliceViewerProps = {
  imageUrl: string | File;
  drawingUrl?: string | File;
  viewType: "axial" | "coronal" | "sagittal" | "render";
};

const BrainSliceViewer: React.FC<BrainSliceViewerProps> = ({
  imageUrl,
  drawingUrl,
  viewType,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nv = useRef<Niivue | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const fetchWithProgress = async (url: string, onProgress: (p: number) => void): Promise<Blob> => {
    const response = await fetch(url);
    const contentLength = +response.headers.get("Content-Length")!;
    const reader = response.body!.getReader();
    let received = 0;
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        received += value.length;
        onProgress(Math.round((received / contentLength) * 100));
      }
    }

    return new Blob(chunks);
  };

  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return;

    nv.current = new Niivue();
    nv.current.attachToCanvas(canvasRef.current);

    const sliceMap = {
      axial: nv.current.sliceTypeAxial,
      coronal: nv.current.sliceTypeCoronal,
      sagittal: nv.current.sliceTypeSagittal,
      render: nv.current.sliceTypeRender,
    };

    nv.current.setSliceType(sliceMap[viewType]);
    // @ts-ignore
    nv.current.opts.crosshairColor = [0, 0, 0, 0];

    const isString = (v: unknown): v is string => typeof v === "string";
    const ext = isString(imageUrl) ? imageUrl.split(".").pop() || "" : "nii";

    const url =
      typeof imageUrl === "string"
        ? imageUrl
        : URL.createObjectURL(imageUrl);
    const drawingPath =
      drawingUrl
        ? typeof drawingUrl === "string"
          ? drawingUrl
          : URL.createObjectURL(drawingUrl)
        : null;

    const loadVolumes = async () => {
      try {
        let blob: Blob;
        if (isString(imageUrl)) {
          blob = await fetchWithProgress(imageUrl, setProgress);
        } else {
          blob = imageUrl;
          setProgress(100);
        }

        const fileUrl = URL.createObjectURL(blob);

        // @ts-ignore
        await nv.current!.loadVolumes([
          {
            url: fileUrl,
            // @ts-ignore
            ext,
            volumeOptions: { alpha: 0.3 },
          },
        ]);

        if (drawingUrl) {
          const drawUrl = isString(drawingUrl)
            ? drawingUrl
            : URL.createObjectURL(drawingUrl);
          await nv.current!.setDrawingEnabled(true);
          await nv.current!.loadDrawingFromUrl(drawUrl);
          nv.current!.setDrawOpacity(0.5);
          // @ts-ignore
          nv.current!.setDrawColormap({
            R: [0, 255],
            G: [0, 0],
            B: [0, 0],
            labels: ["Background", "Tumor"],
          });
        }

        setLoading(false);
      } catch (e) {
        console.error("Error loading volumes:", e);
      }
    };

    loadVolumes();

    return () => {
      if (typeof imageUrl !== "string") URL.revokeObjectURL(url);
      if (drawingUrl && typeof drawingUrl !== "string" && drawingPath)
        URL.revokeObjectURL(drawingPath);
      nv.current = null;
    };
  }, [imageUrl, drawingUrl, viewType]);

  return (
    <div className="relative w-full h-auto min-h-[480px] flex items-center justify-center bg-gray-100 rounded">
      {loading ? (
        <div className="w-3/4 h-4 bg-gray-200 rounded overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(to right, #f472b6, #8b5cf6)", // 핑크 → 보라
            }}
          ></div>
        </div>
      ) : (
        <canvas ref={canvasRef} width={640} height={480} className="w-full h-auto" />
      )}
    </div>
  );
};

export default BrainSliceViewer;

// 사용 예시
// <BrainSliceViewer imageUrl={imageUrl} viewType="axial" />
// <BrainSliceViewer imageUrl={imageUrl} viewType="coronal" />
// <BrainSliceViewer imageUrl={imageUrl} viewType="sagittal" />
// <BrainSliceViewer imageUrl={imageUrl} viewType="render" />

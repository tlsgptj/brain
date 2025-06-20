"use client"

import React, { useRef, useEffect } from "react";
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
        // 1. 뇌 영상 로드
        // @ts-ignore
        await nv.current!.loadVolumes([
          {
            url,
            // @ts-ignore
            ext: url.split(".").pop() || "",
            volumeOptions: { alpha: 0.3 },
          },
        ]);

        // 2. 종양 마스크 로드
        if (drawingPath) {
          await nv.current!.setDrawingEnabled(true);
          await nv.current!.loadDrawingFromUrl(drawingPath);
          nv.current!.setDrawOpacity(0.5);
          // @ts-ignore
          nv.current!.setDrawColormap({
            R: [0, 255],
            G: [0, 0],
            B: [0, 0],
            labels: ["Background", "Tumor"],
          });

          // 3. 해상도 차이 대응 (비율 계산은 Niivue 내부에서 자동으로 적용됨)
          // ※ 단, drawing과 image가 다른 해상도라도 동일한 공간 기준이면 정상 작동
        }
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

  return <canvas ref={canvasRef} width={256} height={256} />;
};

export default BrainSliceViewer;

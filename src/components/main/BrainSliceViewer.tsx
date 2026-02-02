"use client";

import React, { useRef, useEffect } from "react";
import { Niivue } from "@niivue/niivue";

type BrainSliceViewerProps = {
  imageUrl: File;
  drawingUrl?: File | string;
  viewType: "axial" | "coronal" | "sagittal" | "render";
};

const BrainSliceViewer: React.FC<BrainSliceViewerProps> = ({
  imageUrl,
  drawingUrl,
  viewType,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const nvRef = useRef<Niivue | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const nv = new Niivue();
    nv.attachToCanvas(canvasRef.current);
    nvRef.current = nv;

    const sliceMap = {
      axial: nv.sliceTypeAxial,
      coronal: nv.sliceTypeCoronal,
      sagittal: nv.sliceTypeSagittal,
      render: nv.sliceTypeRender,
    } as const;

    nv.setSliceType(sliceMap[viewType]);
    // @ts-ignore
    nv.opts.crosshairColor = [0, 0, 0, 0];

    const load = async () => {
      try {
        // 1️⃣ base volume
        const baseBuf = await imageUrl.arrayBuffer();
        await nv.loadFromArrayBuffer(baseBuf, imageUrl.name);

        // 2️⃣ mask overlay
        if (drawingUrl) {
          let maskBuf: ArrayBuffer;
          let maskName: string;

          if (drawingUrl instanceof File) {
            maskBuf = await drawingUrl.arrayBuffer();
            maskName = drawingUrl.name;
          } else {
            const res = await fetch(drawingUrl);
            maskBuf = await res.arrayBuffer();
            maskName = drawingUrl.split("/").pop() ?? "mask.nii.gz";
          }

          await nv.loadFromArrayBuffer(maskBuf, maskName);

          if (nv.volumes.length > 1) {
            const overlay = nv.volumes[1];
            overlay.opacity = 0.5;
            nv.setColormap(overlay.id, "red");
          }
        }
      } catch (e) {
        console.error("Error loading volumes:", e);
      }
    };

    load();

    return () => {
      // ✅ Niivue에는 dispose가 없음 → 참조만 끊어주면 충분
      nvRef.current = null;
      // canvas는 React가 제거함
    };
  }, [imageUrl, drawingUrl, viewType]);

  return <canvas ref={canvasRef} width={400} height={256} />;
};

export default BrainSliceViewer;

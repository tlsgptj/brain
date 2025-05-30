"use client"

import React, {useRef, useEffect} from 'react';
import { Niivue } from "@niivue/niivue";

const BrainSliceViewer: React.FC<{ imageUrl: string | File; viewType: "axial" | "coronal" | "sagittal" | "render" }> = ({
  imageUrl,
  viewType,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!imageUrl) return;

    let url: string;
    if (typeof imageUrl === "string") {
      url = imageUrl;
    } else {
      url = URL.createObjectURL(imageUrl);
    }

    const nv = new Niivue();
    nv.attachToCanvas(canvasRef.current);

    const sliceMap = {
      axial: nv.sliceTypeAxial,
      coronal: nv.sliceTypeCoronal,
      sagittal: nv.sliceTypeSagittal,
      render: nv.sliceTypeRender,
    };

    nv.setSliceType(sliceMap[viewType]);
    nv.loadVolumes([{ url, ext: url.split(".").pop() || "" }]);

    return () => {
      if (imageUrl instanceof File) {
        URL.revokeObjectURL(url);
      }
    };
  }, [imageUrl, viewType]);

  return <canvas ref={canvasRef} width={640} height={480} />;
};


// TODO: 이거 로딩해야함 각각 페이지에

{/* <BrainSliceViewer imageUrl={imageUrl} viewType="axial" />
<BrainSliceViewer imageUrl={imageUrl} viewType="coronal" />
<BrainSliceViewer imageUrl={imageUrl} viewType="sagittal" />
<BrainSliceViewer imageUrl={imageUrl} viewType="render" /> */}


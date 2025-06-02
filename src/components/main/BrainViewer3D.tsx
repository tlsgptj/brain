import { useRef, useEffect, useState } from "react";
import { Niivue } from "@niivue/niivue";
import BrainSliceViewer from "./BrainSliceViewer";

interface BrainViewer3DProps {
  imageUrl: string | File;
}

const BrainViewer3D: React.FC<BrainViewer3DProps> = ({ imageUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      setError("No imageUrl provided");
      return;
    }
    setError(null);

    let url: string;
    if (typeof imageUrl === "string") {
      url = imageUrl;
    } else if (imageUrl instanceof File) {
      url = URL.createObjectURL(imageUrl);
    } else {
      setError("Invalid imageUrl type");
      return;
    }

    const nv = new Niivue();
    nv.attachToCanvas(canvasRef.current);
    nv.loadVolumes([
      {
        url,
        ext: url.split(".").pop() || "",
      },
    ]);

    return () => {
      nv.destroy?.();
      if (imageUrl instanceof File) {
        URL.revokeObjectURL(url);
      }
    };
  }, [imageUrl]);

  if (error) {
    return <div>{error}</div>;
  }

  // 3D 뷰어만 렌더링 (BrainSliceViewer 제거)
  return <BrainSliceViewer imageUrl={imageUrl} viewType="render" />;
};

export default BrainViewer3D;

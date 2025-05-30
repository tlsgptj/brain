import { useRef, useEffect, useState } from "react";
import { Niivue } from "@niivue/niivue";

interface BrainViewer3DProps {
  imageUrl: string | File; // string 또는 File 가능
}

//TODO : 로딩페이지 만들어야함

const BrainViewer3D: React.FC<BrainViewer3DProps> = ({ imageUrl }) => {
  const canvas = useRef<HTMLCanvasElement | null>(null);
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

    const volumeList = [
      {
        url,
        ext: url.split(".").pop() || "",
      },
    ];

    const nv = new Niivue();
    nv.attachToCanvas(canvas.current);
    nv.loadVolumes(volumeList);

    return () => {
      if (imageUrl instanceof File) {
        URL.revokeObjectURL(url);
      }
    };
  }, [imageUrl]);
  console.log("BrainViewer3D component rendered, imageUrl:", imageUrl);

  if (error) {
    return <div>{error}</div>;
  }

  return <canvas ref={canvas} height={480} width={640} />;
};

export default BrainViewer3D;

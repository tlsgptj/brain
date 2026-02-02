"use client";

import React from "react";
import BrainSliceViewer from "./BrainSliceViewer";

type Plane = "axial" | "coronal" | "sagittal";

interface PlaneSelectorProps {
  file: File | null;
  currentPlane: Plane;
  onPlaneChange: (plane: Plane) => void;
}

const PlaneSelector: React.FC<PlaneSelectorProps> = ({
  file,
  currentPlane,
  onPlaneChange,
}) => {
  const planes: Plane[] = ["axial", "coronal", "sagittal"];

  if (!file) {
    return <div className="text-white p-4">파일을 업로드 해주세요.</div>;
  }

  return (
    <div className="absolute top-4 left-4 z-10 space-y-1">
      {planes.map((plane) => (
        <button
          key={plane}
          onClick={() => onPlaneChange(plane)}
          className={`block w-[1300px] h-[1000px] rounded-lg border-[5px] transition-all ${
            currentPlane === plane
              ? "border-pink-500 bg-pink-500/20"
              : "border-gray-600 bg-gray-800/80 hover:border-gray-500"
          }`}
        >
          {/* ✅ 헤더: 디자인 유지 + 크기/패딩만 축소 */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-pink-500 w-90 rounded-br-2xl">
            <div className="text-5xl font-medium text-white capitalize text-center pl-3">
              {plane}
            </div>
          </div>

          <div className="h-[92%] mx-auto pt-1">
            {/* ✅ blobUrl 대신 File 그대로 전달 */}
            <BrainSliceViewer
              imageUrl={file}
              drawingUrl="/images/resized_512x512.nii.gz"
              viewType={plane}
            />
          </div>
        </button>
      ))}
    </div>
  );
};

export default PlaneSelector;

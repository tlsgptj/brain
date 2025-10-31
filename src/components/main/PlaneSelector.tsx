// PlaneSelector.tsx (간소화 버전)
"use client";
import React from "react";
type Plane = "axial" | "coronal" | "sagittal";

interface PlaneSelectorProps {
  file: File | null;
  currentPlane: Plane;
  onPlaneChange: (plane: Plane) => void;
}

const PlaneSelector: React.FC<PlaneSelectorProps> = ({ file, currentPlane, onPlaneChange }) => {
  const planes: Plane[] = ["axial", "coronal", "sagittal"];
  if (!file) return <div className="text-white p-4">파일을 업로드 해주세요.</div>;

  return (
    <div className="absolute top-4 left-4 z-10 flex gap-3">
      {planes.map((plane) => (
        <button
          key={plane}
          onClick={() => onPlaneChange(plane)}
          className={`px-4 py-2 rounded-lg border transition-all text-lg capitalize
            ${currentPlane === plane ? "border-pink-500 bg-pink-500/20" : "border-gray-600 bg-gray-800/80 hover:border-gray-500"}`}
        >
          {plane}
        </button>
      ))}
    </div>
  );
};
export default PlaneSelector;

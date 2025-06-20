"use client";

import React, { useMemo, useState, useEffect } from 'react';
import BrainSliceViewer from './BrainSliceViewer';

type Plane = 'axial' | 'coronal' | 'sagittal';

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
  const [blobUrl, setBlobUrl] = useState<string>('');

  useEffect(() => {
    if (!file) {
      setBlobUrl('');
      return;
    }

    const url = URL.createObjectURL(file);
    setBlobUrl(url);

    return () => {
      URL.revokeObjectURL(url); // 메모리 누수 방지
    };
  }, [file]);

  const planes: Plane[] = ['axial', 'coronal', 'sagittal'];

  if (!file) {
    return <div className="text-white p-4">파일을 업로드 해주세요.</div>;
  }

  return (
    <div className="absolute top-4 left-4 z-10 space-y-2">
      {planes.map((plane) => (
        <button
          key={plane}
          onClick={() => onPlaneChange(plane)}
          className={`block w-[1300px] h-[1000px] rounded-lg border-5 transition-all ${
            currentPlane === plane
              ? 'border-pink-500 bg-pink-500/20'
              : 'border-gray-600 bg-gray-800/80 hover:border-gray-500'
          }`}
        >
          <div className="flex items-center justify-between px-4 py-2 bg-pink-500 w-90 rounded-br-2xl">
            <div className="text-7xl font-medium text-white capitalize mb-1 text-center pl-4">{plane}</div>
          </div>
          {blobUrl && (
            <div className="h-[90%] mx-auto">
              <BrainSliceViewer imageUrl={blobUrl} drawingUrl="/images/tumor_resized.nii.gz" viewType={plane} />
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default PlaneSelector;
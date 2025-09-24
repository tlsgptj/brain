import React, { useEffect, useState, useCallback } from 'react';
import * as nifti from 'nifti-reader-js';
import PlaneSelector from './PlaneSelector';
import { getSlice, type Plane } from '@/api/main_api';

interface BrainViewer2DProps {
  niiFile: File | null;
  currentPlane: Plane;
  onPlaneChange: (plane: Plane) => void;
  selectedSlice: number;
  onSliceChange: (slice: number) => void;
  totalSlices?: number;

  sessionId?: string;
  useApiSlices?: boolean;
  channel?: number;
}

interface Dimensions {
  x: number;
  y: number;
  z: number;
}

const VISIBLE_SLICE_COUNT = 7;

const BrainViewer2D: React.FC<BrainViewer2DProps> = ({
  niiFile,
  currentPlane,
  onPlaneChange,
  selectedSlice,
  onSliceChange,
  totalSlices: externalTotalSlices,
  sessionId,
  useApiSlices = false,
  channel = 0,
}) => {
  const [niftiData, setNiftiData] = useState<null | { imageData: number[], dims: number[] }>(null);
  const [fullSlices, setFullSlices] = useState<string[]>([]);
  const [visibleSlices, setVisibleSlices] = useState<string[]>([]);
  const [loadCount, setLoadCount] = useState(10);
  const [totalSlices, setTotalSlices] = useState(1);
  const [dimensions, setDimensions] = useState<Dimensions>({ x: 0, y: 0, z: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // 데이터 정규화 함수
  const normalizeData = useCallback((data: number[]): Uint8Array => {
    const nonZeroValues = data.filter(v => v !== 0);
    if (nonZeroValues.length === 0) return new Uint8Array(data.length).fill(0);
    const sorted = [...nonZeroValues].sort((a,b)=>a-b);
    const p2 = Math.floor(sorted.length * 0.02);
    const p98 = Math.floor(sorted.length * 0.98);
    const min = sorted[p2], max = sorted[p98];
    if (max === min) return new Uint8Array(data.length).fill(128);

    const out = new Uint8Array(data.length);
    const range = max - min;
    for (let i = 0; i < data.length; i++) {
      if (data[i] === 0) { out[i] = 0; continue; }
      const clamped = Math.max(min, Math.min(max, data[i]));
      let val = ((clamped - min) / range) * 255;
      val = Math.pow(val / 255, 0.5) * 255; // 감마
      out[i] = Math.round(val);
    }
    return out;
  }, []);

  // 데이터 타입별 변환
  const processImageData = useCallback((niftiImage: ArrayBuffer, datatype: number): number[] => {
    switch (datatype) {
      case 2: return Array.from(new Uint8Array(niftiImage));
      case 4: return Array.from(new Int16Array(niftiImage));
      case 8: return Array.from(new Int32Array(niftiImage));
      case 16: return Array.from(new Float32Array(niftiImage));
      case 64: return Array.from(new Float64Array(niftiImage));
      default: return Array.from(new Uint8Array(niftiImage));
    }
  }, []);

  // 슬라이스 생성 함수
  const createSlices = useCallback((imageData: number[], dims: number[], plane: Plane) => {
    const [x, y, z] = [dims[1], dims[2], dims[3]];
    const normalized = normalizeData(imageData);
    const slices: string[] = [];
    let sliceCount = z, width = x, height = y;

    if (plane === 'sagittal') { sliceCount = x; width = y; height = z; }
    else if (plane === 'coronal') { sliceCount = y; width = x; height = z; }

    for (let i = 0; i < sliceCount; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d'); if (!ctx) continue;
      const imgData = ctx.createImageData(width, height);

      for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
          let dataIndex = 0;
          if (plane === 'axial') dataIndex = i * x * y + row * x + col;
          else if (plane === 'sagittal') dataIndex = row * x * y + col * x + i;
          else dataIndex = row * x * y + i * x + col;

          const px = (row * width + col) * 4;
          const val = (dataIndex < normalized.length) ? normalized[dataIndex] : 0;
          imgData.data[px] = val; imgData.data[px+1] = val; imgData.data[px+2] = val; imgData.data[px+3] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      slices.push(canvas.toDataURL());
    }
    return { slices, sliceCount };
  }, [normalizeData]);

  // niiFile 변경 시 NIFTI 파싱
  useEffect(() => {
    if (!niiFile) {
      setFullSlices([]);
      setVisibleSlices([]);
      setTotalSlices(1);
      setDimensions({ x: 0, y: 0, z: 0 });
      setNiftiData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    console.log('[BrainViewer2D] useEffect triggered - niiFile changed');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rawData = e.target?.result;
        if (!rawData || !(rawData instanceof ArrayBuffer)) {
          setIsLoading(false);
          return;
        }
        
        let data: ArrayBuffer;
        if (nifti.isCompressed(rawData)) {
          // @ts-ignore
          data = nifti.decompress(rawData).slice(0);
        } else {
          data = rawData;
        }
        
        if (nifti.isNIFTI(data)) {
          const header = nifti.readHeader(data);
          const image = nifti.readImage(header, data);
          const dims = header.dims;
          const [x, y, z] = [dims[1], dims[2], dims[3]];
          setDimensions({ x, y, z });
          const imageData = processImageData(image, header.datatypeCode);
          setNiftiData({ imageData, dims });
        } else {
          alert('Not a valid NIFTI file');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error processing NIFTI file:', error);
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      setFullSlices([]);
      setVisibleSlices([]);
      setTotalSlices(1);
      setDimensions({ x: 0, y: 0, z: 0 });
      setIsLoading(false);
    };
    
    reader.readAsArrayBuffer(niiFile);
  }, [niiFile, processImageData]);

  // currentPlane 변경 시 슬라이스 재생성
  useEffect(() => {
    if (useApiSlices) return; // API 모드에서는 로컬 파싱 스킵
    if (!niiFile) {
      setFullSlices([]); setVisibleSlices([]); setTotalSlices(1);
      setDimensions({ x:0,y:0,z:0 }); setNiftiData(null); setIsLoading(false);
      return;
    }
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = e.target?.result;
        if (!raw || !(raw instanceof ArrayBuffer)) { setIsLoading(false); return; }

        let data: ArrayBuffer;
        if (nifti.isCompressed(raw)) {
          // @ts-ignore
          data = nifti.decompress(raw).slice(0);
        } else data = raw;

        if (!nifti.isNIFTI(data)) { alert('Not a valid NIFTI file'); setIsLoading(false); return; }
        const header = nifti.readHeader(data);
        const image = nifti.readImage(header, data);
        const dims = header.dims;
        const [x,y,z] = [dims[1], dims[2], dims[3]];
        setDimensions({ x,y,z });
        const imageData = processImageData(image, header.datatypeCode);
        setNiftiData({ imageData, dims });
      } catch (err) {
        console.error('Error processing NIFTI:', err);
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setFullSlices([]); setVisibleSlices([]); setTotalSlices(1);
      setDimensions({ x:0,y:0,z:0 }); setIsLoading(false);
    };
    reader.readAsArrayBuffer(niiFile);
  }, [niiFile, processImageData, useApiSlices]);


  useEffect(() => {
    if (useApiSlices) return;          // API 모드 -> 아래 전용 이펙트에서 처리
    if (!niftiData) return;
    try {
      const { imageData, dims } = niftiData;
      const { slices, sliceCount } = createSlices(imageData, dims, currentPlane);
      setFullSlices(slices);
      setTotalSlices(sliceCount);

      const mid = Math.floor(sliceCount / 2);
      onSliceChange(mid);
      const start = Math.max(0, mid - 3);
      const end = Math.min(sliceCount, mid + 4);
      setVisibleSlices(slices.slice(start, end));
      setIsLoading(false);
    } catch (err) {
      console.error('Error creating slices:', err);
      setIsLoading(false);
    }
  }, [currentPlane, niftiData, createSlices, onSliceChange, useApiSlices]);


  useEffect(() => {
    if (!useApiSlices || !sessionId) return;
    let cancelled = false;
    const run = async () => {
      setIsLoading(true);
      try {
        const current = await getSlice(sessionId, currentPlane, selectedSlice, channel);
        if (cancelled) return;

        // 현재 슬라이스 표시
        const full: string[] = [];
        full[selectedSlice] = `data:image/png;base64,${current}`;
        setFullSlices(full);

        // 썸네일 범위
        const start = Math.max(0, selectedSlice - 3);
        const end = Math.min((externalTotalSlices ?? 155) - 1, selectedSlice + 3);
        const promises: Promise<string>[] = [];
        const idxs: number[] = [];
        for (let i = start; i <= end; i++) {
          idxs.push(i);
          promises.push(getSlice(sessionId, currentPlane, i, channel));
        }
        const results = await Promise.all(promises);
        if (cancelled) return;
        setVisibleSlices(results.map(b64 => `data:image/png;base64,${b64}`));
      } catch (e) {
        if (!cancelled) console.error(e);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void run();
    return () => { cancelled = true; };
  }, [useApiSlices, sessionId, currentPlane, selectedSlice, channel, externalTotalSlices]);

  // 썸네일 클릭 핸들러
  const handleThumbnailClick = (thumbIdx: number) => {
    if (!useApiSlices) {
      onSliceChange(thumbIdx);
      return;
    }
    // API 모드: visibleSlices가 selectedSlice-3 ~ +3로 구성되어 있으므로 역산
    const baseStart = Math.max(0, selectedSlice - 3);
    const realIndex = baseStart + thumbIdx;
    onSliceChange(realIndex);
    const container = document.getElementById('thumbnail-container');
    const selected = document.getElementById(`thumbnail-${thumbIdx}`);
    if (container && selected) {
      const containerRect = container.getBoundingClientRect();
      const thumbnailRect = selected.getBoundingClientRect();
      const scrollLeft = selected.offsetLeft - (containerRect.width / 2) + (thumbnailRect.width / 2);
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  };

  if (isLoading || (useApiSlices ? !visibleSlices.length && !fullSlices[selectedSlice] : !visibleSlices.length)) {
    return (
      <div className="text-white flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-50 w-50 border-b-2 border-white mx-auto mb-2"></div>
          <div className='text-7xl mt-40'>Loading slices...</div>
          {dimensions.x > 0 && (
            <div className="text-6xl text-gray-400 mt-6">
              Dimensions: {dimensions.x} × {dimensions.y} × {dimensions.z}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col">
      <PlaneSelector currentPlane={currentPlane} onPlaneChange={onPlaneChange} file={niiFile} />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-400 h-full bg-black rounded-lg flex items-center justify-center">
          {fullSlices[selectedSlice] ? (
            <img
              src={fullSlices[selectedSlice]}
              alt={`Brain slice ${selectedSlice + 1}`}
              className="w-400 object-contain"
            />
          ) : (
            <div className="text-white text-center">
              <div>슬라이스를 불러올 수 없습니다</div>
              <div className="text-sm text-gray-400">
                Slice {selectedSlice + 1} of {totalSlices}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-900 border-t border-gray-600 p-4">
        <div className="text-white text-base mb-3 text-center">
          MRI Image - Slice {selectedSlice + 1} of {totalSlices}
        </div>
        <div
          id="thumbnail-container"
          className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-pink-500 scrollbar-track-gray-700"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#ec4899 #374151', height: '25vh', minHeight: '120px', alignItems: 'center' }}
        >
          {visibleSlices.map((slice, idx) => (
            <div
              key={idx}
              id={`thumbnail-${idx}`}
              className={`flex-shrink-0 cursor-pointer transition-all duration-200 ${
                // API 모드에서는 현재 선택과 썸네일 index의 “실제 인덱스” 비교가 필요하지만,
                // 간단히 스타일은 hover 위주로만 처리해도 OK
                'border border-gray-600 hover:border-gray-400'
              }`}
              onClick={() => handleThumbnailClick(idx)}
              style={{ height: '90%', width: '900px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
              <img src={slice} alt={`Slice ${idx + 1}`} className="object-cover bg-black" style={{ imageRendering: 'pixelated', width: '100%', height: '100%', minHeight: '80px' }}/>
              <div className="text-sm text-center mt-2 text-gray-400">{idx + 1}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute top-2 right-2 text-xs text-gray-400 bg-black bg-opacity-75 p-3 rounded">
        <div>Mode: {useApiSlices ? 'API' : 'Local'}</div>
        <div>Plane: {currentPlane}</div>
        <div>Slice: {selectedSlice + 1}/{totalSlices}</div>
        {(!useApiSlices) && <div>Dims: {dimensions.x}×{dimensions.y}×{dimensions.z}</div>}
      </div>
    </div>
  );
};

export default BrainViewer2D;
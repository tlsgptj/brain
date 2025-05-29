import React, { useEffect, useState } from 'react';
import * as nifti from 'nifti-reader-js';
import PlaneSelector from './PlaneSelector';
import SliceNavigator from './SliceNavigator';

const BrainViewer2D = ({
  niiFile,
  currentPlane,
  onPlaneChange,
  selectedSlice,
  onSliceChange,
}) => {
  const [sliceImages, setSliceImages] = useState([]);
  const [totalSlices, setTotalSlices] = useState(1);
  const [dimensions, setDimensions] = useState({ x: 0, y: 0, z: 0 });

  // 데이터 정규화 함수 (의료 영상용)
  const normalizeData = (data) => {
    // 0이 아닌 값들만 필터링 (배경 제거)
    const nonZeroValues = data.filter(val => val !== 0);
    
    if (nonZeroValues.length === 0) {
      console.log("⚠️ 모든 값이 0입니다");
      return new Uint8Array(data.length).fill(0);
    }
    
    // 퍼센타일 기반 정규화 (극값 제거)
    const sorted = [...nonZeroValues].sort((a, b) => a - b);
    const p2 = Math.floor(sorted.length * 0.02); // 2% 퍼센타일
    const p98 = Math.floor(sorted.length * 0.98); // 98% 퍼센타일
    
    const min = sorted[p2];
    const max = sorted[p98];
    
    console.log("📊 정규화 정보:", { 
      원본범위: [Math.min(...data.slice(0, 1000)), Math.max(...data.slice(0, 1000))],
      비영값개수: nonZeroValues.length,
      정규화범위: [min, max],
      전체크기: data.length,
      중간값: sorted[Math.floor(sorted.length/2)]
    });
    
    if (max === min) {
      console.log("⚠️ min과 max가 같습니다. 기본값 사용");
      return new Uint8Array(data.length).fill(128);
    }
    
    const normalized = new Uint8Array(data.length);
    const range = max - min;
    
    for (let i = 0; i < data.length; i++) {
      if (data[i] === 0) {
        normalized[i] = 0; // 배경은 검은색 유지
      } else {
        // 클램핑 후 정규화 (더 강한 콘트라스트)
        let clampedValue = Math.max(min, Math.min(max, data[i]));
        let normalizedValue = ((clampedValue - min) / range) * 255;
        
        // 감마 보정으로 콘트라스트 향상
        normalizedValue = Math.pow(normalizedValue / 255, 0.5) * 255;
        
        normalized[i] = Math.round(normalizedValue);
      }
    }
    
    return normalized;
  };

  // 원본 데이터 타입에 따른 처리
  const processImageData = (niftiImage, datatype) => {
    let imageData;
    
    switch (datatype) {
      case 2: // unsigned char
        imageData = new Uint8Array(niftiImage);
        break;
      case 4: // signed short
        imageData = new Int16Array(niftiImage);
        break;
      case 8: // signed int
        imageData = new Int32Array(niftiImage);
        break;
      case 16: // float
        imageData = new Float32Array(niftiImage);
        break;
      case 64: // double
        imageData = new Float64Array(niftiImage);
        break;
      default:
        console.log("🔄 기본 타입으로 처리:", datatype);
        imageData = new Uint8Array(niftiImage);
    }
    
    return Array.from(imageData);
  };

  // 슬라이스 생성 함수
  const createSlices = (imageData, dims, plane) => {
    const [x, y, z] = [dims[1], dims[2], dims[3]];
    const normalizedData = normalizeData(imageData);
    const slices = [];
    
    let sliceCount, width, height;
    
    switch (plane) {
      case 'axial':
        sliceCount = z;
        width = x;
        height = y;
        break;
      case 'sagittal':
        sliceCount = x;
        width = y;
        height = z;
        break;
      case 'coronal':
        sliceCount = y;
        width = x;
        height = z;
        break;
      default:
        sliceCount = z;
        width = x;
        height = y;
    }
    
    console.log(`📐 ${plane} 슬라이스 정보:`, { sliceCount, width, height });
    
    for (let i = 0; i < sliceCount; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      const imgData = ctx.createImageData(width, height);
      
      // 평면에 따른 인덱싱
      for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
          let dataIndex;
          
          switch (plane) {
            case 'axial':
              dataIndex = i * x * y + row * x + col;
              break;
            case 'sagittal':
              dataIndex = row * x * y + col * x + i;
              break;
            case 'coronal':
              dataIndex = row * x * y + i * x + col;
              break;
            default:
              dataIndex = i * x * y + row * x + col;
          }
          
          const pixelIndex = (row * width + col) * 4;
          const value = (dataIndex < normalizedData.length) ? normalizedData[dataIndex] : 0;
          
          imgData.data[pixelIndex + 0] = value; // R
          imgData.data[pixelIndex + 1] = value; // G
          imgData.data[pixelIndex + 2] = value; // B
          imgData.data[pixelIndex + 3] = 255;   // A
        }
      }
      
      ctx.putImageData(imgData, 0, 0);
      slices.push(canvas.toDataURL());
    }
    
    return { slices, sliceCount };
  };

  useEffect(() => {
    if (!niiFile) return;
    
    console.log("📁 파일 선택됨:", niiFile);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const rawData = e.target.result;
      console.log("📦 파일 로딩 완료");
      
      let data;
      if (nifti.isCompressed(rawData)) {
        console.log("🗜️ 압축된 NIfTI 파일 감지됨 (.nii.gz)");
        data = nifti.decompress(rawData);
      } else {
        console.log("📂 압축되지 않은 NIfTI 파일");
        data = rawData;
      }
      
      if (nifti.isNIFTI(data)) {
        console.log("✅ 유효한 NIfTI 파일");
        const niftiHeader = nifti.readHeader(data);
        const niftiImage = nifti.readImage(niftiHeader, data);
        
        console.log("🏥 NIfTI 헤더 정보:", {
          dims: niftiHeader.dims,
          datatype: niftiHeader.datatypeCode,
          pixDims: niftiHeader.pixDims,
          cal_min: niftiHeader.cal_min,
          cal_max: niftiHeader.cal_max
        });
        
        const dims = niftiHeader.dims;
        const [x, y, z] = [dims[1], dims[2], dims[3]];
        setDimensions({ x, y, z });
        
        // 데이터 타입에 따른 처리
        const imageData = processImageData(niftiImage, niftiHeader.datatypeCode);
        
        // 현재 평면에 따른 슬라이스 생성
        const { slices, sliceCount } = createSlices(imageData, dims, currentPlane);
        
        console.log("🖼️ 슬라이스 생성 완료:", slices.length);
        
        // 여러 슬라이스의 픽셀 값 샘플링 (처음, 중간, 끝)
        const testSlices = [0, Math.floor(sliceCount/2), sliceCount-1];
        testSlices.forEach((sliceIdx) => {
          if (slices[sliceIdx]) {
            const testCanvas = document.createElement('canvas');
            testCanvas.width = 10;
            testCanvas.height = 10;
            const testCtx = testCanvas.getContext('2d');
            const testImg = new Image();
            testImg.onload = () => {
              testCtx.drawImage(testImg, 0, 0, 10, 10);
              const pixelData = testCtx.getImageData(0, 0, 10, 10);
              const samplePixels = Array.from(pixelData.data).filter((_, i) => i % 4 === 0).slice(0, 10);
              const nonZeroCount = samplePixels.filter(p => p > 0).length;
              console.log(`🎯 슬라이스 ${sliceIdx + 1} 픽셀 샘플:`, {
                pixels: samplePixels,
                nonZeroPixels: nonZeroCount,
                maxValue: Math.max(...samplePixels)
              });
            };
            testImg.src = slices[sliceIdx];
          }
        });
        
        setSliceImages(slices);
        setTotalSlices(sliceCount);
        
        // 자동으로 중간 슬라이스로 이동
        const middleSlice = Math.floor(sliceCount / 2);
        if (selectedSlice === 0) {
          console.log(`🎯 중간 슬라이스(${middleSlice})로 자동 이동`);
          onSliceChange(middleSlice);
        }
        
      } else {
        console.error("❌ 유효하지 않은 NIfTI 파일");
        alert('Not a valid NIFTI file');
      }
    };
    
    reader.onerror = (error) => {
      console.error("📁 파일 읽기 오류:", error);
    };
    
    reader.readAsArrayBuffer(niiFile);
  }, [niiFile, currentPlane]);

  if (!sliceImages.length) {
    return (
      <div className="text-white flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <div>Loading slices...</div>
          {dimensions.x > 0 && (
            <div className="text-sm text-gray-400 mt-2">
              Dimensions: {dimensions.x} × {dimensions.y} × {dimensions.z}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <PlaneSelector currentPlane={currentPlane} onPlaneChange={onPlaneChange} />
      
      <div className="h-full flex items-center justify-center">
        <div className="w-full h-full bg-black rounded-lg flex items-center justify-center border border-gray-600">
          {sliceImages[selectedSlice % sliceImages.length] ? (
            <img
              src={sliceImages[selectedSlice % sliceImages.length]}
              alt={`Brain slice ${selectedSlice + 1}`}
              className="w-400 h-400 object-contain"
              onLoad={() => console.log("🎨 이미지 로딩 완료")}
              onError={(e) => console.error("🚫 이미지 로딩 오류:", e)}
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
      
      <SliceNavigator
        selectedSlice={selectedSlice}
        totalSlices={totalSlices}
        onSliceChange={onSliceChange}
      />
      
      {/* 디버그 정보 */}
      <div className="absolute top-2 right-2 text-xs text-gray-400 bg-black bg-opacity-75 p-3 rounded">
        <div>Plane: {currentPlane}</div>
        <div>Slice: {selectedSlice + 1}/{totalSlices}</div>
        <div>Dims: {dimensions.x}×{dimensions.y}×{dimensions.z}</div>
        <div className="mt-2 text-yellow-400">
          🔍 브라우저 콘솔에서 픽셀 값 확인
        </div>
      </div>
    </div>
  );
};

export default BrainViewer2D;
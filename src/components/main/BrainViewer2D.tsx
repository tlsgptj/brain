"use client";

import React from 'react';
import PlaneSelector from './PlaneSelector';
import SliceNavigator from './SliceNavigator';

const BrainViewer2D = ({ 
  currentPlane, 
  onPlaneChange,
  selectedSlice,
  totalSlices,
  onSliceChange,
  sliceImages = []
}) => {
  // Mock brain slice data - replace with actual NII data
  const generateMockSlice = (index) => {
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="brain${index}" cx="50%" cy="50%" r="50%">
            <stop offset="0%" style="stop-color:#f0f0f0;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#d0d0d0;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#909090;stop-opacity:1" />
          </radialGradient>
        </defs>
        <ellipse cx="150" cy="150" rx="130" ry="120" fill="url(#brain${index})" stroke="#666" stroke-width="2"/>
        <ellipse cx="110" cy="120" rx="35" ry="30" fill="#a0a0a0" opacity="0.7"/>
        <ellipse cx="190" cy="120" rx="35" ry="30" fill="#a0a0a0" opacity="0.7"/>
        <path d="M90,180 Q150,150 210,180 Q150,210 90,180" fill="#888" opacity="0.8"/>
        <circle cx="${120 + index*2}" cy="${140 + index*3}" r="${12 + index}" fill="#666" opacity="0.6"/>
      </svg>
    `)}`;
  };

  const mockSlices = Array.from({length: 5}, (_, i) => ({
    id: i,
    url: generateMockSlice(i)
  }));

  return (
    <div className="relative h-full">
      <PlaneSelector 
        currentPlane={currentPlane}
        onPlaneChange={onPlaneChange}
      />
      
      <div className="h-full flex items-center justify-center">
        <div className="w-96 h-96 bg-black rounded-lg flex items-center justify-center">
          <img 
            src={mockSlices[selectedSlice % mockSlices.length].url}
            alt={`Brain slice ${selectedSlice + 1}`}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </div>
      
      <SliceNavigator 
        selectedSlice={selectedSlice}
        totalSlices={totalSlices}
        onSliceChange={onSliceChange}
      />
      
      {/* Thumbnail strip */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2">
        {mockSlices.map((slice, i) => (
          <button
            key={slice.id}
            onClick={() => onSliceChange(i)}
            className={`w-16 h-16 rounded border-2 overflow-hidden transition-all ${
              selectedSlice === i ? 'border-pink-500' : 'border-gray-600'
            }`}
          >
            <img 
              src={slice.url} 
              alt={`Slice ${i + 1}`} 
              className="w-full h-full object-cover" 
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default BrainViewer2D;
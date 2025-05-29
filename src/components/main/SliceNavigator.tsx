"use client";

import React from 'react';

const SliceNavigator = ({ 
  selectedSlice, 
  totalSlices, 
  onSliceChange 
}) => {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
      <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 min-w-80">
        <div className="flex items-center gap-4">
          <span className="text-white text-sm font-medium">Slice:</span>
          <input
            type="range"
            min="0"
            max={totalSlices - 1}
            value={selectedSlice}
            onChange={(e) => onSliceChange(parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${(selectedSlice / (totalSlices - 1)) * 100}%, #374151 ${(selectedSlice / (totalSlices - 1)) * 100}%, #374151 100%)`
            }}
          />
          <span className="text-white text-sm font-mono min-w-16 text-right">
            {selectedSlice + 1}/{totalSlices}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SliceNavigator;
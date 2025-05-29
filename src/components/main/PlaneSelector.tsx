"use client";

import React from 'react';

const PlaneSelector = ({ currentPlane, onPlaneChange }) => {
  const planes = ['axial', 'coronal', 'sagittal'];

  return (
    <div className="absolute top-4 left-4 z-10 space-y-2">
      {planes.map((plane) => (
        <button
          key={plane}
          onClick={() => onPlaneChange(plane)}
          className={`block w-20 h-16 rounded-lg border-2 transition-all ${
            currentPlane === plane 
              ? 'border-pink-500 bg-pink-500/20' 
              : 'border-gray-600 bg-gray-800/80 hover:border-gray-500'
          }`}
        >
          <div className="text-xs font-medium text-white capitalize mb-1">
            {plane}
          </div>
          <div className="w-12 h-8 mx-auto bg-gray-600 rounded opacity-60"></div>
        </button>
      ))}
    </div>
  );
};

export default PlaneSelector;
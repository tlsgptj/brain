"use client";

import React, { useState } from 'react';

const BrainViewer3D = ({ totalSlices }) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (e.buttons === 1) {
      setRotation(prev => ({
        x: prev.x + e.movementY * 0.5,
        y: prev.y + e.movementX * 0.5
      }));
    }
  };

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      <div 
        className="w-full h-full flex items-center justify-center cursor-move"
        onMouseMove={handleMouseMove}
      >
        <div 
          className="w-96 h-96 transition-transform duration-100"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* 3D Brain Visualization */}
          <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-gradient-radial from-gray-300 via-gray-400 to-gray-600 rounded-full opacity-80"></div>
            <div className="absolute inset-4 bg-gradient-radial from-gray-200 via-gray-300 to-gray-500 rounded-full opacity-60"></div>
            <div className="absolute inset-8 bg-gradient-radial from-gray-100 via-gray-200 to-gray-400 rounded-full opacity-40"></div>
            
            {/* Brain structure highlights */}
            <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-blue-400 rounded-full opacity-30 animate-pulse"></div>
            <div className="absolute top-1/4 right-1/4 w-16 h-16 bg-blue-400 rounded-full opacity-30 animate-pulse" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 w-20 h-12 bg-green-400 rounded-full opacity-25"></div>
          </div>
        </div>
      </div>
      
      <div className="absolute top-4 right-4 text-white text-sm bg-black/50 rounded px-3 py-2">
        Click and drag to rotate
      </div>
      
      <div className="absolute bottom-4 left-4 text-white text-xs bg-black/50 rounded px-3 py-2">
        3D View - {totalSlices} layers
      </div>
    </div>
  );
};

export default BrainViewer3D;
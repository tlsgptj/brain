"use client";

import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

const FileUpload = ({ onFileUpload, isLoading = false }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.nii')) {
      onFileUpload(file);
    } else {
      alert('Please upload a valid .nii file');
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Processing NII file...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold mb-2">Upload NII File</h3>
        <p className="text-gray-400 mb-4">Upload a .nii file to view medical imaging data</p>
        <button 
          onClick={handleClick}
          className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-lg transition-colors"
        >
          Choose File
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".nii"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default FileUpload;
"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import logo from '../../../public/images/logo.png';

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
      <div className="h-full w-full flex items-center justify-center">
        <div className="text-center mt-32">
          <div className="w-100 h-100 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-7xl mt-10">Processing NII file...</p>
        </div>
      </div>
    );
  }

return (
    <div className="h-full flex items-center justify-center">
        <div className="relative w-1000 h-120 flex items-center justify-center">
            <Image
                src={logo}
                alt="main logo"
                fill
                className="object-contain"
                priority
            />
        </div>
    </div>
);
};

export default FileUpload;
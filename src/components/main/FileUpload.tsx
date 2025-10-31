"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import logo from '../../../public/images/logo.png';

// @ts-ignore
const FileUpload = ({ onFileUpload, isLoading = false }) => {
  const fileInputRef = useRef(null);

  // @ts-ignore
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && (file.name.endsWith('.nii') || file.name.endsWith('.nii.gz'))) {
      onFileUpload(file);
    } else {
      alert('Please upload a valid .nii or .nii.gz file');
    }
  };

  const handleClick = () => {
    // @ts-ignore
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
    <div className="h-full flex flex-col items-center justify-center">
      <input
        ref={fileInputRef}
        type="file"
        accept=".nii,.nii.gz"   
        onChange={handleFileSelect}
        className="hidden"
      />

      <div
        onClick={handleClick}
        className="cursor-pointer relative w-[400px] h-[120px] flex items-center justify-center hover:opacity-90"
      >
        <Image
          src={logo}
          alt="main logo"
          fill
          className="object-contain"
          priority
        />
      </div>
      <p className="mt-6 text-lg text-gray-600">Click logo to upload .nii or .nii.gz file</p>
    </div>
  );
};

export default FileUpload;

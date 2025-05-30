'use client'

import React, { useState, useRef } from 'react';
import Header from '../../components/main/Header';
import Sidebar from '../../components/main/Sidebar';
import FileUpload from '../../components/main/FileUpload';
import BrainViewer2D from '../../components/main/BrainViewer2D';
import BrainViewer3D from '../../components/main/BrainViewer3D';
import PatientInfoPanel from '../../components/main/PatientInfoPanel';

const MainLayout = () => {
  const [currentView, setCurrentView] = useState('2d');
  const [selectedSlice, setSelectedSlice] = useState(0);
  const [currentPlane, setCurrentPlane] = useState('axial');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('activity');
  const [patientData, setPatientData] = useState({});
  const fileInputRef = useRef(null);
  
  const sliceCount = 155;

  const handleFileUpload = (file) => {
    setIsLoading(true);
    setUploadedFile(file);
    
    // Simulate file processing
    setTimeout(() => {
      setIsLoading(false);
      // You can set patient data here after processing the file
      setPatientData({
        id: 'P001',
        gender: 'Unknown',
        dateOfBirth: 'Unknown'
      });
    }, 2000);
  };

  const handle3DConversion = () => {
    setCurrentView('3d');
  };

  const handleAnalyze = () => {
    alert('Analysis functionality would be implemented here');
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const renderViewer = () => {
    if (!uploadedFile) {
      return (
        <FileUpload 
          onFileUpload={handleFileUpload}
          isLoading={isLoading}
        />
      );
    }

    if (isLoading) {
      return (
        <FileUpload 
          onFileUpload={handleFileUpload}
          isLoading={isLoading}
        />
      );
    }

    if (currentView === '2d') {
      return (
        <BrainViewer2D
          niiFile={uploadedFile}
          currentPlane={currentPlane}
          onPlaneChange={setCurrentPlane}
          selectedSlice={selectedSlice}
          totalSlices={sliceCount}
          onSliceChange={setSelectedSlice}
        />
      );
    }

    return (
      <BrainViewer3D
        totalSlices={sliceCount}
      />
    );
  };

  return (
    <div className="h-1170 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <Header />
      
      <div className="flex h-1170">
        <Sidebar 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Viewer Area */}
          <div className="flex-1">
            <div className="relative h-1170 bg-black rounded-lg overflow-hidden">
              {renderViewer()}
            </div>
          </div>

          {/* Right Panel */}
          <PatientInfoPanel
            patientData={patientData}
            onUpload={handleUploadClick}
            on3DConversion={handle3DConversion}
            onAnalyze={handleAnalyze}
            hasFile={!!uploadedFile}
          />
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".nii"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) handleFileUpload(file);
        }}
        className="hidden"
      />
    </div>
  );
};

export default MainLayout;
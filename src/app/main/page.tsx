'use client'

import React, { useState, useRef } from 'react';
import Header from '../../components/main/Header';
import Sidebar from '../../components/main/Sidebar';
import FileUpload from '../../components/main/FileUpload';
import BrainViewer2D from '../../components/main/BrainViewer2D';
import BrainViewer3D from '../../components/main/BrainViewer3D';
import PatientInfoPanel from '../../components/main/PatientInfoPanel';
import { useAnalysisStore } from '@/stores/analysisStore';
import { uploadNifti, type Plane } from '@/api/main_api';

const MainLayout = () => {
  const [currentView, setCurrentView] = useState<'2d' | '3d'>('2d');
  const [selectedSlice, setSelectedSlice] = useState(0);
  const [currentPlane, setCurrentPlane] = useState<Plane>('axial');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('activity');
  const [patientData, setPatientData] = useState({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const sliceCount = 155;

  const setAnalysisText = useAnalysisStore((state) => state.setAnalysisText);
  const setAnalysisData = useAnalysisStore((state) => state.setAnalysisData);

  const handleFileUpload = async (file: File) => {
    try {
      setIsLoading(true);
      setUploadedFile(file);

      const { session_id } = await uploadNifti(file);
      setSessionId(session_id);

      // 임시 환자 메타 (실제 메타가 있다면 백엔드 값으로 세팅)
      setPatientData({
        id: session_id.slice(0, 8),
        gender: 'Unknown',
        dateOfBirth: 'Unknown',
      });
    } catch (e: any) {
      console.error(e);
      alert(e.message ?? 'Upload failed');
      setUploadedFile(null);
      setSessionId('');
    } finally {
      setIsLoading(false);
    }
  };

  const handle3DConversion = () => {
    setCurrentView('3d');
  };

  const handleAnalyze = () => {
  const dummyText = `Tumor size: 2.3 cm
                    Location: Left frontal lobe
                    Assessment: High likelihood of being benign`;

  const dummyData = {
    eeg: [12, 18, 15, 20, 22, 19, 16],  // 뇌파 값 (예시)
    tumorVolume: 3.5,  // cm³
    confidence: 87,    // %
  };

  setAnalysisText(dummyText);
  setAnalysisData(dummyData);
};


  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const renderViewer = () => {
    if (!uploadedFile || isLoading) {
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

    // 3D 뷰
    return (
      <BrainViewer3D
        imageUrl={uploadedFile}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <Header />

      <div className="flex h-1170">
        <Sidebar
          activeTab={activeTab}
          onTabChange={() => setActiveTab('activity')}
        />

        <div className="flex-1 flex">
          <div className="flex-1">
            <div className="relative h-1170 bg-black rounded-lg overflow-hidden">
              {renderViewer()}
            </div>
          </div>

          <PatientInfoPanel
            patientData={patientData}
            onUpload={handleUploadClick}
            on3DConversion={handle3DConversion}
            onAnalyze={handleAnalyze}
            hasFile={!!uploadedFile}
          />
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".nii"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
        className="hidden"
      />
    </div>
  );
};

export default MainLayout;

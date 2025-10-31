'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import Header from '../../components/main/Header';
import Sidebar from '../../components/main/Sidebar';
import FileUpload from '../../components/main/FileUpload';
import BrainViewer2D from '../../components/main/BrainViewer2D';
import BrainViewer3D from '../../components/main/BrainViewer3D';
import BrainSliceViewer from '../../components/main/BrainSliceViewer';
import PatientInfoPanel from '../../components/main/PatientInfoPanel';
import { useAnalysisStore } from '@/stores/analysisStore';
import { uploadNifti, type Plane } from '@/api/main_api';

// Sidebar 탭 타입(사이드바에 맞게 필요 시 수정)
type SidebarTab = 'activity' | 'brain' | 'eye' | 'info' | 'settings';

const DEFAULT_SLICE_COUNT = 155;

const MainLayout: React.FC = () => {
  const [currentView, setCurrentView] = useState<'2d' | '3d'>('2d');
  const [currentPlane, setCurrentPlane] = useState<Plane>('axial');
  const [selectedSlice, setSelectedSlice] = useState(0);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<SidebarTab>('activity');
  const [patientData, setPatientData] = useState<Record<string, unknown>>({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const setAnalysisText = useAnalysisStore((s) => s.setAnalysisText);
  const setAnalysisData = useAnalysisStore((s) => s.setAnalysisData);

  const sliceCount = useMemo(() => DEFAULT_SLICE_COUNT, []);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileUpload = useCallback(
    async (file: File) => {
      try {
        setIsLoading(true);
        setUploadedFile(null);
        setUploadedFileUrl(null);

        const { session_id, input_url } = (await uploadNifti(file)) as {
          session_id: string;
          input_url?: string;
        };
        setSessionId(session_id);

        if (input_url && input_url.trim()) {
          console.log('[UPLOAD] NIfTI uploaded (URL):', input_url);
          setUploadedFileUrl(input_url);
        } else {
          console.warn('[UPLOAD] No input_url from API — fallback to local File.');
          setUploadedFile(file);
        }

        setPatientData({
          id: session_id.slice(0, 8),
          gender: 'Unknown',
          dateOfBirth: 'Unknown',
        });

        setCurrentView('2d');
        setSelectedSlice(Math.floor(sliceCount / 2));
      } catch (e: any) {
        console.error(e);
        alert(e?.message ?? 'Upload failed');
        setUploadedFile(null);
        setUploadedFileUrl(null);
        setSessionId('');
      } finally {
        setIsLoading(false);
      }
    },
    [sliceCount]
  );

  const handle3DConversion = useCallback(() => {
    if (!uploadedFile && !uploadedFileUrl) return;
    setCurrentView('3d');
  }, [uploadedFile, uploadedFileUrl]);

  const handleAnalyze = useCallback(() => {
    const dummyText = [
      'Tumor size: 2.3 cm',
      'Location: Left frontal lobe',
      'Assessment: High likelihood of being benign',
    ].join('\n');
    const dummyData = { eeg: [12, 18, 15, 20, 22, 19, 16], tumorVolume: 3.5, confidence: 87 };

    setAnalysisText(dummyText);
    setAnalysisData(dummyData);
  }, [setAnalysisData, setAnalysisText]);

  const onTabChange = useCallback((tab: SidebarTab) => {
    setActiveTab(tab);
  }, []);

  const onFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void handleFileUpload(file);
    },
    [handleFileUpload]
  );

  const renderViewer = useCallback(() => {
    const source: string | File | null = uploadedFileUrl ?? uploadedFile ?? null;

    console.log('[📂 MainLayout] source:', source);
    console.log('[📂 MainLayout] sessionId:', sessionId);
    console.log('[📂 MainLayout] currentView:', currentView);

    if (!source || isLoading) {
      return <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />;
    }

    if (currentView === '2d') {
      if (source instanceof File) {
        return (
          <BrainViewer2D
            niiFile={source}
            currentPlane={currentPlane}
            onPlaneChange={setCurrentPlane}
            selectedSlice={selectedSlice}
            totalSlices={sliceCount}
            onSliceChange={setSelectedSlice}
            // 서버 PNG 슬라이스 모드가 필요하면 아래 주석 해제:
            // useApiSlices
            // sessionId={sessionId}
          />
        );
      }
      return <BrainSliceViewer imageUrl={source} viewType="axial" />;
    }

    return <BrainViewer3D imageUrl={source!} sessionId={sessionId || undefined} />;
  }, [
    uploadedFile,
    uploadedFileUrl,
    isLoading,
    handleFileUpload,
    currentView,
    currentPlane,
    selectedSlice,
    sliceCount,
    sessionId,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <Header />

      <div className="flex h-1170">
        <Sidebar activeTab={activeTab} onTabChange={onTabChange} />

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
            hasFile={Boolean(uploadedFile || uploadedFileUrl)}
            currentView={currentView}
            setCurrentView={setCurrentView}
          />
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".nii,.nii.gz"
        onChange={onFileInputChange}
        className="hidden"
      />
    </div>
  );
};

export default MainLayout;

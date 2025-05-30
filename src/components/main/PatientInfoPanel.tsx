"use client";
import React from 'react';
import { Info, Upload, Move3D, Activity } from 'lucide-react';

interface PatientData {
  id?: string;
  gender?: string;
  dateOfBirth?: string;
  surgicalInfo?: string;
  diagnosticResult?: string;
}

interface PatientInfoPanelProps {
  patientData?: PatientData;
  onUpload: () => void;
  on3DConversion: () => void;
  onAnalyze: () => void;
  hasFile?: boolean;
}


const PatientInfoPanel: React.FC<PatientInfoPanelProps> = ({
  patientData = {},
  onUpload,
  on3DConversion,
  onAnalyze,
  hasFile = false
}) => {

  const samplePatientData = {
    id: "P-2024-001",
    gender: "Female",
    dateOfBirth: "1985-03-15",
    surgicalInfo: "Scheduled for arthroscopic knee surgery. Previous medical history includes hypertension managed with medication.",
    diagnosticResult: "MRI shows moderate cartilage damage in the medial compartment. Recommended minimally invasive surgical intervention."
  };

  return (
    <div className="h-1170 w-400 bg-gray-900">
      {/* 메인 콘텐츠 영역 */}
      <div className="p-8 space-y-8">
        <div className="bg-gray-800 rounded-lg p-8 text-white">
          <h1 className="text-9xl font-bold mb-8">Medical Analysis Dashboard</h1>
          
          {/* Patient Info */}
          <div className="bg-voodoo-950 rounded-lg p-6 mb-8">
            <h3 className="text-7xl font-semibold mb-6 flex items-center gap-3 text-white">
              <Info className="w-20 h-20" />
              Patient Info
            </h3>
            <div className="space-y-2 text-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-7xl leading-tight">Patient ID</span>
                <span className="font-medium text-white text-7xl leading-tight">{samplePatientData.id || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-7xl leading-tight">Gender</span>
                <span className="font-medium text-white text-7xl leading-tight">{samplePatientData.gender || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-7xl leading-tight">Date of birth</span>
                <span className="font-medium text-white text-7xl leading-tight">{samplePatientData.dateOfBirth || '-'}</span>
              </div>
            </div>
          </div>

          <div className="bg-voodoo-950 rounded-lg p-6 mb-8">
            <h3 className="text-7xl font-semibold mb-6 text-white">Surgical Risk Assessment</h3>
            <div className="flex items-center justify-center">
              <div className="relative w-200 h-200">
                <svg className="w-200 h-200 transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#374151"
                    strokeWidth="8"
                    fill="none"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#14b8a6"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${75 * 2.51} 251.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-9xl font-bold text-white">75%</div>
                    <div className="text-7xl text-gray-400">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-6xl text-center text-gray-300">
              Arthroscopic knee surgery with low complexity
            </div>
          </div>

          {/* Diagnostic Result */}
            <div className="bg-voodoo-950 rounded-lg p-6 mb-20">
            <h3 className="text-7xl font-semibold mb-6 text-white mb-8">Diagnostic Analysis</h3>
            <div className="space-y-8 mb-8">
              <div className="flex items-center justify-between mb-8">
              <span className="text-gray-300 text-7xl mb-8">Cartilage Damage</span>
              <div className="flex items-center gap-6">
                <div className="w-96 bg-gray-600 rounded-full h-8">
                <div className="bg-yellow-500 h-8 rounded-full" style={{width: '60%'}}></div>
                </div>
                <span className="text-white font-medium w-32 text-7xl">60%</span>
              </div>
              </div>
              
              <div className="flex items-center justify-between">
              <span className="text-gray-300 text-7xl mb-8">Inflammation Level</span>
              <div className="flex items-center gap-6">
                <div className="w-96 bg-gray-600 rounded-full h-8">
                <div className="bg-orange-500 h-8 rounded-full" style={{width: '45%'}}></div>
                </div>
                <span className="text-white font-medium w-32 text-7xl">45%</span>
              </div>
              </div>
              
              <div className="flex items-center justify-between">
              <span className="text-gray-300 text-7xl mb-8">Bone Density</span>
              <div className="flex items-center gap-6">
                <div className="w-96 bg-gray-600 rounded-full h-8">
                <div className="bg-green-500 h-8 rounded-full" style={{width: '85%'}}></div>
                </div>
                <span className="text-white font-medium w-32 text-7xl">85%</span>
              </div>
              </div>
              
              <div className="flex items-center justify-between">
              <span className="text-gray-300 text-7xl">Recovery Potential</span>
              <div className="flex items-center gap-6">
                <div className="w-96 bg-gray-600 rounded-full h-8">
                <div className="bg-teal-500 h-8 rounded-full" style={{width: '78%'}}></div>
                </div>
                <span className="text-white font-medium w-32 text-7xl">78%</span>
              </div>
              </div>
            </div>
            </div>

          {/* Action Buttons */}
            <div className="space-y-4">
            <button onClick={onUpload} className="w-full bg-teal-400 hover:bg-pink-500 py-5 px-7 rounded-[30px] transition-colors flex items-center justify-center gap-4 text-7xl font-medium text-white cursor-pointer">
              Upload
            </button>
            
            <button
              onClick={on3DConversion}
              disabled={!hasFile}
              className={`w-full py-5 px-7 rounded-[30px] transition-colors flex items-center justify-center gap-4 text-7xl font-medium ${
              hasFile
                ? 'bg-teal-400 hover:bg-pink-500 text-white'
                : 'bg-gray-600 cursor-not-allowed opacity-60 text-gray-400'
              }`}
            >
              3D Conversion
            </button>
            
            <button
              onClick={onAnalyze}
              disabled={!hasFile}
              className={`w-full py-5 px-7 rounded-[30px] transition-colors flex items-center justify-center gap-4 text-7xl font-medium ${
              hasFile
                ? 'bg-teal-400 hover:bg-pink-500 text-white'
                : 'bg-gray-600 cursor-not-allowed opacity-60 text-gray-400'
              }`}
            >
              Analyze
            </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PatientInfoPanel;

"use client";
import React from 'react';

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
// @ts-ignore
const ProgressBar = ({ value, color = "bg-pink-500" }) => (
    <div className="w-full bg-gray-300 bg-opacity-30 rounded-full h-6">
      <div 
        className={`${color} h-6 rounded-full transition-all duration-300`}
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
// @ts-ignore
  const PieChart = ({ percentage, color = "#ec4899" }) => {
    const radius = 160; // 기존 45에서 70으로 증가
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
    const size = 400; // 기존 128(32*4)에서 160으로 증가

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* 배경 원 */}
            <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#D1D5DB" 
            strokeWidth="30"
            fill="transparent"
            />
          {/* 진행률 원 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="30"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
      </div>
    );
  };

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
      <div className="p-8 space-y-8">
        <div className="bg-gray-800 rounded-lg p-8 text-white">
          
            <div className="w-full space-y-16">
              
              <div className="bg-[#402941] bg-opacity-60 backdrop-blur-sm rounded-4xl p-16 border-4 border-[#402941] border-opacity-80 w-full">
              <h2 className="text-white text-7xl font-semibold mb-12">Patient Info</h2>
              <div className="space-y-12">
                <div>
                <div className="flex justify-between items-center mb-10">
                  <span className="text-gray-300 text-7xl font-medium">Age Distribution</span>
                </div>
                <div className="text-7xl"><ProgressBar value={65} color="bg-gradient-to-r from-pink-500 to-pink-400" /></div>
                </div>
                <div>
                <div className="flex justify-between items-center mb-10">
                  <span className="text-gray-300 text-7xl font-medium">Gender</span>
                </div>
                <div className="text-7xl"><ProgressBar value={100} color="bg-gradient-to-r from-purple-500 to-purple-400" /></div>
                </div>
                <div>
                <div className="flex justify-between items-center mb-10">
                  <span className="text-gray-300 text-7xl font-medium">Risk Score</span>
                </div>
                <div className="text-7xl"><ProgressBar value={45} color="bg-gradient-to-r from-pink-500 to-pink-400" /></div>
                </div>
              </div>
              </div>

              <div className="bg-[#402941] bg-opacity-60 backdrop-blur-sm rounded-4xl p-16 border-4 border-[#402941] border-opacity-80 w-full">
              <h2 className="text-white text-7xl font-semibold mb-12">Surgical Info</h2>
              <div className="grid grid-cols-2 gap-16">
                <div className="text-center">
                <h3 className="text-gray-300 text-7xl font-medium mb-8">Surgical Risk Level</h3>
                <div className="flex justify-center text-7xl mt-25">
                  <PieChart percentage={75} color="#ec4899" />
                </div>
                </div>
                <div className="text-center">
                <h3 className="text-gray-300 text-7xl font-medium mb-8">Reoperation Probability</h3>
                <div className="flex justify-center text-7xl">
                  <PieChart percentage={60} color="#ec4899" />
                </div>
                </div>
              </div>
              </div>

              <div className="bg-[#402941] bg-opacity-60 backdrop-blur-sm rounded-4xl p-16 border-4 border-[#402941] border-opacity-80 mb-100 w-full">
              <h2 className="text-white text-7xl font-semibold mb-12">Diagnostic Info</h2>
              <div className="space-y-12">
                <div>
                <div className="flex justify-between items-center mb-10">
                  <span className="text-gray-300 text-7xl font-medium">Diagnostic Confidence</span>
                </div>
                <div className="text-7xl"><ProgressBar value={70} color="bg-gradient-to-r from-pink-500 to-pink-400" /></div>
                </div>
                <div>
                <div className="flex justify-between items-center mb-10">
                  <span className="text-gray-300 text-7xl font-medium">Risk Level</span>
                </div>
                <div className="text-7xl"><ProgressBar value={30} color="bg-gradient-to-r from-pink-500 to-pink-400" /></div>
                </div>
              </div>
              </div>
            </div>

            <div className="space-y-4">
            <button onClick={onUpload} className="w-full h-40 bg-teal-400 hover:bg-pink-500 py-5 px-7 rounded-[30px] transition-colors flex items-center justify-center gap-4 text-7xl font-medium text-white cursor-pointer">
              Upload
            </button>
            
            <button
              onClick={on3DConversion}
              disabled={!hasFile}
              className={`w-full h-40 py-5 px-7 rounded-[30px] transition-colors flex items-center justify-center gap-4 text-7xl font-medium ${
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
              className={`w-full h-40 py-5 px-7 rounded-[30px] transition-colors flex items-center justify-center gap-4 text-7xl font-medium ${
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

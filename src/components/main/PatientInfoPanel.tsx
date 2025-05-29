"use client";

import React from 'react';
import { Info, Upload, Move3D, Activity } from 'lucide-react';

const PatientInfoPanel = ({ 
  patientData = {},
  onUpload,
  on3DConversion,
  onAnalyze,
  hasFile = false
}) => {
  return (
    <div className="w-80 bg-gray-800 p-6 space-y-6">
      {/* Patient Info */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Info className="w-5 h-5" />
          Patient Info
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Patient ID</span>
            <span>{patientData.id || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Gender</span>
            <span>{patientData.gender || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Date of birth</span>
            <span>{patientData.dateOfBirth || '-'}</span>
          </div>
        </div>
      </div>

      {/* Surgical Info */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Surgical Info</h3>
        <div className="text-sm text-gray-400">
          {patientData.surgicalInfo || 'No surgical information available'}
        </div>
      </div>

      {/* Diagnostic Result */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Diagnostic Result</h3>
        <div className="text-sm text-gray-400">
          {patientData.diagnosticResult || 'Analysis pending...'}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button 
          onClick={onUpload}
          className="w-full bg-cyan-500 hover:bg-cyan-600 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Upload className="w-5 h-5" />
          Upload
        </button>
        
        <button 
          onClick={on3DConversion}
          disabled={!hasFile}
          className={`w-full py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
            hasFile 
              ? 'bg-pink-500 hover:bg-pink-600' 
              : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          <Move3D className="w-5 h-5" />
          3D Conversion
        </button>
        
        <button 
          onClick={onAnalyze}
          disabled={!hasFile}
          className={`w-full py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
            hasFile 
              ? 'bg-cyan-500 hover:bg-cyan-600' 
              : 'bg-gray-600 cursor-not-allowed'
          }`}
        >
          <Activity className="w-5 h-5" />
          Analyze
        </button>
      </div>
    </div>
  );
};

export default PatientInfoPanel;
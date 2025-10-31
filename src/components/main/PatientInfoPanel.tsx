// src/components/main/PatientInfoPanel.tsx
"use client";
import React from "react";

type View = "2d" | "3d";

export type PatientInfoPanelProps = {
  patientData: Record<string, unknown>;
  onUpload: () => void;
  on3DConversion: () => void;
  onAnalyze: () => void;
  hasFile: boolean;
  /** ← 추가 */
  currentView?: View;
  /** ← 추가 */
  setCurrentView?: React.Dispatch<React.SetStateAction<View>>;
};

const PatientInfoPanel: React.FC<PatientInfoPanelProps> = ({
  patientData,
  onUpload,
  on3DConversion,
  onAnalyze,
  hasFile,
  currentView,      // ← 추가
  setCurrentView,    // ← 추가
}) => {
  const view = currentView ?? "2d";
  const setView = setCurrentView ?? (() => {});

  return (
    <aside className="w-[340px] p-4 border-l border-gray-700 bg-gray-900">
      <div className="mb-4">
        <button onClick={onUpload} className="w-full py-2 rounded bg-slate-700 hover:bg-slate-600">
          업로드
        </button>
      </div>

      {hasFile && (
        <>
          <div className="mb-3 grid grid-cols-2 gap-2">
            <button
              className={`py-2 rounded ${view === "2d" ? "bg-pink-600" : "bg-slate-700 hover:bg-slate-600"}`}
              onClick={() => setView("2d")}
            >
              2D 보기
            </button>
            <button
              className={`py-2 rounded ${view === "3d" ? "bg-pink-600" : "bg-slate-700 hover:bg-slate-600"}`}
              onClick={() => { setView("3d"); on3DConversion(); }}
            >
              3D 보기
            </button>
          </div>

          <div className="mb-4">
            <button onClick={onAnalyze} className="w-full py-2 rounded bg-indigo-700 hover:bg-indigo-600">
              분석 실행
            </button>
          </div>
        </>
      )}

      <div className="text-sm text-slate-300 space-y-1">
        <div><b>환자 ID</b>: {(patientData as any)?.id ?? "-"}</div>
        <div><b>성별</b>: {(patientData as any)?.gender ?? "-"}</div>
        <div><b>생년월일</b>: {(patientData as any)?.dateOfBirth ?? "-"}</div>
      </div>
    </aside>
  );
};

export default PatientInfoPanel;

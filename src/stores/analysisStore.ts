import { create } from 'zustand';

interface AnalysisState {
  analysisText: string;
  analysisData: {
    eeg?: number[];  // 예: 뇌파 신호
    tumorVolume?: number;  // 예: 종양 부피
    confidence?: number;   // 예: 예측 신뢰도
  };
  setAnalysisText: (text: string) => void;
  setAnalysisData: (data: AnalysisState['analysisData']) => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  analysisText: '',
  analysisData: {},
  setAnalysisText: (text) => set({ analysisText: text }),
  setAnalysisData: (data) => set({ analysisData: data }),
}));

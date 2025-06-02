import { useRef, useEffect, useState } from "react";
import BrainSliceViewer from "./BrainSliceViewer";
import { useAnalysisStore } from '@/stores/analysisStore';
import EEGChart from "./EEGChart";
import { Brain, Activity, TrendingUp } from "lucide-react"

interface BrainViewer3DProps {
  imageUrl: string | File;
}

const BrainViewer3D: React.FC<BrainViewer3DProps> = ({ imageUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const analysisText = useAnalysisStore((state) => state.analysisText);
  const analysisData = useAnalysisStore((state) => state.analysisData);

  if (error) {
    return <div>{error}</div>;
  }

  // 3D 뷰어만 렌더링 (BrainSliceViewer 제거)
  return (
    <div className="relative flex justify-center items-center h-full w-full bg-gradient-to-br from-slate-50 to-blue-50 text-7xl">
      <BrainSliceViewer imageUrl={imageUrl} viewType="render" />

      {analysisText && (
      <div className="absolute top-40 right-40 w-600 bg-[#53041e] backdrop-blur-xl rounded-2xl shadow-2xl z-10 overflow-hidden">
        {/* Header gradient */}
        <div className="h-1 via-indigo-500"></div>

        <div className="p-6 space-y-6">
        {/* Analysis Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
          <div>
            <h3 className="font-bold text-white mb-8">Brain Analysis</h3>
            <div className="flex items-center gap-2 text-white">
            Processing Complete
            </div>
          </div>
          </div>
        </div>

        {/* Analysis Content */}
        <div className="space-y-4">
          <div className="rounded-xl p-4">
          <div className="font-bold text-[#E43276] mb-2">Analysis Results</div>
          <div className="text-white font-bold leading-relaxed">{analysisText}</div>
          </div>

          {/* EEG Section */}
          {analysisData.eeg && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
            <div>
              <div className="font-bold text-white mb-4">EEG Signals</div>
              <div className="text-white mb-4">Neural activity patterns</div>
            </div>
            </div>

            <div className="bg-white/30 backdrop-blur-md rounded-xl p-4">
            <EEGChart data={analysisData.eeg} />
            </div>
          </div>
          )}

          <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-white">Accuracy</span>
            </div>
            <div className="font-bold text-white">94.2%</div>
          </div>

          <div className="rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-white">Confidence</span>
            </div>
            <div className="font-bold text-white">87.5%</div>
          </div>
          </div>
        </div>
        </div>
      </div>
      )}
      {analysisText && (
          <div className="absolute bottom-50 left-200 w-[2000px] bg-[#53041e] backdrop-blur-xl rounded-2xl shadow-2xl z-10 overflow-hidden">
            <div className="h-1 via-blue-500"></div>
            
            <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
              <div>
                <h3 className="font-bold text-white mb-4">Additional Insight</h3>
                <div className="flex items-center gap-2 text-white">
                Brainwave Correlation
                </div>
              </div>
              </div>
            </div>
            <div className="text-white leading-relaxed">
              The correlation between the frontal and occipital lobes indicates a high synchronization,
              suggesting focused cognitive activity during scan.
            </div>
            </div>
          </div>
          )}
    </div>
  );
};

export default BrainViewer3D;

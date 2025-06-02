"use client"

import type React from "react"

import { useRef, useState, useCallback } from "react"
import BrainSliceViewer from "./BrainSliceViewer"
import { useAnalysisStore } from "@/stores/analysisStore"
import EEGChart from "./EEGChart"
import PlaneSelector from "./PlaneSelector"
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge } from "@xyflow/react"
import "@xyflow/react/dist/style.css"

interface BrainViewer3DProps {
  imageUrl: string | File
}

const initialNodes = [
  { id: "1", position: { x: 50, y: 20 }, data: { label: "Brain Analysis" } },
  { id: "2", position: { x: 150, y: 80 }, data: { label: "EEG Data" } },
  { id: "3", position: { x: 100, y: 140 }, data: { label: "Results" } },
]

const initialEdges = [
  { id: "e1-2", source: "1", target: "2", animated: true, style: { stroke: "#E43276" } },
  { id: "e2-3", source: "2", target: "3", animated: true, style: { stroke: "#3B82F6" } },
  { id: "e1-3", source: "1", target: "3", animated: true, style: { stroke: "#8B5CF6" } },
]

const insightNodes = [
  { id: "i1", position: { x: 80, y: 30 }, data: { label: "Frontal Lobe" } },
  { id: "i2", position: { x: 200, y: 60 }, data: { label: "Occipital Lobe" } },
  { id: "i3", position: { x: 140, y: 120 }, data: { label: "Correlation" } },
]

const insightEdges = [
  { id: "ie1-2", source: "i1", target: "i2", animated: true, style: { stroke: "#10B981" } },
  { id: "ie2-3", source: "i2", target: "i3", animated: true, style: { stroke: "#F59E0B" } },
  { id: "ie1-3", source: "i1", target: "i3", animated: true, style: { stroke: "#EF4444" } },
]

const BrainViewer3D: React.FC<BrainViewer3DProps> = ({ imageUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const analysisText = useAnalysisStore((state) => state.analysisText)
  const analysisData = useAnalysisStore((state) => state.analysisData)

  // Analysis panel ReactFlow state
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Insight panel ReactFlow state
  const [insightNodesState, setInsightNodes, onInsightNodesChange] = useNodesState(insightNodes)
  const [insightEdgesState, setInsightEdges, onInsightEdgesChange] = useEdgesState(insightEdges)

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  const onInsightConnect = useCallback(
    (params: any) => setInsightEdges((eds) => addEdge(params, eds)),
    [setInsightEdges],
  )

  if (error) {
    return <div>{error}</div>
  }

  // 3D 뷰어만 렌더링 (BrainSliceViewer 제거)
  return (
    <div className="relative flex justify-center items-center h-full w-full bg-gradient-to-br from-slate-50 to-blue-50 text-7xl">
      <div className="absolute top-4 left-4 z-10 w-72">
        <PlaneSelector file={imageUrl instanceof File ? imageUrl : null} />
      </div>
      <BrainSliceViewer imageUrl={imageUrl} viewType="render" />

      {/* SVG for connecting lines between panels and brain viewer */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-5">
        {analysisText && (
          <>
            {/* Line from brain center to analysis panel */}
            <line
              x1="50%"
              y1="50%"
              x2="75%"
              y2="25%"
              stroke="#E43276"
              strokeWidth="3"
              strokeDasharray="8,4"
              className="animate-pulse"
            />
            {/* Line from brain center to insight panel */}
            <line
              x1="50%"
              y1="50%"
              x2="25%"
              y2="75%"
              stroke="#3B82F6"
              strokeWidth="3"
              strokeDasharray="8,4"
              className="animate-pulse"
            />
            {/* Line connecting analysis and insight panels */}
            <line
              x1="75%"
              y1="25%"
              x2="25%"
              y2="75%"
              stroke="#8B5CF6"
              strokeWidth="2"
              strokeDasharray="5,5"
              className="animate-pulse"
            />
          </>
        )}
      </svg>

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
                  <div className="flex items-center gap-2 text-white">Processing Complete</div>
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
        <div className="absolute bottom-50 left-200 w-[500px] bg-[#53041e] backdrop-blur-xl rounded-2xl shadow-2xl z-10 overflow-hidden">
          <div className="h-1 via-blue-500"></div>

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-bold text-white mb-4">Additional Insight</h3>
                  <div className="flex items-center gap-2 text-white">Brainwave Correlation</div>
                </div>
              </div>
            </div>
            <div className="text-white leading-relaxed">
              The correlation between the frontal and occipital lobes indicates a high synchronization, suggesting
              focused cognitive activity during scan.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BrainViewer3D

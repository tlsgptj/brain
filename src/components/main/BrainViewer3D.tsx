"use client"

import type React from "react"
import { useRef, useState, useCallback, useEffect, Suspense } from "react"
import { useAnalysisStore } from "@/stores/analysisStore"
import EEGChart from "./EEGChart"
import BrainSliceViewer from "./BrainSliceViewer"
import PlaneSelector from "./PlaneSelector"
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

interface BrainViewer3DProps {
  imageUrl: string | File
}

const initialNodes = [
  {
    id: "center",
    position: { x: 2300, y: 1000 },
    data: { label: "" },
    draggable: false,
    style: { background: "none", border: "none" },
  },
  {
    id: "analysis",
    position: { x: 1500, y: 1500 },
    data: { label: "Loading..." },
    style: {
      backgroundColor: "#53041e", // 와인색 배경
      color: "#F8FAFC",           // 밝은 텍스트
      borderRadius: 24,
      padding: "20px 25px",
      boxShadow: "0 6px 12px rgba(0,0,0,0.5)",
      border: "2px solid #8B1E3F",
      fontWeight: "bold",
      fontSize: 16,
      width: 1000,
      minHeight: 500,
      overflow: "hidden",
    },
  },
  {
    id: "insight",
    position: { x: 1000, y: 200 },
    data: { label: "Insight" },
    style: {
      backgroundColor: "#53041e",
      color: "#F8FAFC",
      borderRadius: 24,
      padding: "20px 25px",
      boxShadow: "0 6px 12px rgba(0,0,0,0.5)",
      border: "2px solid #8B1E3F",
      fontWeight: "bold",
      fontSize: 16,
      width: 1000,
      minHeight: 500,
      overflow: "hidden",
    },
  },
]

const initialEdges = [
  { id: "e-center-analysis", source: "center", target: "analysis", animated: true, style: { stroke: "#E43276", strokeWidth: 8 } },
  { id: "e-center-insight", source: "center", target: "insight", animated: true, style: { stroke: "#E43276", strokeWidth: 8 } },
]

const BrainViewer3D: React.FC<BrainViewer3DProps> = ({ imageUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const analysisText = useAnalysisStore((state) => state.analysisText)
  const analysisData = useAnalysisStore((state) => state.analysisData)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  const insightText = `The correlation between the frontal and occipital lobes indicates a high synchronization, suggesting
  focused cognitive activity during scan.`

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleContextLost = (e: Event) => {
      e.preventDefault()
      console.warn('WebGL context lost')
      setError('WebGL context lost. Please reload the page.')
    }

    const handleContextRestored = () => {
      console.log('WebGL context restored')
      setError(null)
    }

    canvas.addEventListener('webglcontextlost', handleContextLost, false)
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false)

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost)
      canvas.removeEventListener('webglcontextrestored', handleContextRestored)
    }
  }, [])

  // analysisText, insightText, analysisData 변경 시 노드 업데이트 (label 안에 그래프 포함)
  useEffect(() => {
    // @ts-ignore
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === "analysis") {
          return {
            ...node,
            data: {
              ...node.data,
              label: (
                <div style={{ color: "white", fontSize: 40, lineHeight: 1.4 }}>
                  <h3 style={{ margin: "0 0 12px", fontWeight: "bold" }}>Brain Analysis</h3>
                  <div style={{ fontWeight: "normal", fontSize: 30, marginBottom: 12 }}>
                    {analysisText || "No analysis yet"}
                  </div>

                  {analysisData.eeg && (
                    <div
                      style={{
                        background: "rgba(255 255 255 / 0.15)",
                        padding: 10,
                        borderRadius: 12,
                        boxShadow: "inset 0 0 10px rgba(255,255,255,0.2)",
                      }}
                    >
                      <EEGChart data={analysisData.eeg} />
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 16,
                      fontWeight: "bold",
                      fontSize: 30,
                    }}
                  >
                    <div>
                      <div>Accuracy</div>
                      <div>94.2%</div>
                    </div>
                    <div>
                      <div>Confidence</div>
                      <div>87.5%</div>
                    </div>
                  </div>
                </div>
              ),
            },
          }
        }
        if (node.id === "insight") {
          return {
            ...node,
            data: {
              ...node.data,
              label: (
                <div style={{ color: "white", fontSize: 40, lineHeight: 1.4 }}>
                  <h3 style={{ margin: "0 0 12px", fontWeight: "bold" }}>Additional Insight</h3>
                  <div style={{ fontWeight: "normal", fontSize: 30, marginBottom: 12 }}>{insightText}</div>
                  {analysisData.eeg && (
                    <div
                      style={{
                        background: "rgba(255 255 255 / 0.15)",
                        padding: 10,
                        borderRadius: 12,
                        boxShadow: "inset 0 0 10px rgba(255,255,255,0.2)",
                      }}
                    >
                      <EEGChart data={analysisData.eeg} />
                    </div>
                  )}
                </div>
              ),
            },
          }
        }
        return node
      }),
    )
  }, [analysisText, analysisData, insightText])

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div className="relative flex justify-center items-center h-full w-full bg-gradient-to-br from-slate-50 to-blue-50 text-7xl">
      <div className="absolute top-4 left-4 z-10 w-72">
        <PlaneSelector file={imageUrl instanceof File ? imageUrl : null} currentPlane={"axial"} onPlaneChange={function (plane: "axial" | "coronal" | "sagittal"): void {
          throw new Error("Function not implemented.")
        } } />
      </div>

      <BrainSliceViewer imageUrl={imageUrl} drawingUrl="/images/BRATS_001.nii.gz" viewType="render" />

      {analysisText && (
        <div className="absolute inset-0 z-30 pointer-events-none">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
            panOnScroll
            zoomOnScroll={false}
            // @ts-ignore
            connectable={false}
          >
            <Background />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
      )}
    </div>
  )
}

export default BrainViewer3D

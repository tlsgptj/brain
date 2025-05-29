'use client'

import React from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'

const modelPath = '/images/tumor_0.glb'

function Model({ url }: { url: string }) {
  const gltf = useLoader(GLTFLoader, url)
  return <primitive object={gltf.scene} scale={0.5} dispose={null} />
}

export default function GLBViewer() {
  return (
    <div style={{ width: '100vw', height: '100vh', border: '2px solid #000' }}>
      <Canvas style={{ width: '100%', height: '100%' }} camera={{ position: [0, 0, 10] }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Model url={modelPath} />
      </Canvas>
    </div>
  )
}

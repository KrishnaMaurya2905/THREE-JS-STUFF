import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'

const modelPaths = [
  '/hybrid_galaxies.glb',
  '/individual_kingdom.glb',
  '/conversational_space.glb',
  '/models/model4.glb',
  '/models/model5.glb'
]

function LoadedModel({ path, z }) {
  const { scene } = useGLTF(path)
  return <primitive object={scene} position={[0, 0, z]} />
}

function LVHM() {
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      {modelPaths.map((path, i) => (
        <LoadedModel key={path} path={path} z={i * -5} />
      ))}
      <OrbitControls />
    </Canvas>
  )
}

export default LVHM

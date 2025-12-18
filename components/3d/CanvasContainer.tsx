import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, Environment, Stars } from '@react-three/drei'
import { Suspense } from 'react'
import AbstractBackground from './AbstractBackground'
import GraffitiScene from './GraffitiScene'

export default function CanvasContainer({ children }: { children?: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 10], fov: 45 }}
      >
        <color attach="background" args={['#050505']} />
        
        {/* Ambient setup */}
        <PerspectiveCamera makeDefault position={[0, 0, 15]} />
        <Environment preset="city" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        <Suspense fallback={null}>
          <AbstractBackground />
          <GraffitiScene />
        </Suspense>

        {children}
      </Canvas>
      
      {/* Background Gradient Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent pointer-events-none" />
    </div>
  )
}

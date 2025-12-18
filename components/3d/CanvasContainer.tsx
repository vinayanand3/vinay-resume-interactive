import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera, Environment, Stars } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Suspense } from 'react'
import GlowingParticles from './GlowingParticles'

export default function CanvasContainer({ children }: { children?: React.ReactNode }) {

  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: false, alpha: false, stencil: false, depth: false }}
        camera={{ position: [0, 0, 15], fov: 45 }}
      >
        <color attach="background" args={['#050505']} />
        
        {/* Ambient setup */}
        <PerspectiveCamera makeDefault position={[0, 0, 15]} />
        <Environment preset="city" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        <Suspense fallback={null}>
          <GlowingParticles />
        </Suspense>

        {/* Post Processing for Glow */}
        <EffectComposer>
            <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} intensity={1.5} />
        </EffectComposer>

        {children}
      </Canvas>
      
      {/* Background Gradient Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent pointer-events-none" />
    </div>
  )
}

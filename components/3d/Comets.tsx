import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Single Comet Implementation
 * Path: Starts from left (off-screen or overlapping timeline), curves into Milky Way Core.
 * Visuals: Bright Nucleus, Greenish/Blue Coma, Long Fading Tail.
 * Interaction: Flashes the core intensity ref upon impact.
 */
function SingleComet({ coreRef }: { coreRef?: React.MutableRefObject<{ intensity: number }> }) {
  const group = useRef<THREE.Group>(null!)
  const meshRef = useRef<THREE.Mesh>(null!) 
  const { viewport } = useThree()

  // --- Configuration ---
  const HEAD_SIZE = 0.04 
  const SPEED = 0.8 // Slightly faster for spiral
  const START_DELAY = 1.0 
  const SPIRAL_TURNS = 1.5 // How many times it circles before hitting core

  // --- Assets ---
  const comaTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')!
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, 'rgba(255, 255, 255, 1)')       
    g.addColorStop(0.2, 'rgba(200, 255, 220, 0.9)')   
    g.addColorStop(0.5, 'rgba(100, 200, 255, 0.3)')   
    g.addColorStop(1, 'rgba(0, 0, 0, 0)')             
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 128, 128)
    return new THREE.CanvasTexture(canvas)
  }, [])

  // --- State ---
  const state = useRef({
    phase: 'waiting' as 'waiting' | 'active' | 'impacting',
    timer: 0, 
    progress: 0,
    startAngle: 0,
    startRadius: 0
  })

  useFrame((_, delta) => {
    if (!group.current) return

    const s = state.current

    if (s.phase === 'waiting') {
        s.timer -= delta
        group.current.visible = false
        
        if (s.timer <= 0) {
            s.phase = 'active'
            s.progress = 0
            
            // Random Start Angle
            s.startAngle = Math.random() * Math.PI * 2
            // Start at the edge of the viewport (largest dimension)
            s.startRadius = Math.max(viewport.width, viewport.height) / 1.5
            
            group.current.visible = true
             // Reset opacity
            if (meshRef.current) (meshRef.current.material as THREE.Material).opacity = 0;
        }
    } 
    else if (s.phase === 'active') {
        s.progress += delta * (SPEED * 0.3) // Adjust speed scaling
        
        // Fade in
        if (s.progress < 0.2) {
             if (meshRef.current) (meshRef.current.material as THREE.Material).opacity = (s.progress / 0.2);
        }

        // Spiral Math
        // Radius decreases from StartRadius to 0
        const r = s.startRadius * (1 - s.progress)
        
        // Angle changes: moves CLOCKWISE (Negative direction)
        // Angle = Start - (Progress * Turns * 2PI)
        const theta = s.startAngle - (s.progress * SPIRAL_TURNS * Math.PI * 2)
        
        const x = r * Math.cos(theta)
        const y = r * Math.sin(theta)
        const z = 0 
        
        group.current.position.set(x, y, z)
        
        // Impact Logic
        if (s.progress >= 1) {
            s.phase = 'impacting'
            if (coreRef) coreRef.current.intensity = 1.0 
        }
    }
    else if (s.phase === 'impacting') {
        s.phase = 'waiting'
        s.timer = START_DELAY + Math.random() 
    }
  })

  return (
    <group ref={group}>
        {/* Head Visuals Only - No Trail */}
        <group>
            {/* 1. The Solid Core (Nucleus) */}
            <mesh>
                <sphereGeometry args={[HEAD_SIZE, 16, 16]} />
                <meshBasicMaterial color="#ffffff" toneMapped={false} />
            </mesh>
            
            {/* 2. The Gaseous Coma (Glow) */}
            <mesh ref={meshRef}>
                <planeGeometry args={[HEAD_SIZE * 12, HEAD_SIZE * 12]} /> 
                <meshBasicMaterial 
                    map={comaTexture}
                    transparent
                    opacity={1} 
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </mesh>
        </group>
    </group>
  )
}

export default function Comets({ coreRef }: { coreRef?: React.MutableRefObject<{ intensity: number }> }) {
  return (
    <group>
        <SingleComet coreRef={coreRef} />
    </group>
  )
}

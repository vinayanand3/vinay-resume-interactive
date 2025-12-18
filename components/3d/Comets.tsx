import { useRef, useMemo, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Trail } from '@react-three/drei'
import * as THREE from 'three'

function CometInstance({ coreRef }: { coreRef?: React.MutableRefObject<{ intensity: number }> }) {
  const group = useRef<THREE.Group>(null!)
  const meshRef = useRef<THREE.Mesh>(null!)
  const { viewport } = useThree()
  
  // State to toggle Trail visibility to prevent artifacts
  const [showTrail, setShowTrail] = useState(false)
  
  // Path: Start (Left Edge, Upper Third) -> End (Center)
  const startPos = new THREE.Vector3(-viewport.width / 2, viewport.height / 3, 0)
  const endPos = new THREE.Vector3(0, 0, 0)
  const controlPos = new THREE.Vector3(-viewport.width / 4, 0, 2) 
  
  // Create a radial gradient texture for the coma/glow
  const glowTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const context = canvas.getContext('2d')!
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.2, 'rgba(200, 255, 220, 0.8)') // Greenish tint
    gradient.addColorStop(0.5, 'rgba(200, 255, 255, 0.2)') // Bluish fade
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    context.fillStyle = gradient
    context.fillRect(0, 0, 64, 64)
    return new THREE.CanvasTexture(canvas)
  }, [])

  // State in ref to avoid re-renders during animation
  const state = useRef({
    t: 0,
    speed: 0.3, 
    delay: 2, 
    phase: 'delay' as 'delay' | 'spawning' | 'flying' | 'fading',
    opacity: 1
  })

  useFrame((_, delta) => {
    if (!group.current) return
    
    // Update State
    const s = state.current
    
    if (s.phase === 'delay') {
        s.delay -= delta
        
        // Keep forcing reset 
        group.current.position.copy(startPos)
        group.current.visible = false
        
        if (s.delay <= 0) {
            // Move to spawning phase
            s.phase = 'spawning'
            group.current.visible = true
            group.current.position.copy(startPos)
            group.current.updateMatrixWorld(true) // FORCE MATRIX UPDATE
        }
    } else if (s.phase === 'spawning') {
        // Wait one frame
        s.phase = 'flying'
        s.t = 0
        s.opacity = 1
        setShowTrail(true) // Mount trail
    } else {
        group.current.visible = true
    }

    if (s.phase === 'flying') {
        s.t += delta * s.speed
        
        // Quadratic Bezier
        const t = s.t
        const invT = 1 - t
        
        group.current.position.x = invT * invT * startPos.x + 2 * invT * t * controlPos.x + t * t * endPos.x
        group.current.position.y = invT * invT * startPos.y + 2 * invT * t * controlPos.y + t * t * endPos.y
        group.current.position.z = invT * invT * startPos.z + 2 * invT * t * controlPos.z + t * t * endPos.z
        
        // Check arrival
        if (s.t >= 1) {
            s.phase = 'fading'
            if (coreRef) {
                coreRef.current.intensity = 1.0 
            }
        }
    }

    if (s.phase === 'fading') {
        // Continue moving slightly into the core
        group.current.position.lerp(new THREE.Vector3(2, -1, -2), delta * 0.5)
        
        // Fade out
        s.opacity -= delta * 2
        if (s.opacity <= 0) {
           s.phase = 'delay'
           s.delay = Math.random() * 3 + 2 
           setShowTrail(false) // Unmount trail
        }
    }
    
    if (meshRef.current) {
        (meshRef.current.material as THREE.Material).opacity = s.opacity * 0.8;
    }
  })

  return (
    <group ref={group}>
        {/* Tail - Only render when flying/fading to avoid artifacts */}
        {showTrail && (
            <Trail
                width={2} 
                length={8} 
                color={new THREE.Color('#a0c4ff')} 
                attenuation={(t) => t * t} 
            >
                <mesh>
                    <sphereGeometry args={[0.05, 16, 16]} />
                    <meshBasicMaterial color="#ffffff" transparent opacity={0} /> 
                </mesh>
            </Trail>
        )}

        {/* Head Visuals */}
        <group rotation={[0, 0, Math.PI / 4]}>
            {/* Solid Nucleus (Core) */}
            <mesh>
                <sphereGeometry args={[0.04, 16, 16]} /> {/* Reduced head size */}
                <meshBasicMaterial color="#ffffff" toneMapped={false} transparent opacity={state.current.opacity} />
            </mesh>
            
            {/* Coma (Glow) */}
            <mesh ref={meshRef} scale={[2, 2, 1]}> 
                <planeGeometry args={[1, 1]} />
                <meshBasicMaterial 
                    map={glowTexture} 
                    transparent 
                    opacity={0.8} 
                    depthWrite={false} 
                    blending={THREE.AdditiveBlending}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    </group>
  )
}

export default function Comets({ coreRef }: { coreRef?: React.MutableRefObject<{ intensity: number }> }) {
  return (
    <group>
       <CometInstance coreRef={coreRef} />
    </group>
  )
}

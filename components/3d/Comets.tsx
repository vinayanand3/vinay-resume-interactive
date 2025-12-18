import { useRef, useMemo, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Trail } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Single Comet Implementation
 * Path: Starts from left (off-screen or overlapping timeline), curves into Milky Way Core.
 * Visuals: Bright Nucleus, Greenish/Blue Coma, Long Fading Tail.
 * Interaction: Flashes the core intensity ref upon impact.
 */
function SingleComet({ coreRef }: { coreRef?: React.MutableRefObject<{ intensity: number }> }) {
  const group = useRef<THREE.Group>(null!)
  const meshRef = useRef<THREE.Mesh>(null!) // Ref for the coma plane to pulse/fade
  const { viewport } = useThree()

  // --- Configuration ---
  const HEAD_SIZE = 0.04 // Requested 0.5x of previous
  const TAIL_WIDTH = 1.5
  const TAIL_LENGTH = 10
  const SPEED = 0.5 // Adjust for smooth motion
  const START_DELAY = 1.5 // Seconds between respawns

  // --- Assets ---
  // Texture for the Coma (Glowing Head)
  const comaTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')!
    // Radial Gradient: White Core -> Greenish Mid -> Bluish Edge -> Transparent
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, 'rgba(255, 255, 255, 1)')       // Core
    g.addColorStop(0.2, 'rgba(200, 255, 220, 0.9)')   // Greenish-White
    g.addColorStop(0.5, 'rgba(100, 200, 255, 0.3)')   // Bluish Haze
    g.addColorStop(1, 'rgba(0, 0, 0, 0)')             // Fade
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 128, 128)
    return new THREE.CanvasTexture(canvas)
  }, [])

  // --- State ---
  // We use a comprehensive state machine to manage the lifecycle and prevent artifacts
  // Phases: 'waiting' -> 'spawning' (1 frame reset) -> 'active' (flying) -> 'impacting' (fading)
  const state = useRef({
    phase: 'waiting' as 'waiting' | 'spawning' | 'active' | 'impacting',
    timer: 0, 
    progress: 0, // 0 to 1 along path
  })

  // Trail visibility toggle and ID to force fresh instance (memory wipe)
  const [trailState, setTrailState] = useState({ visible: false, id: 0 })

  // --- Path Calculations ---
  const startPos = useMemo(() => new THREE.Vector3(-viewport.width / 2 - 2, viewport.height / 4, 0), [viewport])
  const endPos = useMemo(() => new THREE.Vector3(0, 0, 0), [])
  const controlPos = useMemo(() => new THREE.Vector3(-viewport.width / 4, -2, 1), [viewport])

  useFrame((_, delta) => {
    if (!group.current) return

    const s = state.current

    if (s.phase === 'waiting') {
        s.timer -= delta
        group.current.visible = false
        
        if (s.timer <= 0) {
            s.phase = 'spawning'
            
            // Hard Reset Position
            group.current.position.copy(startPos)
            group.current.updateMatrixWorld(true)
            group.current.visible = true
            
            // Increment ID to force new Trail instance
            // We set visible to true in the NEXT frame via state to be safe
        }
    } 
    else if (s.phase === 'spawning') {
        // Wait one frame to let position settle
        s.phase = 'active'
        s.progress = 0
        setTrailState(prev => ({ visible: true, id: prev.id + 1 })) // New Key = Fresh Memory
    }
    else if (s.phase === 'active') {
        s.progress += delta * (SPEED * 0.5) 
        
        const t = s.progress
        const invT = 1 - t
        
        const x = (invT * invT * startPos.x) + (2 * invT * t * controlPos.x) + (t * t * endPos.x)
        const y = (invT * invT * startPos.y) + (2 * invT * t * controlPos.y) + (t * t * endPos.y)
        const z = (invT * invT * startPos.z) + (2 * invT * t * controlPos.z) + (t * t * endPos.z)
        
        group.current.position.set(x, y, z)
        
        if (s.progress >= 1) {
            s.phase = 'impacting'
            if (coreRef) coreRef.current.intensity = 1.0 
        }
    }
    else if (s.phase === 'impacting') {
        setTrailState(prev => ({ ...prev, visible: false })) // Cut trail
        s.phase = 'waiting'
        s.timer = START_DELAY + Math.random() 
    }
  })

  return (
    <group ref={group}>
        {/* Tail Component */}
        {trailState.visible && (
            <Trail
                key={trailState.id} // CRITICAL: Forces complete re-initialization
                width={TAIL_WIDTH}
                length={TAIL_LENGTH}
                color={new THREE.Color('#a0c4ff')} 
                attenuation={(t) => t * t} 
            >
                <mesh>
                    <sphereGeometry args={[HEAD_SIZE, 8, 8]} />
                    <meshBasicMaterial visible={false} /> 
                </mesh>
            </Trail>
        )}

        {/* Head Visuals */}
        <group>
            {/* 1. The Solid Core (Nucleus) */}
            <mesh>
                <sphereGeometry args={[HEAD_SIZE, 16, 16]} />
                <meshBasicMaterial color="#ffffff" toneMapped={false} />
            </mesh>
            
            {/* 2. The Gaseous Coma (Glow) */}
            <mesh ref={meshRef}>
                <planeGeometry args={[HEAD_SIZE * 12, HEAD_SIZE * 12]} /> {/* Scaled up for glow */}
                <meshBasicMaterial 
                    map={comaTexture}
                    transparent
                    opacity={0.8}
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

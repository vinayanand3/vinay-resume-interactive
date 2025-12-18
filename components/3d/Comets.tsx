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

  // Trail visibility toggle (for glitch prevention)
  const [trailVisible, setTrailVisible] = useState(false)

  // --- Path Calculations ---
  // Start: Left side, slightly upper
  const startPos = useMemo(() => new THREE.Vector3(-viewport.width / 2 - 2, viewport.height / 4, 0), [viewport])
  // End: Absolute Center (Core)
  const endPos = useMemo(() => new THREE.Vector3(0, 0, 0), [])
  // Control Point: Pulls the curve slightly downwards or outwards
  const controlPos = useMemo(() => new THREE.Vector3(-viewport.width / 4, -2, 1), [viewport])

  useFrame((_, delta) => {
    if (!group.current) return

    const s = state.current

    // --- Phase Logic ---

    if (s.phase === 'waiting') {
        s.timer -= delta
        group.current.visible = false
        
        if (s.timer <= 0) {
            // Transition to Spawning
            s.phase = 'spawning'
            
            // Hard Reset Position
            group.current.position.copy(startPos)
            // Force Matrix Update to establish position in World Space
            group.current.updateMatrixWorld(true)
            
            // Make visible but don't enable trail yet
            group.current.visible = true
        }
    } 
    else if (s.phase === 'spawning') {
        // Hold for one frame to let position settle (prevents trail interpolation streak)
        s.phase = 'active'
        s.progress = 0
        setTrailVisible(true) // Enable Trail
    }
    else if (s.phase === 'active') {
        // Move along Bezier Curve
        s.progress += delta * (SPEED * 0.5) // Adjust speed scale
        
        const t = s.progress
        const invT = 1 - t
        
        // Quadratic Bezier Formula
        // P = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
        const x = (invT * invT * startPos.x) + (2 * invT * t * controlPos.x) + (t * t * endPos.x)
        const y = (invT * invT * startPos.y) + (2 * invT * t * controlPos.y) + (t * t * endPos.y)
        const z = (invT * invT * startPos.z) + (2 * invT * t * controlPos.z) + (t * t * endPos.z)
        
        group.current.position.set(x, y, z)
        
        // Facing adjustment (optional, mostly for non-spherical heads)
        // group.current.lookAt(endPos) 

        // Check Impact
        if (s.progress >= 1) {
            s.phase = 'impacting'
            
            // TRIGGER CORE INTERACTION
            if (coreRef) {
                coreRef.current.intensity = 1.0 // Bright Flash
            }
        }
    }
    else if (s.phase === 'impacting') {
        // Disappear/Fade quickly
        // We can just immediately reset for now, or fade opacity?
        // Let's reset immediately to keep it sharp or small fade:
        
        setTrailVisible(false) // Cut trail immediately
        s.phase = 'waiting'
        s.timer = START_DELAY + Math.random() // Randomize next spawn slightly
        
        // Optional: continue motion slightly through core? 
        // For "feeding" effect, maybe it just shrinks.
    }
  })

  return (
    <group ref={group}>
        {/* Tail Component */}
        {trailVisible && (
            <Trail
                width={TAIL_WIDTH}
                length={TAIL_LENGTH}
                color={new THREE.Color('#a0c4ff')} // Silvery Blue
                attenuation={(t) => t * t} // Taper to nothing
            >
                <mesh>
                    <sphereGeometry args={[HEAD_SIZE, 8, 8]} />
                    <meshBasicMaterial visible={false} /> {/* Invisible mesh for trail anchor */}
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

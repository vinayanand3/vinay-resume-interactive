import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Trail } from '@react-three/drei'
import * as THREE from 'three'

function Comet({ startY, speed, delay }: { startY: number, speed: number, delay: number }) {
  const group = useRef<THREE.Group>(null!)
  const { viewport } = useThree()
  
  // Random start position (off-screen left)
  const xStart = -viewport.width / 2 - Math.random() * 10 - delay

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

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    if (group.current) {
        // Move left to right, slightly downward curve
        const t = (time * speed + delay)
        const distance = t % (viewport.width + 20)
        
        const x = xStart + distance
        // Gentle arc: y = startY - slight curve
        // Using sine to modulate Y slightly for "organic" flight? 
        // Or just a linear path with slight offset. 
        // User asked for "Ghostly beacon", simple straight or slight arc is best.
        const y = startY - Math.sin(t * 0.1) * 0.5 
        
        group.current.position.set(x, y, -2)
        
        // Reset logic handled by modulo, but we might want to vary Y on reset
        // To strictly "respawn" with new random Y, we'd need state, but simple loop is fine for background.
    }
  })

  return (
    <group ref={group}>
        {/* Tail */}
        <Trail
            width={3} // Width of the trail
            length={12} // Length of the trail
            color={new THREE.Color('#a0c4ff')} // Silvery/Bluish
            attenuation={(t) => t * t} // Tapering
        >
            <mesh>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.3} /> 
            </mesh>
        </Trail>

        {/* Head Visuals */}
        <group rotation={[0, 0, Math.PI / 4]}> {/* Rotate to align glow if needed */}
             {/* Solid Nucleus (Core) */}
            <mesh>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshBasicMaterial color="#ffffff" toneMapped={false} />
            </mesh>
            
            {/* Coma (Glow) */}
            <mesh scale={[4, 4, 1]}>
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

export default function Comets() {
  const { viewport } = useThree()
  const topY = viewport.height / 2 - 3

  return (
    <group>
       {/* Fewer, slower, more impressive comets */}
       <Comet startY={topY} speed={1.5} delay={0} />
       <Comet startY={topY - 2} speed={1.2} delay={5} />
    </group>
  )
}

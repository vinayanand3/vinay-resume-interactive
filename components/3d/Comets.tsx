import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function Comet({ startY, speed, delay }: { startY: number, speed: number, delay: number }) {
  const mesh = useRef<THREE.Mesh>(null!)
  const { viewport } = useThree()
  
  // Random start position (off-screen left)
  const xStart = -viewport.width / 2 - Math.random() * 5 - delay

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    // Move left to right
    if (mesh.current) {
        // Calculate X based on time and speed, wrapping around
        const distance = (time * speed + delay) % (viewport.width + 10)
        mesh.current.position.x = xStart + distance
        
        // Reset if goes too far right
        if (mesh.current.position.x > viewport.width / 2 + 5) {
            mesh.current.position.y = startY + (Math.random() - 0.5) * 2 // Vary Y slightly on respawn
        }
    }
  })

  return (
    <mesh ref={mesh} position={[xStart, startY, -2]}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      {/* Simple trail using a scaled plane behind it? Or just let the bloom handle the "streak" feel */}
    </mesh>
  )
}

export default function Comets() {
  const { viewport } = useThree()
  const topY = viewport.height / 2 - 2

  return (
    <group>
       <Comet startY={topY} speed={4} delay={0} />
       <Comet startY={topY - 1} speed={3} delay={2} />
       <Comet startY={topY + 0.5} speed={5} delay={5} />
    </group>
  )
}

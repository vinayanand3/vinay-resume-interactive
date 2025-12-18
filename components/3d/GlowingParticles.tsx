import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export default function GlowingParticles({ count = 2000 }) {
  const mesh = useRef<THREE.Points>(null!)
  const { viewport, mouse } = useThree()

  // Generate particles in a mathematical formation (e.g., a twisted torus or sphere cloud)
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // Strange Attractor / Mathematical Knot shape
      const t = Math.random() * 100
      const x = (Math.sin(t) * 10 + Math.cos(t * 2)) * (Math.random() * 5)
      const y = (Math.cos(t) * 10 + Math.sin(t * 3)) * (Math.random() * 5)
      const z = (Math.sin(t * 3) * 10) * (Math.random() * 5)
      
      // Normalize to view
      temp[i * 3] = x
      temp[i * 3 + 1] = y
      temp[i * 3 + 2] = z
    }
    return temp
  }, [count])

  // Custom shader for glowing dots
  const material = useMemo(() => new THREE.PointsMaterial({
    size: 0.15,
    color: new THREE.Color('#4fd1c5'), // Teal/Cyan
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending
  }), [])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    // Rotate the entire cloud
    mesh.current.rotation.x = time * 0.05
    mesh.current.rotation.y = time * 0.03

    // Mouse interaction: Gentle tilt based on mouse position
    const targetX = (mouse.x * viewport.width) / 10
    const targetY = (mouse.y * viewport.height) / 10
    
    mesh.current.rotation.x += (targetY - mesh.current.rotation.x) * 0.02
    mesh.current.rotation.y += (targetX - mesh.current.rotation.y) * 0.02
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <primitive object={material} attach="material" />
    </points>
  )
}

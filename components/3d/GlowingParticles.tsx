import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export default function GlowingParticles({ count = 5000 }) {
  const mesh = useRef<THREE.Points>(null!)
  const { viewport, mouse } = useThree()

  // Generate particles in a Galaxy / Spiral formation
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
        // Galaxy Spiral Logic
        const i3 = i * 3
        const radius = Math.random() * Math.random() * 12 // Concentrate in middle
        const spinAngle = radius * 0.8 // Spin factor
        const branchAngle = (i % 3) * ((2 * Math.PI) / 3) // 3 arms

        const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5
        const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5
        const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5

        temp[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX
        temp[i3 + 1] = Math.sin(branchAngle + spinAngle) * radius + randomY
        temp[i3 + 2] = (Math.random() - 0.5) * 2 + randomZ // Flattened Z-axis (disk)
    }
    return temp
  }, [count])

  // Custom shader for glowing dots
  const material = useMemo(() => new THREE.PointsMaterial({
    size: 0.02, // Much smaller for "dot" feel
    color: new THREE.Color('#ffffff'), // White
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending
  }), [])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    // Slow rotation
    mesh.current.rotation.z = time * 0.01 // Spin the galaxy
    mesh.current.rotation.y = time * 0.005 // Gentle tilt

    // Mouse interaction: Gentle tilt based on mouse position
    const targetX = (mouse.x * viewport.width) / 20 // Reduced sensitivity
    const targetY = (mouse.y * viewport.height) / 20
    
    mesh.current.rotation.x += (targetY - mesh.current.rotation.x) * 0.01
    mesh.current.rotation.y += (targetX - mesh.current.rotation.y) * 0.01
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

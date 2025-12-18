import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export default function GlowingParticles({ count = 10000 }) {
  const mesh = useRef<THREE.Points>(null!)
  const { viewport, mouse } = useThree()

  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    
    const colorInside = new THREE.Color('#ffbd4a') // Orange/Yellow center
    const colorOutside = new THREE.Color('#4fd1c5') // Blue/Teal arms

    for (let i = 0; i < count; i++) {
        const i3 = i * 3
        
        // Milky Way / Barred Spiral Formation
        const radius = Math.random() * 8
        const spinAngle = radius * 1 // Tighter spiral
        
        // Bar structure vs Arms
        // Use mod to create 2 distinct arms, but add some random scatter for the "bar" effect in center
        const mixedColor = colorInside.clone()
        
        let branchAngle = 0
        // If radius is small, form a bar or dense center
        if (radius < 2) {
             branchAngle = (i % 2) * Math.PI // 2 sides of the bar
             mixedColor.lerp(colorOutside, radius / 4)
        } else {
             // Spiral arms further out
             branchAngle = (i % 2) * Math.PI + spinAngle 
             mixedColor.lerp(colorOutside, radius / 8)
        }

        const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5
        const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5
        const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5 // Disk thickness

        positions[i3] = Math.cos(branchAngle) * radius + randomX
        positions[i3 + 1] = Math.sin(branchAngle) * radius + randomY
        positions[i3 + 2] = randomZ

        // Assign colors
        colors[i3] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
    }
    return { positions, colors }
  }, [count])

  const material = useMemo(() => new THREE.PointsMaterial({
    size: 0.015,
    vertexColors: true, // Enable vertex colors
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending
  }), [])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    mesh.current.rotation.z = time * 0.02
    
    // Mouse gentle tilt
    const targetX = (mouse.x * viewport.width) / 30
    const targetY = (mouse.y * viewport.height) / 30
    mesh.current.rotation.x += (targetY - mesh.current.rotation.x) * 0.01
    mesh.current.rotation.y += (targetX - mesh.current.rotation.y) * 0.01
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesPosition.positions.length / 3}
          array={particlesPosition.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particlesPosition.colors.length / 3}
          array={particlesPosition.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <primitive object={material} attach="material" />
    </points>
  )
}

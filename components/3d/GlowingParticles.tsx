import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export default function GlowingParticles({ count = 10000 }) {
  const mesh = useRef<THREE.Group>(null!)
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
        let zScale = 0.5
        if (radius < 2) {
             branchAngle = (i % 2) * Math.PI // 2 sides of the bar
             mixedColor.lerp(colorOutside, radius / 4)
             zScale = 2.0 // Thicker core (Bulge)
        } else {
             // Spiral arms further out
             branchAngle = (i % 2) * Math.PI + spinAngle 
             mixedColor.lerp(colorOutside, radius / 8)
        }

        const randomX = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5
        const randomY = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 0.5
        const randomZ = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * zScale

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

  // Secondary Particle System: Central Dust Cloud
  const dustParticles = useMemo(() => {
     const dustCount = 2000
     const positions = new Float32Array(dustCount * 3)
     const colors = new Float32Array(dustCount * 3)
     const colorCore = new THREE.Color('#ff8c00') // Dark Orange
     const colorOuter = new THREE.Color('#ffbd4a') // Lighter Gold

     for (let i = 0; i < dustCount; i++) {
        const i3 = i * 3
        // Spherical distribution for the core "Bulge"
        const r = Math.random() * 2 // Radius 2
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos((Math.random() * 2) - 1)
        
        const x = r * Math.sin(phi) * Math.cos(theta)
        const y = r * Math.sin(phi) * Math.sin(theta)
        const z = r * Math.cos(phi) * 0.6 // Slightly flattened sphere

        positions[i3] = x
        positions[i3 + 1] = y
        positions[i3 + 2] = z

        // Color gradient from center
        const mixedColor = colorCore.clone().lerp(colorOuter, r / 2)
        colors[i3] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
     }
     return { positions, colors }
  }, [])

  const material = useMemo(() => new THREE.PointsMaterial({
    size: 0.015,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending
  }), [])

  const dustMaterial = useMemo(() => new THREE.PointsMaterial({
    size: 0.03, // Larger "dust" motes
    vertexColors: true,
    transparent: true,
    opacity: 0.6, // Softer
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending
  }), [])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    mesh.current.rotation.z = time * 0.02
    
    // Mouse gentle tilt + Base Isometric Tilt (60 degrees)
    const baseTilt = Math.PI / 3 // 60 degrees
    const targetX = (mouse.x * viewport.width) / 30
    const targetY = (mouse.y * viewport.height) / 30
    
    const currentX = mesh.current.rotation.x
    const desiredX = -baseTilt + (targetY * 0.05) 
    
    mesh.current.rotation.x += (desiredX - currentX) * 0.05
    mesh.current.rotation.y += (targetX * 0.05 - mesh.current.rotation.y) * 0.05
  })

  return (
    <group ref={mesh}>
      {/* Main Spiral Galaxy */}
      <points>
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

      {/* Central Dust Cloud */}
      <points>
        <bufferGeometry>
            <bufferAttribute
            attach="attributes-position"
            count={dustParticles.positions.length / 3}
            array={dustParticles.positions}
            itemSize={3}
            />
            <bufferAttribute
            attach="attributes-color"
            count={dustParticles.colors.length / 3}
            array={dustParticles.colors}
            itemSize={3}
            />
        </bufferGeometry>
        <primitive object={dustMaterial} attach="material" />
      </points>
    </group>
  )
}

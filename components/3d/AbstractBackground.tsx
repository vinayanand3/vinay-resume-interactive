import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Icosahedron } from '@react-three/drei'
import * as THREE from 'three'
import { getProject } from '@theatre/core'
import studio from '@theatre/studio'
import './GlassMaterial' // Register the shader extension

if (import.meta.env.DEV) {
  studio.initialize()
}

// Create a project and sheet
const project = getProject('Resume3D')
const sheet = project.sheet('Background Animation')

export default function AbstractBackground() {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const groupRef = useRef<THREE.Group>(null)

  useEffect(() => {
    project.ready.then(() => {
      sheet.sequence.play({ iterationCount: Infinity, range: [0, 10] })
    })
  }, [])

  useFrame((state, delta) => {
    // Basic continuous rotation
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.05
      meshRef.current.rotation.y += delta * 0.07
    }
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
    
    // Theatre.js or simple float override
    // For now keeping the declarative Float as base, but could hook TJs here
  })

  return (
    <group ref={groupRef}>
      {/* Main floating shape */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <Icosahedron args={[3, 0]} ref={meshRef} position={[4, 0, 0]}>
          {/* @ts-ignore: Custom shader material */}
          <glassMaterial ref={materialRef} transparent />
        </Icosahedron>
      </Float>

      {/* Secondary shapes for depth */}
      <Float speed={3} rotationIntensity={1} floatIntensity={1}>
        <Icosahedron args={[1, 0]} position={[-4, 3, -5]}>
           <meshStandardMaterial color="#333" roughness={0.2} metalness={0.8} />
        </Icosahedron>
      </Float>
      
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.8}>
        <Icosahedron args={[1.5, 0]} position={[-5, -2, -2]}>
           <meshStandardMaterial color="#444" roughness={0.1} metalness={0.9} wireframe />
        </Icosahedron>
      </Float>
    </group>
  )
}

import React, { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Single Comet Implementation
 * Path: Starts from left (off-screen or overlapping timeline), curves into Milky Way Core.
 * Visuals: PBR Emissive Head with Buffer-Based Particle Tail
 * Interaction: Flashes the core intensity ref upon impact.
 */
function SingleComet({ coreRef }: { coreRef?: React.MutableRefObject<{ intensity: number }> }) {
  const group = useRef<THREE.Group>(null!) // The Comet Group (Local Position)
  const container = useRef<THREE.Group>(null!) // The Container (Matches Galaxy Rotation/Tilt)
  const headMeshRef = useRef<THREE.Mesh>(null!)
  const pointLightRef = useRef<THREE.PointLight>(null!)
  const { viewport, mouse, clock } = useThree()
  
  // Expose head world position and velocity for tail tracking
  const headWorldPositionRef = useRef(new THREE.Vector3())
  const headVelocityRef = useRef(new THREE.Vector3())

  // --- Configuration ---
  const HEAD_SIZE = 0.04 
  const SPEED = 0.1 // Keep current speed
  const START_DELAY = 1.0 
  const SPIRAL_TURNS = 1.5 

  // --- State ---
  const state = useRef({
    phase: 'waiting' as 'waiting' | 'active' | 'impacting',
    timer: 0, 
    progress: 0,
    startAngle: 0,
    startRadius: 0,
    previousWorldPosition: new THREE.Vector3(),
    currentWorldPosition: new THREE.Vector3(),
    velocity: new THREE.Vector3()
  })

  useFrame((_, delta) => {
    // --- 1. Container Rotation Matching (Galaxy Logic) ---
    if (container.current) {
        const time = clock.getElapsedTime()
        
        // Match Galaxy Z Rotation (CCW)
        container.current.rotation.z = time * 0.05
        
        // Match Galaxy Tilt logic
        const baseTilt = Math.PI / 3
        const targetX = (mouse.x * viewport.width) / 30
        const targetY = (mouse.y * viewport.height) / 30
        
        const currentX = container.current.rotation.x
        const desiredX = -baseTilt + (targetY * 0.05) 
        
        // Smooth Lerp
        container.current.rotation.x += (desiredX - currentX) * 0.05
        container.current.rotation.y += (targetX * 0.05 - container.current.rotation.y) * 0.05
    }

    // --- 2. Comet Lifecycle & Motion ---
    if (!group.current) return

    const s = state.current

    if (s.phase === 'waiting') {
        s.timer -= delta
        group.current.visible = false
        
        if (s.timer <= 0) {
            s.phase = 'active'
            s.progress = 0
            
            // Random Start Angle
            s.startAngle = Math.random() * Math.PI * 2
            // Start closer to the visible galaxy edge
            s.startRadius = Math.max(viewport.width, viewport.height) / 2.2
            
            // Initialize position tracking
            const r = s.startRadius
            const theta = s.startAngle
            const localPos = new THREE.Vector3(r * Math.cos(theta), r * Math.sin(theta), 0)
            group.current.position.copy(localPos)
            group.current.visible = true
            
            // Initialize world position tracking
            group.current.getWorldPosition(s.currentWorldPosition)
            s.previousWorldPosition.copy(s.currentWorldPosition)
            // Initialize with a small initial velocity for immediate tail alignment
            s.velocity.set(0, 0, 0)
            headVelocityRef.current.set(0, 0, 0)
        }
    } 
    else if (s.phase === 'active') {
        s.progress += delta * (SPEED * 0.3) 
        
        // Update previous world position for velocity calculation
        s.previousWorldPosition.copy(s.currentWorldPosition)

        // Spiral Math (Local to the tilted container)
        const r = s.startRadius * (1 - s.progress)
        
        // Clockwise spiral against the Z-rotation
        const theta = s.startAngle - (s.progress * SPIRAL_TURNS * Math.PI * 2)
        
        const x = r * Math.cos(theta)
        const y = r * Math.sin(theta)
        const z = 0 // In the plane
        
        group.current.position.set(x, y, z)
        
        // Update world position for tail
        group.current.getWorldPosition(s.currentWorldPosition)
        headWorldPositionRef.current.copy(s.currentWorldPosition)
        
        // Calculate velocity (world-space direction)
        // On first frame, use estimated velocity based on spiral direction
        const positionDelta = s.currentWorldPosition.distanceTo(s.previousWorldPosition)
        if (positionDelta < 0.0001) {
            // Estimate initial velocity from spiral direction for immediate tail alignment
            const nextProgress = s.progress + delta * (SPEED * 0.3)
            const nextR = s.startRadius * (1 - nextProgress)
            const nextTheta = s.startAngle - (nextProgress * SPIRAL_TURNS * Math.PI * 2)
            const nextX = nextR * Math.cos(nextTheta)
            const nextY = nextR * Math.sin(nextTheta)
            const estimatedVel = new THREE.Vector3(nextX - x, nextY - y, 0)
            if (delta > 0) {
                estimatedVel.divideScalar(delta)
            }
            s.velocity.copy(estimatedVel)
        } else {
            s.velocity.subVectors(s.currentWorldPosition, s.previousWorldPosition)
            if (delta > 0) {
                s.velocity.divideScalar(delta) // Convert to velocity per second
            }
        }
        headVelocityRef.current.copy(s.velocity)
        
        if (s.progress >= 1) {
            s.phase = 'impacting'
            if (coreRef) coreRef.current.intensity = 1.0 
        }
    }
    else if (s.phase === 'impacting') {
        s.phase = 'waiting'
        s.timer = START_DELAY + Math.random() 
    }
  })

  // PBR Material for Comet Head
  const headMaterial = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.9, 0.95, 1.0), // Pale icy white
      emissive: new THREE.Color(0.4, 0.7, 1.0), // Blue-cyan emissive (brighter)
      emissiveIntensity: 3.0, // Increased for better visibility
      roughness: 0.3, // Low roughness for soft scattering
      metalness: 0.1, // Low metalness
      toneMapped: false
    })
    return material
  }, [])

  return (
    <>
      {/* Comet Tail - Buffer-based particle system (World Space) */}
      <CometTail 
        headWorldPosition={headWorldPositionRef}
        headVelocityRef={headVelocityRef}
        active={state.current.phase === 'active'} 
      />
      
      {/* Wrap in the Container that matches Galaxy Tilt/Rotation */}
      <group ref={container}>
        <group ref={group}>
            {/* Comet Head - Solid PBR Sphere */}
            <mesh ref={headMeshRef}>
                <sphereGeometry args={[HEAD_SIZE, 32, 32]} />
                <primitive object={headMaterial} attach="material" />
            </mesh>
            
            {/* Optional Point Light for Glow Illusion */}
            <pointLight 
              ref={pointLightRef}
              color={new THREE.Color(0.4, 0.7, 1.0)} 
              intensity={0.5}
              distance={0.5}
              decay={2}
            />
        </group>
      </group>
    </>
  )
}

/**
 * Comet Tail - Buffer-Based Particle System
 * GPU-rendered particle system using Points geometry with per-particle attributes
 */
function CometTail({ 
  headWorldPosition, 
  headVelocityRef,
  active 
}: { 
  headWorldPosition: React.MutableRefObject<THREE.Vector3>
  headVelocityRef: React.MutableRefObject<THREE.Vector3>
  active: boolean 
}) {
  
  // Particle count - high for volumetric density
  const PARTICLE_COUNT = 2000
  const MAX_LIFETIME = 3.0 // seconds
  const SPAWN_RATE = 60 // particles per second
  
  // Create sprite texture (radial gradient)
  const spriteTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')!
    const centerX = 128
    const centerY = 128
    const radius = 128
    
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.3, 'rgba(200, 240, 255, 0.8)')
    gradient.addColorStop(0.6, 'rgba(100, 200, 255, 0.4)')
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 256, 256)
    
    const texture = new THREE.CanvasTexture(canvas)
    texture.needsUpdate = true
    return texture
  }, [])
  
  // Per-particle data
  const particleData = useRef({
    positions: new Float32Array(PARTICLE_COUNT * 3),
    velocities: new Float32Array(PARTICLE_COUNT * 3),
    lifetimes: new Float32Array(PARTICLE_COUNT),
    ages: new Float32Array(PARTICLE_COUNT),
    sizes: new Float32Array(PARTICLE_COUNT),
    active: new Uint8Array(PARTICLE_COUNT)
  })
  
  // Initialize geometry buffers - use refs so we can update them
  const positionsRef = useRef(new Float32Array(PARTICLE_COUNT * 3))
  const colorsRef = useRef(new Float32Array(PARTICLE_COUNT * 3))
  
  // Initialize all particles as inactive
  useMemo(() => {
    const positions = positionsRef.current
    const colors = colorsRef.current
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = 0
      positions[i * 3 + 1] = 0
      positions[i * 3 + 2] = 0
      
      // Blue-white color
      colors[i * 3] = 0.4
      colors[i * 3 + 1] = 0.7
      colors[i * 3 + 2] = 1.0
    }
  }, [])
  
  const pointsRef = useRef<THREE.Points>(null!)
  
  // Material for points - larger size for visibility
  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.15, // Increased size for visibility
      map: spriteTexture,
      transparent: true,
      opacity: 1.0,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    })
  }, [spriteTexture])
  
  const spawnTimer = useRef(0)
  const nextParticleIndex = useRef(0)
  
  useFrame((_, delta) => {
    if (!pointsRef.current) return
    
    const positions = positionsRef.current
    const colors = colorsRef.current
    const data = particleData.current
    
    // Get current head velocity
    const currentVelocity = headVelocityRef.current
    
    if (active) {
      // Spawn new particles
      spawnTimer.current += delta
      const spawnInterval = 1.0 / SPAWN_RATE
      
      while (spawnTimer.current >= spawnInterval && active) {
        spawnTimer.current -= spawnInterval
        
        // Find next inactive particle
        let attempts = 0
        let idx = nextParticleIndex.current
        while (data.active[idx] && attempts < PARTICLE_COUNT) {
          idx = (idx + 1) % PARTICLE_COUNT
          attempts++
        }
        
        if (attempts < PARTICLE_COUNT) {
          // Spawn particle
          data.active[idx] = 1
          data.ages[idx] = 0
          data.lifetimes[idx] = MAX_LIFETIME * (0.8 + Math.random() * 0.4) // Slight variation
          
          // Spawn position: slightly behind head with small random offset
          const spawnOffset = new THREE.Vector3(
            (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.02
          )
          
          // Spawn behind head in world space
          const worldPos = headWorldPosition.current.clone()
          if (currentVelocity.length() > 0.001) {
            const invVel = currentVelocity.clone().normalize().multiplyScalar(-0.02)
            worldPos.add(invVel)
          }
          worldPos.add(spawnOffset)
          
          // Store world position in both data and render arrays
          data.positions[idx * 3] = worldPos.x
          data.positions[idx * 3 + 1] = worldPos.y
          data.positions[idx * 3 + 2] = worldPos.z
          
          positions[idx * 3] = worldPos.x
          positions[idx * 3 + 1] = worldPos.y
          positions[idx * 3 + 2] = worldPos.z
          
          // Initialize velocity: inverse of head velocity with lateral dispersion
          let baseVel: THREE.Vector3
          if (currentVelocity.length() > 0.001) {
            baseVel = currentVelocity.clone().normalize().multiplyScalar(-1)
            const lateralDispersion = new THREE.Vector3(
              (Math.random() - 0.5) * 0.3,
              (Math.random() - 0.5) * 0.3,
              (Math.random() - 0.5) * 0.1
            )
            baseVel.add(lateralDispersion).normalize()
          } else {
            // Fallback if velocity is too small
            baseVel = new THREE.Vector3(
              (Math.random() - 0.5) * 0.5,
              (Math.random() - 0.5) * 0.5,
              (Math.random() - 0.5) * 0.2
            ).normalize()
          }
          
          const speed = 0.05 + Math.random() * 0.05
          data.velocities[idx * 3] = baseVel.x * speed
          data.velocities[idx * 3 + 1] = baseVel.y * speed
          data.velocities[idx * 3 + 2] = baseVel.z * speed
          
          data.sizes[idx] = 0.015 + Math.random() * 0.01
          
          nextParticleIndex.current = (idx + 1) % PARTICLE_COUNT
        }
      }
    } else {
      // Reset when inactive
      spawnTimer.current = 0
    }
    
    // Update all particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      if (!data.active[i]) {
        // Hide inactive particles
        positions[i * 3] = 0
        positions[i * 3 + 1] = 0
        positions[i * 3 + 2] = 0
        colors[i * 3] = 0
        colors[i * 3 + 1] = 0
        colors[i * 3 + 2] = 0
        continue
      }
      
      // Update age
      data.ages[i] += delta
      const normalizedAge = data.ages[i] / data.lifetimes[i]
      
      if (normalizedAge >= 1.0) {
        // Particle expired
        data.active[i] = 0
        positions[i * 3] = 0
        positions[i * 3 + 1] = 0
        positions[i * 3 + 2] = 0
        colors[i * 3] = 0
        colors[i * 3 + 1] = 0
        colors[i * 3 + 2] = 0
        continue
      }
      
      // Update position (world-space motion) - use data.positions as source of truth
      data.positions[i * 3] += data.velocities[i * 3] * delta
      data.positions[i * 3 + 1] += data.velocities[i * 3 + 1] * delta
      data.positions[i * 3 + 2] += data.velocities[i * 3 + 2] * delta
      
      // Add slight stochastic jitter
      data.positions[i * 3] += (Math.random() - 0.5) * 0.001 * delta
      data.positions[i * 3 + 1] += (Math.random() - 0.5) * 0.001 * delta
      data.positions[i * 3 + 2] += (Math.random() - 0.5) * 0.0005 * delta
      
      // Copy to render array
      positions[i * 3] = data.positions[i * 3]
      positions[i * 3 + 1] = data.positions[i * 3 + 1]
      positions[i * 3 + 2] = data.positions[i * 3 + 2]
      
      // Update opacity via color alpha (using color for additive blending)
      const fadeStart = 0.7
      const fadeOpacity = normalizedAge < fadeStart 
        ? 1.0 
        : 1.0 - ((normalizedAge - fadeStart) / (1.0 - fadeStart))
      
      colors[i * 3] = 0.4 * fadeOpacity
      colors[i * 3 + 1] = 0.7 * fadeOpacity
      colors[i * 3 + 2] = 1.0 * fadeOpacity
      
    }
    
    // Mark attributes as needing update
    if (pointsRef.current) {
      const geom = pointsRef.current.geometry
      geom.attributes.position.needsUpdate = true
      geom.attributes.color.needsUpdate = true
    }
  })
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positionsRef.current}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={PARTICLE_COUNT}
          array={colorsRef.current}
          itemSize={3}
        />
      </bufferGeometry>
      <primitive object={material} attach="material" />
    </points>
  )
}

export default function Comets({ coreRef }: { coreRef?: React.MutableRefObject<{ intensity: number }> }) {
  return (
    <group>
        <SingleComet coreRef={coreRef} />
    </group>
  )
}

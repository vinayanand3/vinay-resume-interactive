import { useState, useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { webRTCService, GraffitiStroke, GraffitiPoint } from '../../services/WebRTCService'

export default function GraffitiScene() {
    const { camera, raycaster } = useThree()
    const [strokes, setStrokes] = useState<GraffitiStroke[]>([])
    const currentStroke = useRef<GraffitiPoint[]>([])
    const isDrawing = useRef(false)
    
    // Shared plane for drawing (at z=0 or slightly offset)
    const drawingPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)

    const handlePointerDown = (e: any) => {
        // Prevent drawing if interacting with UI (cards, links, buttons, inputs)
        if ((e.target as HTMLElement).closest('.glass-panel, a, button, input, textarea')) return 
        
        // On touch or left mouse button only
        if (e.pointerType === 'mouse' && e.button !== 0) return

        isDrawing.current = true
        currentStroke.current = []
        // e.preventDefault() // Optional: prevents text selection, but might interfere with scroll if not careful
    }

    const handlePointerUp = () => {
        if (!isDrawing.current || currentStroke.current.length === 0) return
        isDrawing.current = false
        
        const newStroke: GraffitiStroke = {
            id: Math.random().toString(36).substr(2, 9),
            points: [...currentStroke.current],
            color: '#00ff88', // Neo-green
            userId: webRTCService.userId
        }

        setStrokes(prev => [...prev, newStroke])
        webRTCService.broadcast({ type: 'stroke', data: newStroke })
        currentStroke.current = []
    }

    const handlePointerMove = (e: any) => {
        if (!isDrawing.current) return

        // Raycast against infinite plane at Z=0
        const mouse = new THREE.Vector2(
            (e.clientX / window.innerWidth) * 2 - 1,
            -(e.clientY / window.innerHeight) * 2 + 1
        )
        
        raycaster.setFromCamera(mouse, camera)
        const target = new THREE.Vector3()
        raycaster.ray.intersectPlane(drawingPlane, target)

        if (target) {
            // Add point if distance is significant
            const lastPoint = currentStroke.current[currentStroke.current.length - 1]
            if (!lastPoint || new THREE.Vector3(...lastPoint).distanceTo(target) > 0.1) {
                 const point: GraffitiPoint = [target.x, target.y, target.z]
                 currentStroke.current.push(point)
                 // Force re-render of current line? 
                 // Optimization: Use a temp ref line component for current stroke
            }
        }
    }

    useEffect(() => {
        webRTCService.onData((msg: any) => {
            if (msg.type === 'stroke') {
                setStrokes(prev => [...prev, msg.data])
            }
        })

        window.addEventListener('pointerdown', handlePointerDown)
        window.addEventListener('pointerup', handlePointerUp)
        window.addEventListener('pointermove', handlePointerMove)

        return () => {
            window.removeEventListener('pointerdown', handlePointerDown)
            window.removeEventListener('pointerup', handlePointerUp)
            window.removeEventListener('pointermove', handlePointerMove)
        }
    }, [])

    return (
        <group>
            {strokes.map(stroke => (
                <Line
                    key={stroke.id}
                    points={stroke.points}
                    color={stroke.color}
                    lineWidth={2}
                    dashed={false}
                    transparent
                    opacity={0.8}
                />
            ))}
             {/* Current stroke visualizer could go here */}
        </group>
    )
}

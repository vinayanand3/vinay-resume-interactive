import { extend, ReactThreeFiber } from '@react-three/fiber'
import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

const GlassMaterial = shaderMaterial(
  {
    uTime: 0,
    uColorStart: new THREE.Color('#ffffff'),
    uColorEnd: new THREE.Color('#4a4a4a'),
    uRefraction: 0.1,
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform vec3 uColorStart;
    uniform vec3 uColorEnd;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      
      // Fresnel effect
      float fresnel = 1.0 - dot(viewDir, normal);
      fresnel = pow(fresnel, 3.0);
      
      // Iridescence/subtle movement
      vec3 color = mix(uColorStart, uColorEnd, vUv.y + sin(uTime * 0.5) * 0.1);
      
      // Add glass-like transparency and reflection
      gl_FragColor = vec4(color + fresnel * 0.5, 0.4 + fresnel * 0.4);
    }
  `
)

extend({ GlassMaterial })

declare global {
  namespace JSX {
    interface IntrinsicElements {
      glassMaterial: ReactThreeFiber.Object3DNode<THREE.ShaderMaterial, typeof GlassMaterial> & {
          uTime?: number
          uRefraction?: number
          uColorStart?: THREE.Color
          uColorEnd?: THREE.Color
      }
    }
  }
}

export { GlassMaterial }

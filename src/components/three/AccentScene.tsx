'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/**
 * The single 3D accent in the project: a point-cloud sphere that breathes and
 * leans toward the cursor.
 *
 * Kept deliberately cheap — one geometry, one shader, no lights, no post
 * processing, no textures. Displacement happens on the GPU, so the CPU cost per
 * frame is a couple of uniform writes.
 */

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPointer;
  varying float vGlow;

  void main() {
    vec3 p = position;
    float wave =
      sin(p.x * 2.6 + uTime) * 0.09 +
      cos(p.y * 2.2 + uTime * 0.75) * 0.09 +
      sin(p.z * 3.1 + uTime * 0.5) * 0.05;

    p += normal * wave * (1.0 + uPointer * 0.8);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    // Perspective falloff only — the multiplier has to stay small. At camera
    // z=6 a factor of 260 rendered ~69px points, and thousands of those under
    // additive blending burn out to a solid white mass.
    gl_PointSize = (1.1 + max(wave, 0.0) * 5.0) * (11.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
    vGlow = 0.18 + wave * 2.4;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uAccent;
  varying float vGlow;

  void main() {
    vec2 offset = gl_PointCoord - 0.5;
    if (dot(offset, offset) > 0.25) discard;
    vec3 color = mix(uColor, uAccent, clamp(vGlow, 0.0, 1.0));
    // Capped low: additive blending accumulates wherever points overlap.
    gl_FragColor = vec4(color, clamp(vGlow, 0.03, 0.38));
  }
`

function PointSphere() {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const groupRef = useRef<THREE.Group>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const { viewport } = useThree()

  const geometry = useMemo(() => new THREE.SphereGeometry(1.5, 72, 72), [])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: 0 },
      uColor: { value: new THREE.Color('#2f3a1a') },
      uAccent: { value: new THREE.Color('#ccff00') },
    }),
    [],
  )

  useFrame((state, delta) => {
    const material = materialRef.current
    const group = groupRef.current
    if (!material || !group) return

    material.uniforms.uTime.value += delta * 0.6

    // Pointer is normalised to -1..1 by r3f; ease toward it instead of snapping.
    pointer.current.x += (state.pointer.x - pointer.current.x) * 0.05
    pointer.current.y += (state.pointer.y - pointer.current.y) * 0.05

    group.rotation.y += delta * 0.08 + pointer.current.x * 0.004
    group.rotation.x = pointer.current.y * 0.25
    material.uniforms.uPointer.value = Math.hypot(pointer.current.x, pointer.current.y)
  })

  const scale = Math.min(viewport.width, viewport.height) / 5

  return (
    <group ref={groupRef} scale={scale}>
      <points geometry={geometry}>
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  )
}

export default function AccentScene() {
  return (
    <Canvas
      // Cap the pixel ratio: this is a background accent, not a hero asset.
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      camera={{ position: [0, 0, 6], fov: 45 }}
      style={{ pointerEvents: 'none' }}
    >
      <PointSphere />
    </Canvas>
  )
}

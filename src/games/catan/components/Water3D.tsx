import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Water3D() {
  const waterRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (waterRef.current) {
      // Subtle wave motion (Y only, no rotation to prevent z-fighting with felt inlay)
      waterRef.current.position.y = -0.05 + Math.sin(t * 1.5) * 0.01;
    }
    if (materialRef.current) {
      // Subtle color pulse
      const pulse = (Math.sin(t * 2) + 1) / 2; // 0 to 1
      materialRef.current.opacity = 0.7 + pulse * 0.2;
    }
  });

  return (
    <mesh ref={waterRef} position={[0, -0.05, 0]}>
      <cylinderGeometry args={[11.5, 11.5, 0.1, 64]} />
      <meshStandardMaterial 
        ref={materialRef}
        color="#0ea5e9" 
        metalness={0.3}
        roughness={0.1}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

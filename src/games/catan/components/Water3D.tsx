import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function Water3D() {
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      // Subtle color shift or animation could go here
    }
  });

  return (
    <mesh position={[0, -0.05, 0]}>
      <cylinderGeometry args={[11, 11, 0.1, 64]} />
      <meshStandardMaterial 
        color="#0ea5e9" 
        metalness={0.1}
        roughness={0.1}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

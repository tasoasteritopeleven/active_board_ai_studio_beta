import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ResourceType } from '../domain/types';

interface FlowingResource {
  id: string;
  type: ResourceType;
  startPos: THREE.Vector3;
  endPos: THREE.Vector3;
  progress: number;
}

export function ResourceFlow3D({ flows, onComplete }: { flows: FlowingResource[], onComplete: (id: string) => void }) {
  return (
    <group>
      {flows.map(flow => (
        <FlowingItem key={flow.id} flow={flow} onComplete={onComplete} />
      ))}
    </group>
  );
}

function FlowingItem({ flow, onComplete }: { flow: FlowingResource, onComplete: (id: string) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [progress, setProgress] = useState(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Update progress
    const newProgress = progress + delta * 1.5; // Adjust speed here
    setProgress(newProgress);

    if (newProgress >= 1) {
      onComplete(flow.id);
      return;
    }

    // Calculate position with an arc
    const currentPos = new THREE.Vector3().lerpVectors(flow.startPos, flow.endPos, newProgress);
    
    // Add arc height
    const arcHeight = Math.sin(newProgress * Math.PI) * 3;
    currentPos.y += arcHeight;

    meshRef.current.position.copy(currentPos);
    
    // Spin
    meshRef.current.rotation.x += delta * 5;
    meshRef.current.rotation.y += delta * 5;
  });

  const getColor = (type: ResourceType) => {
    switch (type) {
      case ResourceType.WOOD: return '#8b4513';
      case ResourceType.BRICK: return '#b22222';
      case ResourceType.SHEEP: return '#ffffff';
      case ResourceType.WHEAT: return '#ffd700';
      case ResourceType.ORE: return '#757575';
      default: return '#ffffff';
    }
  };

  return (
    <mesh ref={meshRef} position={flow.startPos}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color={getColor(flow.type)} emissive={getColor(flow.type)} emissiveIntensity={0.5} />
    </mesh>
  );
}

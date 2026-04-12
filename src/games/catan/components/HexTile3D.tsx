import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Text } from '@react-three/drei';
import { HexTile, TerrainType } from '../domain/types';
import { useCatanStore } from '../store/catanStore';
import * as THREE from 'three';

interface HexTile3DProps {
  hex: HexTile;
  index: number;
}

const TERRAIN_COLORS: Record<TerrainType, string> = {
  [TerrainType.FOREST]: '#2d5a27',
  [TerrainType.HILLS]: '#8b4513',
  [TerrainType.PASTURE]: '#7cfc00',
  [TerrainType.FIELDS]: '#ffd700',
  [TerrainType.MOUNTAINS]: '#808080',
  [TerrainType.DESERT]: '#edc9af',
  [TerrainType.WATER]: '#1ca3ec',
};

// Procedural Hexagon Geometry - High Detail
const hexGeometry = new THREE.CylinderGeometry(0.975, 0.995, 0.2, 6);
const hexBorderGeometry = new THREE.CylinderGeometry(0.995, 0.995, 0.18, 6);

const Robber = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh position={[0, 0.2, 0]}>
      <cylinderGeometry args={[0.15, 0.2, 0.4, 16]} />
      <meshStandardMaterial color="#111827" roughness={0.7} />
    </mesh>
    <mesh position={[0, 0.5, 0]}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial color="#111827" roughness={0.7} />
    </mesh>
  </group>
);

// Simple 3D Props for Terrain - High Segment Count for 4K
const Tree = ({ position, scale = 1 }: { position: [number, number, number], scale?: number }) => (
  <group position={position} scale={scale}>
    {/* Trunk */}
    <mesh position={[0, 0.1, 0]}>
      <cylinderGeometry args={[0.04, 0.06, 0.2, 16]} />
      <meshStandardMaterial color="#3e2723" roughness={0.9} />
    </mesh>
    {/* Leaves - Multiple layers for realism */}
    <mesh position={[0, 0.25, 0]}>
      <coneGeometry args={[0.25, 0.3, 32]} />
      <meshStandardMaterial color="#1b5e20" roughness={0.8} />
    </mesh>
    <mesh position={[0, 0.4, 0]}>
      <coneGeometry args={[0.2, 0.3, 32]} />
      <meshStandardMaterial color="#2e7d32" roughness={0.8} />
    </mesh>
    <mesh position={[0, 0.55, 0]}>
      <coneGeometry args={[0.15, 0.25, 32]} />
      <meshStandardMaterial color="#388e3c" roughness={0.8} />
    </mesh>
  </group>
);

const Mountain = ({ position, scale = 1 }: { position: [number, number, number], scale?: number }) => (
  <group position={position} scale={scale * 0.97}>
    {/* Base Mountain */}
    <mesh position={[0, 0.3, 0]} rotation={[0, Math.random() * Math.PI, 0]}>
      <dodecahedronGeometry args={[0.4, 1]} />
      <meshStandardMaterial color="#546e7a" roughness={0.8} metalness={0.1} flatShading />
    </mesh>
    {/* Snow Cap */}
    <mesh position={[0, 0.55, 0]} rotation={[0, Math.random() * Math.PI, 0]}>
      <dodecahedronGeometry args={[0.2, 1]} />
      <meshStandardMaterial color="#ffffff" roughness={0.4} flatShading />
    </mesh>
  </group>
);

const Sheep = ({ position, rotation = 0 }: { position: [number, number, number], rotation?: number }) => (
  <group position={position} scale={0.8} rotation={[0, rotation, 0]}>
    {/* Body */}
    <mesh position={[0, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
      <capsuleGeometry args={[0.1, 0.15, 16, 16]} />
      <meshStandardMaterial color="#f8fafc" roughness={1} />
    </mesh>
    {/* Head */}
    <mesh position={[0.15, 0.2, 0]}>
      <sphereGeometry args={[0.08, 16, 16]} />
      <meshStandardMaterial color="#1e293b" roughness={0.8} />
    </mesh>
    {/* Legs */}
    {[-0.1, 0.1].map((x) => 
      [-0.05, 0.05].map((z) => (
        <mesh key={`${x}-${z}`} position={[x, 0.05, z]}>
          <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} />
        </mesh>
      ))
    )}
  </group>
);

const Wheat = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    {Array.from({ length: 240 }).map((_, i) => {
      // Use a wider radius, avoiding the exact center
      const radius = 0.25 + Math.random() * 0.55;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      return (
        <mesh key={i} position={[x, 0.15, z]} rotation={[Math.random() * 0.2, Math.random() * Math.PI, Math.random() * 0.2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.6} />
        </mesh>
      );
    })}
  </group>
);

const BrickPile = ({ position, rotation = 0 }: { position: [number, number, number], rotation?: number }) => (
  <group position={position} rotation={[0, rotation, 0]} scale={3}>
    <mesh position={[-0.05, 0.04, 0]}>
      <boxGeometry args={[0.12, 0.06, 0.06]} />
      <meshStandardMaterial color="#b45309" roughness={0.9} />
    </mesh>
    <mesh position={[0.05, 0.04, 0]}>
      <boxGeometry args={[0.12, 0.06, 0.06]} />
      <meshStandardMaterial color="#b45309" roughness={0.9} />
    </mesh>
    <mesh position={[0, 0.1, 0]} rotation={[0, Math.PI / 4, 0]}>
      <boxGeometry args={[0.12, 0.06, 0.06]} />
      <meshStandardMaterial color="#b45309" roughness={0.9} />
    </mesh>
  </group>
);

const DesertRipple = ({ position, length }: { position: [number, number, number], length: number }) => (
  <mesh position={position} rotation={[0, 0, Math.PI / 2]}>
    <cylinderGeometry args={[0.04, 0.04, length, 8, 1, false, 0, Math.PI]} />
    <meshStandardMaterial color="#8b5a2b" roughness={1} />
  </mesh>
);

export function HexTile3D({ hex, index }: HexTile3DProps) {
  const color = TERRAIN_COLORS[hex.terrain];
  const groupRef = useRef<THREE.Group>(null);
  const tokenGroupRef = useRef<THREE.Group>(null);
  const tokenMeshRef = useRef<THREE.Group>(null);
  const startTime = useRef(Date.now());
  const [hovered, setHovered] = useState(false);

  const robberHexId = useCatanStore(state => state.robberHexId);
  const robberMode = useCatanStore(state => state.robberMode);
  const pendingRobberHexId = useCatanStore(state => state.pendingRobberHexId);
  const setPendingRobberHexId = useCatanStore(state => state.setPendingRobberHexId);

  const hasRobber = robberHexId === hex.id;
  const isPendingRobber = pendingRobberHexId === hex.id;
  const isInteractable = robberMode && !hasRobber && hex.terrain !== TerrainType.WATER;

  useFrame(() => {
    const elapsed = (Date.now() - startTime.current) / 1000;
    
    // Hex drop animation
    const hexDelay = index * 0.05;
    if (groupRef.current) {
      if (elapsed < hexDelay) {
        groupRef.current.position.y = 10;
        groupRef.current.scale.setScalar(0.01);
      } else if (elapsed < hexDelay + 0.5) {
        const t = (elapsed - hexDelay) / 0.5;
        const ease = 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2); // easeOutBack
        groupRef.current.position.y = THREE.MathUtils.lerp(10, hex.position.y, ease);
        groupRef.current.scale.setScalar(THREE.MathUtils.lerp(0.01, 1, ease));
      } else {
        groupRef.current.position.y = hex.position.y;
        groupRef.current.scale.setScalar(1);
      }
    }

    // Token animations
    if (hex.numberToken && hex.letterToken && tokenGroupRef.current && tokenMeshRef.current) {
      const letterIndex = hex.letterToken.charCodeAt(0) - 65;
      
      // Token drop
      const tokenDelay = 1.5 + letterIndex * 0.1;
      if (elapsed < tokenDelay) {
        tokenGroupRef.current.position.y = 10;
        tokenGroupRef.current.scale.setScalar(0.01);
      } else if (elapsed < tokenDelay + 0.4) {
        const t = (elapsed - tokenDelay) / 0.4;
        const ease = 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2);
        tokenGroupRef.current.position.y = THREE.MathUtils.lerp(10, 0.4, ease);
        tokenGroupRef.current.scale.setScalar(THREE.MathUtils.lerp(0.01, 1, ease));
      } else {
        tokenGroupRef.current.position.y = 0.4;
        tokenGroupRef.current.scale.setScalar(1);
      }

      // Token flip
      const flipDelay = 4.0 + letterIndex * 0.1;
      if (elapsed < flipDelay) {
        tokenMeshRef.current.rotation.x = 0;
      } else if (elapsed < flipDelay + 0.5) {
        const t = (elapsed - flipDelay) / 0.5;
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOutQuad
        tokenMeshRef.current.rotation.x = THREE.MathUtils.lerp(0, Math.PI, ease);
      } else {
        tokenMeshRef.current.rotation.x = Math.PI;
      }
    }
  });

  const handleClick = (e: any) => {
    if (isInteractable) {
      e.stopPropagation();
      setPendingRobberHexId(hex.id);
    }
  };

  return (
    <group 
      ref={groupRef} 
      position={[hex.position.x, 10, hex.position.z]} 
      scale={0.01}
      onClick={handleClick}
      onPointerOver={(e) => { if (isInteractable) { e.stopPropagation(); setHovered(true); } }}
      onPointerOut={(e) => { if (isInteractable) { e.stopPropagation(); setHovered(false); } }}
    >
      {/* Base Hex */}
      <group>
        <mesh geometry={hexGeometry}>
          <meshStandardMaterial 
            color={isInteractable && hovered ? '#fcd34d' : color} 
            roughness={0.8} 
            emissive={isInteractable && hovered ? '#fcd34d' : '#000000'}
            emissiveIntensity={isInteractable && hovered ? 0.2 : 0}
          />
        </mesh>
        {/* Hex Border */}
        <mesh geometry={hexBorderGeometry} position={[0, -0.01, 0]}>
          <meshStandardMaterial color={isPendingRobber ? '#ef4444' : '#e2e8f0'} roughness={0.9} />
        </mesh>
      </group>

      {/* Robber */}
      {hasRobber && <Robber position={[0, 0.2, 0]} />}
      {isPendingRobber && (
        <group opacity={0.5} transparent>
          <Robber position={[0, 0.2, 0]} />
        </group>
      )}

      {/* Terrain Props */}
      {hex.terrain === TerrainType.FOREST && (
        <group>
          <Tree position={[-0.3, 0.1, -0.3]} scale={1.2} />
          <Tree position={[0.3, 0.1, -0.2]} scale={0.9} />
          <Tree position={[-0.1, 0.1, 0.4]} scale={1.1} />
          <Tree position={[0.4, 0.1, 0.3]} scale={0.8} />
          <Tree position={[-0.4, 0.1, 0.2]} scale={1.0} />
          <Tree position={[0.1, 0.1, -0.5]} scale={0.85} />
        </group>
      )}
      {hex.terrain === TerrainType.MOUNTAINS && (
        <group>
          <Mountain position={[-0.45, 0.1, -0.45]} scale={1.0} />
          <Mountain position={[0.55, 0.1, 0.2]} scale={0.8} />
          <Mountain position={[-0.3, 0.1, 0.55]} scale={0.9} />
          <Mountain position={[0.4, 0.1, -0.45]} scale={0.8} />
          <Mountain position={[-0.55, 0.1, 0.15]} scale={0.7} />
        </group>
      )}
      {hex.terrain === TerrainType.PASTURE && (
        <group>
          <Sheep position={[-0.3, 0.1, -0.2]} rotation={Math.PI / 4} />
          <Sheep position={[0.2, 0.1, 0.3]} rotation={-Math.PI / 3} />
          <Sheep position={[0.4, 0.1, -0.1]} rotation={Math.PI / 2} />
          <Sheep position={[-0.2, 0.1, 0.4]} rotation={Math.PI} />
          <Sheep position={[-0.5, 0.1, 0.1]} rotation={-Math.PI / 6} />
          <Sheep position={[0.1, 0.1, -0.4]} rotation={Math.PI / 8} />
          <Sheep position={[-0.1, 0.1, -0.5]} rotation={-Math.PI / 4} />
        </group>
      )}
      {hex.terrain === TerrainType.FIELDS && (
        <group>
          <Wheat position={[0, 0, 0]} />
        </group>
      )}
      {hex.terrain === TerrainType.HILLS && (
        <group>
          <BrickPile position={[-0.4, 0.1, -0.3]} rotation={Math.PI / 6} />
          <BrickPile position={[0.4, 0.1, 0.2]} rotation={-Math.PI / 4} />
          <BrickPile position={[-0.2, 0.1, 0.5]} rotation={Math.PI / 3} />
          <BrickPile position={[0.3, 0.1, -0.4]} rotation={-Math.PI / 6} />
        </group>
      )}
      {hex.terrain === TerrainType.DESERT && (
        <group>
          <DesertRipple position={[0, 0.02, -0.5]} length={0.6} />
          <DesertRipple position={[0, 0.02, -0.25]} length={1.0} />
          <DesertRipple position={[0, 0.02, 0]} length={1.2} />
          <DesertRipple position={[0, 0.02, 0.25]} length={1.0} />
          <DesertRipple position={[0, 0.02, 0.5]} length={0.6} />
        </group>
      )}

      {/* Number Token */}
      {hex.numberToken && (
        <group ref={tokenGroupRef} position={[0, 10, 0]} scale={0.01}>
          <group ref={tokenMeshRef}>
            <mesh>
              <cylinderGeometry args={[0.3, 0.3, 0.05, 32]} />
              <meshStandardMaterial color="#fdf6e3" roughness={0.5} />
            </mesh>
            
            {/* Letter (Top side initially) */}
            {hex.letterToken && (
              <Text
                position={[0, 0.026, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={0.25}
                color="#1e293b"
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
              >
                {hex.letterToken}
              </Text>
            )}

            {/* Number (Bottom side initially, becomes top after flip) */}
            <group position={[0, -0.026, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <Text
                position={[0, 0, 0]}
                fontSize={0.25}
                color={hex.numberToken === 6 || hex.numberToken === 8 ? '#dc2626' : '#1e293b'}
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
              >
                {hex.numberToken.toString()}
              </Text>
              {/* Probability Pips */}
              <group position={[0, -0.15, 0]}>
                {Array.from({ length: 6 - Math.abs(7 - hex.numberToken) }).map((_, i, arr) => (
                  <mesh key={i} position={[(i - (arr.length - 1) / 2) * 0.06, 0, 0]}>
                    <circleGeometry args={[0.02, 16]} />
                    <meshBasicMaterial color={hex.numberToken === 6 || hex.numberToken === 8 ? '#dc2626' : '#1e293b'} />
                  </mesh>
                ))}
              </group>
            </group>
          </group>
        </group>
      )}
    </group>
  );
}

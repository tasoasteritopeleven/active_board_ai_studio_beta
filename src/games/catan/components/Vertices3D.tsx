import { useMemo, useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useCatanStore } from '../store/catanStore';
import { Home } from 'lucide-react';
import * as THREE from 'three';

export function Vertices3D() {
  const hexes = useCatanStore((state) => state.hexes);
  
  // Calculate all unique vertices
  const vertices = useMemo(() => {
    const uniqueVertices = new Map<string, THREE.Vector3>();
    const HEX_SIZE = 1.0;
    
    Object.values(hexes).forEach(hex => {
      for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 6 + i * (Math.PI / 3);
        const vx = hex.position.x + HEX_SIZE * Math.cos(angle);
        const vz = hex.position.z + HEX_SIZE * Math.sin(angle);
        
        // Round to 2 decimal places to merge shared vertices
        const key = `${vx.toFixed(2)},${vz.toFixed(2)}`;
        if (!uniqueVertices.has(key)) {
          uniqueVertices.set(key, new THREE.Vector3(vx, 0.2, vz));
        }
      }
    });
    
    return Array.from(uniqueVertices.entries()).map(([id, pos]) => ({ id, pos }));
  }, [hexes]);

  return (
    <group position={[0, 0.1, 0]}>
      {vertices.map(v => (
        <VertexNode key={v.id} id={v.id} position={v.pos} />
      ))}
    </group>
  );
}

function VertexNode({ id, position }: { id: string, position: THREE.Vector3 }) {
  const [hovered, setHovered] = useState(false);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const startTime = useRef(Date.now());
  
  const verticesState = useCatanStore(state => state.vertices);
  const players = useCatanStore(state => state.players);
  const buildMode = useCatanStore(state => state.buildMode);
  const pendingBuild = useCatanStore(state => state.pendingBuild);
  const setPendingBuild = useCatanStore(state => state.setPendingBuild);
  const activePlayerId = useCatanStore(state => state.activePlayerId);
  const activePlayer = players[activePlayerId];
  
  const vertexData = verticesState[id];
  const hasBuilding = !!vertexData?.building;
  const ownerColor = hasBuilding ? players[vertexData.building!.ownerId]?.color : null;

  const isPendingHere = pendingBuild?.locationId === id;
  const isSettlementMode = buildMode === 'SETTLEMENT';
  const isCityMode = buildMode === 'CITY';

  const isValidSettlementSpot = isSettlementMode && !hasBuilding; // TODO: Distance rule
  const isValidCitySpot = isCityMode && hasBuilding && vertexData.building?.type === 'SETTLEMENT' && vertexData.building?.ownerId === activePlayerId;
  const isInteractable = isValidSettlementSpot || isValidCitySpot;

  useFrame(() => {
    if (!materialRef.current || !meshRef.current) return;
    const elapsed = (Date.now() - startTime.current) / 1000;
    
    if (isInteractable) {
      const targetOpacity = hovered ? 0.8 : 0.4;
      materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, targetOpacity, 0.1);
      
      if (!hovered) {
        const scale = 1 + Math.sin(elapsed * 4) * 0.15;
        meshRef.current.scale.setScalar(scale);
      } else {
        meshRef.current.scale.setScalar(1.2);
      }
    } else {
      materialRef.current.opacity = 0;
      meshRef.current.scale.setScalar(1);
    }
  });
  
  const handleClick = (e: any) => {
    e.stopPropagation();
    if (isInteractable) {
      setPendingBuild({ type: buildMode!, locationId: id });
    }
  };
  
  return (
    <group position={[position.x, position.y + 0.05, position.z]}>
      {/* Interaction Node */}
      <mesh 
        ref={meshRef}
        visible={isInteractable}
        onPointerOver={(e) => { if (isInteractable) { e.stopPropagation(); setHovered(true); } }}
        onPointerOut={(e) => { if (isInteractable) { e.stopPropagation(); setHovered(false); } }}
        onClick={handleClick}
      >
        <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
        <meshStandardMaterial 
          ref={materialRef}
          color={hovered ? "#fcd34d" : "#ffffff"} 
          transparent 
          opacity={0} 
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>

      {/* Selected Outline */}
      {isPendingHere && (
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.18, 0.22, 32]} />
          <meshBasicMaterial color="#fcd34d" side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Ghost Building (Pending) */}
      {isPendingHere && pendingBuild.type === 'SETTLEMENT' && (
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color={activePlayer.color} roughness={0.6} transparent opacity={0.5} />
        </mesh>
      )}
      {isPendingHere && pendingBuild.type === 'CITY' && (
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshStandardMaterial color={activePlayer.color} roughness={0.6} transparent opacity={0.5} />
        </mesh>
      )}

      {/* Actual Building Mesh */}
      {hasBuilding && vertexData.building?.type === 'SETTLEMENT' && !isPendingHere && (
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color={ownerColor || '#ffffff'} roughness={0.6} />
        </mesh>
      )}
      {hasBuilding && vertexData.building?.type === 'CITY' && (
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshStandardMaterial color={ownerColor || '#ffffff'} roughness={0.6} />
        </mesh>
      )}
    </group>
  );
}

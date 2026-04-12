import { useMemo, useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCatanStore } from '../store/catanStore';
import * as THREE from 'three';

export function Edges3D() {
  const hexes = useCatanStore((state) => state.hexes);
  
  // Calculate all unique edges
  const edges = useMemo(() => {
    const uniqueEdges = new Map<string, { pos: THREE.Vector3, rot: number }>();
    const HEX_SIZE = 1.0;
    
    Object.values(hexes).forEach(hex => {
      for (let i = 0; i < 6; i++) {
        const angle1 = Math.PI / 6 + i * (Math.PI / 3);
        const angle2 = Math.PI / 6 + ((i + 1) % 6) * (Math.PI / 3);
        
        const v1x = hex.position.x + HEX_SIZE * Math.cos(angle1);
        const v1z = hex.position.z + HEX_SIZE * Math.sin(angle1);
        
        const v2x = hex.position.x + HEX_SIZE * Math.cos(angle2);
        const v2z = hex.position.z + HEX_SIZE * Math.sin(angle2);
        
        const mx = (v1x + v2x) / 2;
        const mz = (v1z + v2z) / 2;
        
        // Rotation of the edge
        const rot = Math.atan2(v2z - v1z, v2x - v1x);
        
        // Round to 2 decimal places to merge shared edges
        const key = `${mx.toFixed(2)},${mz.toFixed(2)}`;
        if (!uniqueEdges.has(key)) {
          uniqueEdges.set(key, { pos: new THREE.Vector3(mx, 0.1, mz), rot });
        }
      }
    });
    
    return Array.from(uniqueEdges.entries()).map(([id, data]) => ({ id, ...data }));
  }, [hexes]);

  return (
    <group position={[0, 0.05, 0]}>
      {edges.map(e => (
        <EdgeNode key={e.id} id={e.id} position={e.pos} rotation={e.rot} />
      ))}
    </group>
  );
}

function EdgeNode({ id, position, rotation }: { id: string, position: THREE.Vector3, rotation: number }) {
  const [hovered, setHovered] = useState(false);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const startTime = useRef(Date.now());
  
  const edgesState = useCatanStore(state => state.edges);
  const players = useCatanStore(state => state.players);
  const buildMode = useCatanStore(state => state.buildMode);
  const pendingBuild = useCatanStore(state => state.pendingBuild);
  const setPendingBuild = useCatanStore(state => state.setPendingBuild);
  const activePlayerId = useCatanStore(state => state.activePlayerId);
  const activePlayer = players[activePlayerId];
  
  const edgeData = edgesState[id];
  const hasRoad = !!edgeData?.road;
  const ownerColor = hasRoad ? players[edgeData.road!.ownerId]?.color : null;

  const isPendingHere = pendingBuild?.locationId === id;
  const isRoadMode = buildMode === 'ROAD';

  const isValidRoadSpot = isRoadMode && !hasRoad; // TODO: Adjacency rule
  const isInteractable = isValidRoadSpot;

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
      setPendingBuild({ type: 'ROAD', locationId: id });
    }
  };
  
  return (
    <group position={[position.x, position.y, position.z]} rotation={[0, -rotation, 0]}>
      {/* Interaction Node */}
      <mesh 
        ref={meshRef}
        visible={isInteractable}
        onPointerOver={(e) => { if (isInteractable) { e.stopPropagation(); setHovered(true); } }}
        onPointerOut={(e) => { if (isInteractable) { e.stopPropagation(); setHovered(false); } }}
        onClick={handleClick}
      >
        <boxGeometry args={[0.6, 0.1, 0.2]} />
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
          <planeGeometry args={[0.7, 0.3]} />
          <meshBasicMaterial color="#fcd34d" side={THREE.DoubleSide} transparent opacity={0.5} />
        </mesh>
      )}

      {/* Ghost Road (Pending) */}
      {isPendingHere && pendingBuild.type === 'ROAD' && (
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.6, 0.1, 0.1]} />
          <meshStandardMaterial color={activePlayer.color} roughness={0.6} transparent opacity={0.5} />
        </mesh>
      )}

      {/* Actual Road Mesh */}
      {hasRoad && !isPendingHere && (
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.6, 0.1, 0.1]} />
          <meshStandardMaterial color={ownerColor || '#ffffff'} roughness={0.6} />
        </mesh>
      )}
    </group>
  );
}

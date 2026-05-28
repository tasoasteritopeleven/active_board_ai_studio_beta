import { useMemo, useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useCatanStore } from '../store/catanStore';
import { Home, Castle } from 'lucide-react';
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
  const highlightMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const startTime = useRef(Date.now());
  
  // Placement animation state
  const [placementAnimTime, setPlacementAnimTime] = useState<number | null>(null);
  const prevBuildingRef = useRef<any>(null);
  
  const verticesState = useCatanStore(state => state.vertices);
  const players = useCatanStore(state => state.players);
  const buildMode = useCatanStore(state => state.buildMode);
  const pendingBuild = useCatanStore(state => state.pendingBuild);
  const setPendingBuild = useCatanStore(state => state.setPendingBuild);
  const activePlayerId = useCatanStore(state => state.activePlayerId);
  const activePlayer = players[activePlayerId];
  
  const vertexData = verticesState[id];
  const hasBuilding = !!vertexData?.building;
  const buildingType = vertexData?.building?.type;
  const ownerColor = hasBuilding ? players[vertexData.building!.ownerId]?.color : null;
  const ownerName = hasBuilding ? players[vertexData.building!.ownerId]?.name : null;

  // Track placement for animation trigger
  useEffect(() => {
    if (vertexData?.building && vertexData.building !== prevBuildingRef.current) {
      setPlacementAnimTime(Date.now());
    }
    prevBuildingRef.current = vertexData?.building;
  }, [vertexData?.building]);

  const isPendingHere = pendingBuild?.locationId === id;
  const isSettlementMode = buildMode === 'SETTLEMENT';
  const isCityMode = buildMode === 'CITY';

  const isValidSettlementSpot = isSettlementMode && !hasBuilding; // TODO: Distance rule
  const isValidCitySpot = isCityMode && hasBuilding && vertexData.building?.type === 'SETTLEMENT' && vertexData.building?.ownerId === activePlayerId;
  const isInteractable = isValidSettlementSpot || isValidCitySpot;

  const buildingGroupRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    const elapsed = (Date.now() - startTime.current) / 1000;
    
    // Highlight pulsing
    if (isInteractable && highlightMaterialRef.current) {
      const pulse = 0.5 + Math.sin(elapsed * 4) * 0.5; // 0 to 1
      highlightMaterialRef.current.opacity = hovered ? 0.9 : 0.3 + pulse * 0.3;
    }
    
    // Hover scale for interaction node
    if (meshRef.current) {
      if (isInteractable) {
        meshRef.current.scale.setScalar(hovered ? 1.4 : 1.0);
        if (materialRef.current) {
          const targetOpacity = hovered ? 0.8 : 0.2;
          materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, targetOpacity, 0.1);
        }
      } else {
        if (materialRef.current) materialRef.current.opacity = 0;
        meshRef.current.scale.setScalar(1);
      }
    }

    // Placement animation (scale bounce)
    if (buildingGroupRef.current && placementAnimTime) {
      const timeSincePlacement = (Date.now() - placementAnimTime) / 1000;
      if (timeSincePlacement <= 0.5) {
        // Bounce ease out
        const t = timeSincePlacement / 0.5;
        const scale = 1 + Math.sin(t * Math.PI) * 0.5;
        buildingGroupRef.current.scale.setScalar(scale);
      } else {
        buildingGroupRef.current.scale.setScalar(1);
      }
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
        position={[0, 0, 0]}
      >
        <cylinderGeometry args={[0.15, 0.15, 0.05, 16]} />
        <meshBasicMaterial 
          ref={highlightMaterialRef}
          color={isCityMode ? "#3b82f6" : "#fcd34d"} 
          transparent 
          opacity={isInteractable ? (hovered ? 0.9 : 0.5) : 0} 
        />
        {isInteractable && hovered && (
          <Html center position={[0, 0.2, 0]} className="pointer-events-none">
            <div className={`px-2 py-1 rounded bg-black/80 text-white text-xs font-bold shadow-lg border ${isCityMode ? 'border-blue-500 text-blue-300' : 'border-yellow-500 text-yellow-300'}`}>
              Build {isCityMode ? 'City' : 'Settlement'}
            </div>
          </Html>
        )}
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
          <boxGeometry args={[0.25, 0.25, 0.25]} />
          <meshStandardMaterial color={activePlayer.color} roughness={0.6} transparent opacity={0.5} />
        </mesh>
      )}
      {isPendingHere && pendingBuild.type === 'CITY' && (
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.3, 0.4, 0.3]} />
          <meshStandardMaterial color={activePlayer.color} roughness={0.6} transparent opacity={0.5} />
        </mesh>
      )}

      {/* Actual Building Mesh */}
      {hasBuilding && !isPendingHere && (
        <group ref={buildingGroupRef} position={[0, 0, 0]}>
          {vertexData.building?.type === 'SETTLEMENT' && (
            <mesh position={[0, 0.15, 0]}>
              <boxGeometry args={[0.25, 0.25, 0.25]} />
              <meshStandardMaterial color={ownerColor || '#ffffff'} roughness={0.6} />
              <Html center position={[0, 0.35, 0]} className="pointer-events-none">
                <div 
                  className="flex flex-col items-center justify-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
                  style={{ color: ownerColor || '#ffffff' }}
                >
                  <Home size={18} fill="currentColor" className="opacity-90" />
                  <span className="text-[10px] font-black uppercase text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] leading-none mt-0.5" style={{ textShadow: '0 1px 2px black' }}>
                    {ownerName}
                  </span>
                </div>
              </Html>
            </mesh>
          )}
          
          {vertexData.building?.type === 'CITY' && (
            <mesh position={[0, 0.2, 0]}>
              <boxGeometry args={[0.3, 0.4, 0.3]} />
              <meshStandardMaterial color={ownerColor || '#ffffff'} roughness={0.6} />
              <Html center position={[0, 0.5, 0]} className="pointer-events-none">
                <div 
                  className="flex flex-col items-center justify-center drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
                  style={{ color: ownerColor || '#ffffff' }}
                >
                  <Castle size={22} fill="currentColor" className="opacity-90" />
                  <span className="text-[10px] font-black uppercase text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] leading-none mt-0.5" style={{ textShadow: '0 1px 2px black' }}>
                    {ownerName}
                  </span>
                </div>
              </Html>
            </mesh>
          )}
        </group>
      )}
    </group>
  );
}

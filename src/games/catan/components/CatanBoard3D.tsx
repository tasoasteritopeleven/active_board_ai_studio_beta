import { Canvas, useThree } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { useCatanStore } from '../store/catanStore';
import { HexTile3D } from './HexTile3D';
import { RealisticDice } from '@/components/game/RealisticDice';
import { Water3D } from './Water3D';
import { ResourceFlow3D } from './ResourceFlow3D';
import { Vertices3D } from './Vertices3D';
import { Edges3D } from './Edges3D';
import { Ports3D } from './Ports3D';
import { ResourcePopups3D } from './ui/ResourcePopups3D';
import { Telepresence3D } from './ui/Telepresence3D';
import { Suspense, useEffect } from 'react';
import { TableForgeXRScene } from '@/components/xr/TableForgeXRScene';

function ResponsiveCamera() {
  const { size, camera } = useThree();
  useEffect(() => {
    if (size.width < size.height) {
      (camera as any).fov = 65;
    } else {
      (camera as any).fov = 45;
    }
    (camera as any).updateProjectionMatrix();
  }, [size.width, size.height, camera]);
  return null;
}

export function CatanBoard3D() {
  const hexes = useCatanStore((state) => state.hexes);
  const resourceFlows = useCatanStore((state) => state.resourceFlows);
  const removeResourceFlow = useCatanStore((state) => state.removeResourceFlow);
  const diceResult = useCatanStore((state) => state.diceResult);
  const diceRollId = useCatanStore((state) => state.diceRollId);

  return (
    <div className="w-full h-full bg-slate-950 touch-none overscroll-none select-none">
      <Canvas 
        camera={{ position: [0, 8, 10], fov: 45 }} 
        dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 3) : 2}
        gl={{ 
          antialias: true, 
          stencil: false, 
          depth: true, 
          powerPreference: "high-performance",
          alpha: false
        }}
      >
        <Suspense fallback={null}>
          <TableForgeXRScene originPosition={[0, 1.2, -0.75]} orbitMinDistance={4} orbitMaxDistance={25}>
          <ResponsiveCamera />
          {/* Lighting Setup (Clean and clear) */}
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[10, 20, 10]}
            intensity={1.2}
          />

          {/* Table Surface */}
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[12, 12, 0.2, 128]} />
            <meshStandardMaterial color="#2d1b11" roughness={0.9} metalness={0.1} />
          </mesh>
          {/* Felt Inlay */}
          <mesh position={[0, -0.09, 0]}>
            <cylinderGeometry args={[11.5, 11.5, 0.02, 128]} />
            <meshStandardMaterial color="#14532d" roughness={1} metalness={0} />
          </mesh>

          {/* Animated Water */}
          <Water3D />

          <Physics>
            <group position={[0, 0.1, 0]}>
              {Object.values(hexes).map((hex, index) => (
                <HexTile3D key={hex.id} hex={hex} index={index} />
              ))}
            </group>
            
            <Edges3D />
            <Vertices3D />
            <ResourcePopups3D />
            
            <RealisticDice 
              result={diceResult} 
              rollId={diceRollId} 
            />

            {/* Invisible floor for dice */}
            <RigidBody type="fixed" position={[0, 0.1, 0]}>
              <mesh visible={false}>
                <boxGeometry args={[30, 0.1, 30]} />
                <meshBasicMaterial />
              </mesh>
            </RigidBody>
          </Physics>

          <ResourceFlow3D flows={resourceFlows} onComplete={removeResourceFlow} />
          
          <Telepresence3D />
          </TableForgeXRScene>
        </Suspense>
      </Canvas>
    </div>
  );
}

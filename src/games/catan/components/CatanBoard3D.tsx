import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
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
import { Suspense } from 'react';

export function CatanBoard3D() {
  const hexes = useCatanStore((state) => state.hexes);
  const resourceFlows = useCatanStore((state) => state.resourceFlows);
  const removeResourceFlow = useCatanStore((state) => state.removeResourceFlow);

  return (
    <div className="w-full h-full bg-slate-950">
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
            
            <RealisticDice result={useCatanStore((state) => state.diceResult)} />

            {/* Invisible floor for dice */}
            <RigidBody type="fixed" position={[0, 0.1, 0]}>
              <mesh visible={false}>
                <boxGeometry args={[30, 0.1, 30]} />
                <meshBasicMaterial />
              </mesh>
            </RigidBody>
          </Physics>

          <ResourceFlow3D flows={resourceFlows} onComplete={removeResourceFlow} />

          <OrbitControls 
            makeDefault 
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 2.1} 
            minDistance={4} 
            maxDistance={25} 
            enableDamping={true}
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

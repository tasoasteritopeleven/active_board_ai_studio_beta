import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Text,
  PerspectiveCamera,
  Environment,
  Html,
  ContactShadows,
} from '@react-three/drei';
import * as THREE from 'three';
import { MonopolyState, BOARD } from './monopolyEngine';
import { PresencePanel3D } from '@/components/game/PresencePanel3D';

const C = 1.6; // Corner size
const W = 1.0; // Space width
const BOARD_SIZE = C * 2 + W * 9;

function getSpacePosition(index: number): [number, number, number] {
  const half = BOARD_SIZE / 2;
  const edgeDist = +(half - C / 2);
  let x = 0;
  let z = 0;
  let rotation = 0;

  if (index === 0) { // GO (Bottom Right)
    x = edgeDist; z = edgeDist; rotation = 0; // or Math.PI / 4
  } else if (index < 10) { // Bottom row (Leftwards)
    x = half - C - (index - 0.5) * W; 
    z = edgeDist; 
    rotation = 0;
  } else if (index === 10) { // Jail (Bottom Left)
    x = -edgeDist; z = edgeDist; rotation = 0;
  } else if (index < 20) { // Left row (Upwards)
    x = -edgeDist;
    z = edgeDist - C/2 - W/2 - (index - 11) * W;
    rotation = Math.PI / 2;
  } else if (index === 20) { // Free Parking (Top Left)
    x = -edgeDist; z = -edgeDist; rotation = 0;
  } else if (index < 30) { // Top row (Rightwards)
    x = -edgeDist + C/2 + W/2 + (index - 21) * W;
    z = -edgeDist;
    rotation = Math.PI;
  } else if (index === 30) { // Go to Jail (Top Right)
    x = edgeDist; z = -edgeDist; rotation = 0;
  } else { // Right row (Downwards)
    x = edgeDist;
    z = -edgeDist + C/2 + W/2 + (index - 31) * W;
    rotation = -Math.PI / 2;
  }

  return [x, 0, z];
}

function Space3D({ index, space, owner }: { index: number; space: any; owner?: string }) {
  const [x, y, z] = getSpacePosition(index);
  const isCorner = index % 10 === 0;
  const width = isCorner ? C : W;
  const height = isCorner ? C : C;
  
  // Base rotation
  let rotY = 0;
  if (!isCorner) {
    if (index > 0 && index < 10) rotY = 0;
    else if (index > 10 && index < 20) rotY = Math.PI / 2;
    else if (index > 20 && index < 30) rotY = Math.PI;
    else if (index > 30 && index < 40) rotY = -Math.PI / 2;
  }

  return (
    <group position={[x, y + 0.05, z]} rotation={[0, rotY, 0]}>
      <mesh receiveShadow castShadow>
        <boxGeometry args={[width, 0.1, height]} />
        <meshStandardMaterial color={owner ? owner : "#FFFBEA"} roughness={0.8} />
      </mesh>
      
      {/* Property Color Bar */}
      {space.type === 'property' && space.color && (
        <mesh position={[0, 0.055, -height/2 + 0.2]}>
          <boxGeometry args={[width - 0.1, 0.02, 0.4]} />
          <meshStandardMaterial color={space.color} />
        </mesh>
      )}

      {/* Property Name */}
      <Text
        position={[0, 0.052, isCorner ? 0 : 0.1]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={isCorner ? 0.2 : 0.12}
        color="#222"
        anchorX="center"
        anchorY="middle"
        maxWidth={width - 0.1}
        textAlign="center"
        font="https://fonts.gstatic.com/s/oswald/v49/TK3_WkUHHAIjg75cFRf3bXL8LICs1_FvsUtiZTaR.woff"
      >
        {space.name.toUpperCase()}
      </Text>
      
      {/* Property Price */}
      {space.price && (
        <Text
          position={[0, 0.052, height/2 - 0.2]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.12}
          color="#333"
          anchorX="center"
          anchorY="middle"
        >
          ${space.price}
        </Text>
      )}
    </group>
  );
}

// Player Piece
function PlayerPiece({ player, state }: { player: any, state: MonopolyState }) {
  const [x, y, z] = getSpacePosition(player.position);
  // Add some jitter based on player ID to avoid total overlap
  const jitterX = (parseInt(player.id.replace('p','')) - 2) * 0.2;
  const jitterZ = (parseInt(player.id.replace('p','')) - 2) * 0.2;
  
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((s) => {
    if (groupRef.current) {
      groupRef.current.position.lerp(new THREE.Vector3(x + jitterX, 0.15, z + jitterZ), 0.1);
    }
  });

  return (
    <group ref={groupRef} position={[x + jitterX, 0.15, z + jitterZ]}>
      {/* Simple pawn for now */}
      <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.0, 0.2, 0.4, 16]} />
        <meshStandardMaterial color={player.color} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.05, 16]} />
        <meshStandardMaterial color={player.color} roughness={0.3} metalness={0.7} />
      </mesh>
      
      {/* Light for current player */}
      {state.currentPlayerId === player.id && (
        <pointLight intensity={0.5} distance={2} color={player.color} position={[0, 0.5, 0]} />
      )}
      
      {/* Bubble text on top */}
      <Html position={[0, 0.6, 0]} center zIndexRange={[100,0]} distanceFactor={8}>
        <div className="bg-slate-900/90 text-white text-[10px] px-2 py-1 rounded-full font-bold border" style={{ borderColor: player.color }}>
          ${player.money}
        </div>
      </Html>
    </group>
  );
}

export default function MonopolyBoard3D({ gameState }: { gameState: MonopolyState }) {
  return (
    <div className="w-full h-full bg-slate-950 overflow-hidden relative">
      <Canvas shadows camera={{ position: [0, 8, 12], fov: 45 }}>
        <color attach="background" args={['#0A0C10']} />
        
        <ambientLight intensity={0.6} />
        <directionalLight 
           position={[10, 20, 10]} 
           intensity={1.2} 
           castShadow 
           shadow-mapSize={[2048, 2048]} 
           shadow-camera-left={-10}
           shadow-camera-right={10}
           shadow-camera-top={10}
           shadow-camera-bottom={-10}
        />
        <Environment preset="city" />

        {/* The Table */}
        <mesh position={[0, -0.2, 0]} receiveShadow>
          <boxGeometry args={[BOARD_SIZE + 4, 0.2, BOARD_SIZE + 4]} />
          <meshStandardMaterial color="#442b15" roughness={0.9} metalness={0.1} />
        </mesh>
        
        {/* Table Felt */}
        <mesh position={[0, -0.09, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[BOARD_SIZE + 2, BOARD_SIZE + 2]} />
          <meshStandardMaterial color="#2d5a27" roughness={0.95} metalness={0.0} />
        </mesh>

        <group position={[0, 0, 0]}>
          {/* Monopoly Board Background */}
          <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.05, 0]} receiveShadow>
            <planeGeometry args={[BOARD_SIZE - (C*2), BOARD_SIZE - (C*2)]} />
            <meshStandardMaterial color="#DCF4DD" roughness={0.8} />
          </mesh>
          <Text
            position={[0, 0.055, 0]}
            rotation={[-Math.PI/2, 0, Math.PI/4]}
            fontSize={1.5}
            color="#E53935"
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/oswald/v49/TK3_WkUHHAIjg75cFRf3bXL8LICs1_FvsUtiZTaR.woff"
            outlineWidth={0.05}
            outlineColor="#fff"
          >
            MONOPOLY
          </Text>

          {/* Spaces */}
          {BOARD.map(space => {
            const propState = gameState.properties[space.index];
            const owner = propState?.ownerId ? gameState.players.find(p => p.id === propState.ownerId)?.color : undefined;
            return <Space3D key={space.index} index={space.index} space={space} owner={owner} />;
          })}
          
          {/* Players */}
          {gameState.players.map(p => (
            <PlayerPiece key={p.id} player={p} state={gameState} />
          ))}
        </group>
        
        <OrbitControls 
           enablePan={false}
           minPolarAngle={Math.PI / 6}
           maxPolarAngle={Math.PI / 2.2}
           minDistance={8}
           maxDistance={25}
        />
        <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.4} far={1} />
      </Canvas>
    </div>
  );
}

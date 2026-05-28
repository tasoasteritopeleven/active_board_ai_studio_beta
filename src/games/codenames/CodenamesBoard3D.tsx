import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Text,
  PerspectiveCamera,
  Environment,
  Html,
  ContactShadows,
  useTexture,
} from '@react-three/drei';
import * as THREE from 'three';
import { CodenamesState, CodenamesCard } from './codenamesEngine';

const CARD_WIDTH = 2.4;
const CARD_HEIGHT = 1.6;
const CARD_MARGIN = 0.2;

function Card3D({ 
  card, 
  index,
  spymasterView,
  onClick
}: { 
  card: CodenamesCard; 
  index: number; 
  spymasterView: boolean;
  onClick: () => void;
}) {
  const row = Math.floor(index / 5);
  const col = index % 5;

  const startX = -2 * (CARD_WIDTH + CARD_MARGIN);
  const startZ = -2 * (CARD_HEIGHT + CARD_MARGIN);

  const x = startX + col * (CARD_WIDTH + CARD_MARGIN);
  const z = startZ + row * (CARD_HEIGHT + CARD_MARGIN);

  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Animation: slight lift and rotation on hover, flip when revealed
  const isRevealed = card.revealed;
  const isKnown = isRevealed || spymasterView;
  
  let targetY = isRevealed ? 0.05 : 0.1;
  if (!isRevealed && hovered && !spymasterView) {
    targetY = 0.2;
  }

  const animating = hovered || isRevealed;

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    if (!animating) {
      groupRef.current.position.y = targetY;
      groupRef.current.rotation.x = isRevealed ? Math.PI : 0;
      return;
    }
    if (groupRef.current) {
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 10 * delta);
      // Flip animation
      const targetRotX = isRevealed ? Math.PI : 0;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 10 * delta);
      // Hover tilt
      if (!isRevealed && hovered && !spymasterView) {
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, Math.sin(state.clock.elapsedTime * 4) * 0.03, 10 * delta);
      } else {
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 10 * delta);
      }
    }
  });

  const getCardColor = () => {
    if (card.type === 'red') return '#EF4444';
    if (card.type === 'blue') return '#3B82F6';
    if (card.type === 'assassin') return '#1E293B';
    return '#E2E8F0'; // neutral
  };

  const getAgentText = () => {
    if (card.type === 'red') return 'RED AGENT';
    if (card.type === 'blue') return 'BLUE AGENT';
    if (card.type === 'assassin') return 'ASSASSIN';
    return 'BYSTANDER';
  };

  return (
    <group 
      ref={groupRef} 
      position={[x, targetY, z]}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      {/* Front Face (Word) */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[CARD_WIDTH, 0.05, CARD_HEIGHT]} />
        <meshStandardMaterial color={spymasterView ? getCardColor() : "#FAFAFA"} roughness={0.6} metalness={0.1} />
      </mesh>
      
      {/* Text on Front */}
      <Text
        position={[0, 0.026, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.25}
        color={spymasterView ? (card.type === 'neutral' ? '#111' : '#FFF') : '#111'}
        anchorX="center"
        anchorY="middle"
        maxWidth={CARD_WIDTH - 0.2}
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
        fontWeight="bold"
      >
        {card.word.toUpperCase()}
      </Text>

      {/* Back Face (Revealed Agent Identity) */}
      <group rotation={[Math.PI, 0, 0]} position={[0, -0.026, 0]}>
        {/* Slightly offset to prevent Z-fighting with box itself */}
        <mesh position={[0, 0, 0]}>
           <planeGeometry args={[CARD_WIDTH - 0.1, CARD_HEIGHT - 0.1]} />
           <meshStandardMaterial color={getCardColor()} roughness={0.4} />
        </mesh>
        
        <Text
          position={[0, 0.01, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.22}
          color={card.type === 'neutral' ? '#333' : '#FFF'}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          letterSpacing={0.1}
        >
          {getAgentText()}
        </Text>
      </group>
    </group>
  );
}

export default function CodenamesBoard3D({ 
  gameState, 
  onGuess
}: { 
  gameState: CodenamesState;
  onGuess: (index: number) => void;
}) {
  return (
    <div className="w-full h-full bg-slate-950 overflow-hidden relative">
      <Canvas shadows camera={{ position: [0, 10, 10], fov: 45 }}>
        <color attach="background" args={['#0f172a']} />
        
        {/* Lighting setup designed for tabletop games */}
        <ambientLight intensity={0.4} />
        <directionalLight 
           position={[5, 15, 5]} 
           intensity={1.0} 
           castShadow 
           shadow-mapSize={[2048, 2048]} 
           shadow-bias={-0.0001}
        />
        <pointLight position={[-5, 5, -5]} intensity={0.6} color="#e0f2fe" />
        <Environment preset="apartment" />

        {/* The gaming table */}
        <mesh position={[0, -0.1, 0]} receiveShadow>
           <boxGeometry args={[25, 0.2, 18]} />
           <meshStandardMaterial color="#3b2313" roughness={0.9} metalness={0.1} />
        </mesh>
        
        {/* Neoprene Playmat */}
        <mesh position={[0, 0.01, 0]} receiveShadow rotation={[-Math.PI/2, 0, 0]}>
           <planeGeometry args={[18, 12]} />
           <meshStandardMaterial color="#1a1c23" roughness={1.0} metalness={0.0} />
        </mesh>

        <group position={[0, 0, 0]}>
          {gameState.cards.map((card, index) => (
            <Card3D 
              key={card.word} 
              card={card} 
              index={index} 
              spymasterView={gameState.spymasterView}
              onClick={() => {
                if (!card.revealed && !gameState.winner && (gameState.phase !== 'clue' || gameState.spymasterView)) {
                  onGuess(index);
                }
              }}
            />
          ))}
        </group>
        
        <OrbitControls 
           enablePan={false}
           minPolarAngle={Math.PI / 8}
           maxPolarAngle={Math.PI / 2.2}
           minDistance={8}
           maxDistance={20}
        />
        <ContactShadows resolution={1024} scale={20} blur={2} opacity={0.6} far={2} />
      </Canvas>
      
      {/* 2D Overlay for Status */}
      {gameState.spymasterView && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-yellow-950 px-4 py-2 rounded-full font-bold text-sm tracking-widest shadow-lg isolate animate-pulse">
          SPYMASTER VIEW ENABLED
        </div>
      )}
    </div>
  );
}

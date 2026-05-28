import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBox } from '@react-three/cannon';
import * as THREE from 'three';
import { useCatanStore } from '../store/catanStore';
import { LifecyclePhase } from '../domain/types';

// Simple texturing function to generate a dice face
function createDiceTexture(number: number, color: string = '#dc2626') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = 'white';

  const dot = (x: number, y: number) => {
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();
  };

  const c = 128;
  const q1 = 64;
  const q3 = 192;

  if (number === 1) {
    dot(c, c);
  } else if (number === 2) {
    dot(q1, q1); dot(q3, q3);
  } else if (number === 3) {
    dot(q1, q1); dot(c, c); dot(q3, q3);
  } else if (number === 4) {
    dot(q1, q1); dot(q3, q1); dot(q1, q3); dot(q3, q3);
  } else if (number === 5) {
    dot(q1, q1); dot(q3, q1); dot(c, c); dot(q1, q3); dot(q3, q3);
  } else if (number === 6) {
    dot(q1, q1); dot(q3, q1); dot(q1, c); dot(q3, c); dot(q1, q3); dot(q3, q3);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

const texturesRed = [
  createDiceTexture(1, '#ef4444'),
  createDiceTexture(6, '#ef4444'),
  createDiceTexture(2, '#ef4444'),
  createDiceTexture(5, '#ef4444'),
  createDiceTexture(3, '#ef4444'),
  createDiceTexture(4, '#ef4444'),
];
const texturesYellow = [
  createDiceTexture(1, '#eab308'),
  createDiceTexture(6, '#eab308'),
  createDiceTexture(2, '#eab308'),
  createDiceTexture(5, '#eab308'),
  createDiceTexture(3, '#eab308'),
  createDiceTexture(4, '#eab308'),
];

export function Dice3D() {
  const diceResult = useCatanStore(state => state.diceResult);
  const diceRollId = useCatanStore(state => state.diceRollId);
  const phase = useCatanStore(state => state.phase);

  const [rolling, setRolling] = useState(false);
  
  useEffect(() => {
    if (diceResult && diceRollId > 0) {
      setRolling(true);
      const timer = setTimeout(() => setRolling(false), 2500); // Roll animation duration
      return () => clearTimeout(timer);
    }
  }, [diceRollId, diceResult]);

  if (!rolling && (!diceResult || phase === LifecyclePhase.ROLLING)) return null;

  return (
    <group position={[0, 3, 0]}>
      {/* Visual Dice with animated physics-like bouncing. 
          To do true physics bias easily without cannon-es complex setup, 
          we animate the mesh to tumble randomly and then smoothly snap to the target rotation. */}
      {diceResult && (
        <>
          <AnimatedDie targetNumber={diceResult[0]} offset={-1} colorTextures={texturesRed} rolling={rolling} rollId={diceRollId} />
          <AnimatedDie targetNumber={diceResult[1]} offset={1} colorTextures={texturesYellow} rolling={rolling} rollId={diceRollId} />
        </>
      )}
    </group>
  );
}

function AnimatedDie({ targetNumber, offset, colorTextures, rolling, rollId }: { targetNumber: number, offset: number, colorTextures: THREE.Texture[], rolling: boolean, rollId: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Calculate target rotation based on what index in the materials array should face up.
  // Material order: right, left, top, bottom, front, back
  // Index 0: 1 (right) (+x) -> needs to be top (+y)
  // Index 1: 6 (left) (-x)
  // Index 2: 2 (top) (+y)
  // Index 3: 5 (bottom) (-y)
  // Index 4: 3 (front) (+z)
  // Index 5: 4 (back) (-z)
  
  const targetRotations: Record<number, [number, number, number]> = {
    1: [0, 0, Math.PI / 2],      // Right face (1) top
    6: [0, 0, -Math.PI / 2],     // Left face (6) top
    2: [0, 0, 0],                // Top face (2) top
    5: [Math.PI, 0, 0],          // Bottom face (5) top
    3: [-Math.PI / 2, 0, 0],     // Front face (3) top
    4: [Math.PI / 2, 0, 0],      // Back face (4) top
  };
  
  const initialPos = new THREE.Vector3(offset * 2, 8, 2);
  const targetPos = new THREE.Vector3(offset * 1.5, 0.5, 0); // Board height is ~0
  
  const [startRot, setStartRot] = useState(new THREE.Euler());
  const randomSpin = useRef(new THREE.Vector3(Math.random()*10, Math.random()*10, Math.random()*10));
  
  useEffect(() => {
    if (rolling) {
      setStartRot(new THREE.Euler(Math.random()*Math.PI*2, Math.random()*Math.PI*2, Math.random()*Math.PI*2));
      randomSpin.current = new THREE.Vector3(Math.random()*20 - 10, Math.random()*20 - 10, Math.random()*20 - 10);
    }
  }, [rolling, rollId]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    if (rolling) {
      // Fake physics logic
      // Assume a 2-second roll duration represented by an internal clock or simple interpolation
      // Instead of an absolute timeline, we lerp heavily based on rolling state.
      // Since `rolling` stays true for 2.5s, let's do a fast bounce.
      const time = state.clock.getElapsedTime();
      const fallProgress = (time * 2) % 2.5; // Roughly
      
      meshRef.current.position.lerp(targetPos, 0.1);
      
      // Tumbling
      meshRef.current.rotation.x += randomSpin.current.x * delta;
      meshRef.current.rotation.y += randomSpin.current.y * delta;
      meshRef.current.rotation.z += randomSpin.current.z * delta;
      
      // Gradually damp the spin
      randomSpin.current.lerp(new THREE.Vector3(0,0,0), 0.05);
      
    } else {
      // Settle smoothly
      const tr = targetRotations[targetNumber];
      const targetQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(tr[0], tr[1], tr[2]));
      meshRef.current.quaternion.slerp(targetQuat, 0.15);
      meshRef.current.position.lerp(targetPos, 0.15);
    }
  });

  return (
    <mesh ref={meshRef} position={initialPos} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      {colorTextures.map((tex, i) => (
        <meshStandardMaterial key={i} attach={`material-${i}`} map={tex} roughness={0.4} metalness={0.1} />
      ))}
    </mesh>
  );
}

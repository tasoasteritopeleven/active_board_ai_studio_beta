import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';

function Pip({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.06, 16, 16]} />
      <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
    </mesh>
  );
}

export function RealisticDice({ result, rollId }: { result: [number, number] | null, rollId?: number }) {
  if (!result) return null;

  return (
    <group>
      <DieRigidBody value={result[0]} color="#dc2626" startPos={[-1.5, 4, 0]} targetPos={[-0.6, 0.25, 0]} rollId={rollId} />
      <DieRigidBody value={result[1]} color="#1e293b" startPos={[1.5, 4, 0.5]} targetPos={[0.6, 0.25, 0]} rollId={rollId} />
    </group>
  );
}

const DieRigidBody = ({ value, color, startPos, targetPos, rollId }: { value: number, color: string, startPos: [number, number, number], targetPos: [number, number, number], rollId?: number }) => {
  const ref = useRef<RapierRigidBody>(null);
  const [phase, setPhase] = useState<'rolling' | 'settling' | 'settled'>('settled');
  const rollStartTime = useRef(0);
  const startSettlingPos = useRef(new THREE.Vector3());
  const startSettlingRot = useRef(new THREE.Quaternion());
  const targetRot = useRef(new THREE.Quaternion());

  // Visual rotation to put the target value on the +Y face
  const visualRotation = useMemo(() => {
    switch (value) {
      case 1: return new THREE.Euler(0, 0, 0);
      case 6: return new THREE.Euler(Math.PI, 0, 0);
      case 2: return new THREE.Euler(-Math.PI / 2, 0, 0);
      case 5: return new THREE.Euler(Math.PI / 2, 0, 0);
      case 3: return new THREE.Euler(0, 0, Math.PI / 2);
      case 4: return new THREE.Euler(0, 0, -Math.PI / 2);
      default: return new THREE.Euler(0, 0, 0);
    }
  }, [value]);

  useEffect(() => {
    if (ref.current && rollId !== undefined && rollId > 0) {
      setPhase('rolling');
      rollStartTime.current = Date.now();
      
      // Reset position and wake up
      ref.current.setTranslation({ x: startPos[0], y: startPos[1], z: startPos[2] }, true);
      ref.current.setRotation({ x: Math.random(), y: Math.random(), z: Math.random(), w: 1 }, true);
      ref.current.setBodyType(0, true); // 0 = dynamic
      
      // Apply random impulse and torque with more force to simulate a good physical roll
      const impulseX = (Math.random() * 2 - 1) * 3;
      const impulseY = -2 - Math.random() * 2;
      const impulseZ = (Math.random() * 2 - 1) * 3;
      const impulse = { x: impulseX, y: impulseY, z: impulseZ };
      
      const torque = { x: Math.random() * 20 - 10, y: Math.random() * 20 - 10, z: Math.random() * 20 - 10 };
      
      ref.current.applyImpulse(impulse, true);
      ref.current.applyTorqueImpulse(torque, true);
    }
  }, [value, startPos, rollId]);

  useFrame(() => {
    if (!ref.current) return;
    
    const elapsed = (Date.now() - rollStartTime.current) / 1000;

    if (phase === 'rolling' && elapsed > 1.2) {
      // Switch to settling earlier so we have more time to settle elegantly
      setPhase('settling');
      ref.current.setBodyType(1, true); // 1 = kinematicPositionBased
      
      const currentPos = ref.current.translation();
      const currentRot = ref.current.rotation();
      
      startSettlingPos.current.set(currentPos.x, currentPos.y, currentPos.z);
      startSettlingRot.current.set(currentRot.x, currentRot.y, currentRot.z, currentRot.w);
      
      // Target rotation is upright (so visual mesh's +Y is up) with random yaw + small roll/pitch wobble to make it less stiff
      const yaw = Math.random() * Math.PI * 2;
      targetRot.current.setFromEuler(new THREE.Euler(0, yaw, 0));
    } else if (phase === 'settling') {
      const settleProgress = (elapsed - 1.2) / 0.8; // 0.8 seconds to settle
      
      if (settleProgress >= 1.0) {
        setPhase('settled');
        ref.current.setTranslation({ x: targetPos[0], y: targetPos[1], z: targetPos[2] }, true);
        ref.current.setRotation(targetRot.current, true);
      } else {
        // Ease out with decaying bounce
        const t = settleProgress;
        
        // Easing function for smoother rotational snap
        const easeT = 1 - Math.pow(1 - t, 4);
        
        // More realistic multi-bounce decaying amplitude
        const rawBounce = Math.abs(Math.cos(t * Math.PI * 6));
        const decay = Math.pow(1 - t, 3.5);
        const bounce = rawBounce * decay * 0.6;
        
        const newPos = new THREE.Vector3().lerpVectors(startSettlingPos.current, new THREE.Vector3(...targetPos), easeT);
        newPos.y += bounce; // Add bounce to Y
        
        const nextRot = new THREE.Quaternion().slerpQuaternions(startSettlingRot.current, targetRot.current, easeT);
        
        // Add tiny wobble on impact
        const wobble = Math.sin(t * Math.PI * 10) * decay * 0.1;
        const wobbleRot = new THREE.Quaternion().setFromEuler(new THREE.Euler(wobble, 0, wobble));
        nextRot.multiply(wobbleRot);
        
        ref.current.setNextKinematicTranslation(newPos);
        ref.current.setNextKinematicRotation(nextRot);
      }
    }
  });

  // Material variations for physics
  const isRedDie = color === '#dc2626';
  const restitution = isRedDie ? 0.85 : 0.90; // higher bounciness
  const friction = isRedDie ? 0.3 : 0.25; // less friction for more rolling
  const angularDamping = isRedDie ? 0.05 : 0.08; // less damping = more tumbling
  const mass = isRedDie ? 1.2 : 1.0;

  return (
    <RigidBody 
      ref={ref} 
      colliders="cuboid" 
      restitution={restitution} 
      friction={friction}
      linearDamping={0.05}
      angularDamping={angularDamping}
      mass={mass}
    >
      <group rotation={visualRotation}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color={color} roughness={0.2} metalness={0.1} />
          
          {/* Face 1 (Top) */}
          <Pip position={[0, 0.251, 0]} />
          
          {/* Face 6 (Bottom) */}
          <Pip position={[0.12, -0.251, 0.12]} />
          <Pip position={[0.12, -0.251, 0]} />
          <Pip position={[0.12, -0.251, -0.12]} />
          <Pip position={[-0.12, -0.251, 0.12]} />
          <Pip position={[-0.12, -0.251, 0]} />
          <Pip position={[-0.12, -0.251, -0.12]} />

          {/* Face 2 (Front) */}
          <Pip position={[0.12, 0.12, 0.251]} />
          <Pip position={[-0.12, -0.12, 0.251]} />

          {/* Face 5 (Back) */}
          <Pip position={[0, 0, -0.251]} />
          <Pip position={[0.12, 0.12, -0.251]} />
          <Pip position={[-0.12, -0.12, -0.251]} />
          <Pip position={[0.12, -0.12, -0.251]} />
          <Pip position={[-0.12, 0.12, -0.251]} />

          {/* Face 3 (Right) */}
          <Pip position={[0.251, 0.12, 0.12]} />
          <Pip position={[0.251, 0, 0]} />
          <Pip position={[0.251, -0.12, -0.12]} />

          {/* Face 4 (Left) */}
          <Pip position={[-0.251, 0.12, 0.12]} />
          <Pip position={[-0.251, 0.12, -0.12]} />
          <Pip position={[-0.251, -0.12, 0.12]} />
          <Pip position={[-0.251, -0.12, -0.12]} />
        </mesh>
      </group>
    </RigidBody>
  );
};

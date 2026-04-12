import { useMemo } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';

const HEX_SIZE = 1.0;
const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE;
const HEX_HEIGHT = 2 * HEX_SIZE;

// Port locations based on standard Catan board (radius 2)
// Each port is associated with a specific hex (q, r, s) and an angle
const PORT_LOCATIONS = [
  { q: 0, r: -2, s: 2, angle: -Math.PI / 6, type: '3:1' },
  { q: 2, r: -2, s: 0, angle: Math.PI / 6, type: 'Wheat' },
  { q: 2, r: -1, s: -1, angle: Math.PI / 2, type: 'Ore' },
  { q: 1, r: 1, s: -2, angle: 5 * Math.PI / 6, type: '3:1' },
  { q: -1, r: 2, s: -1, angle: 7 * Math.PI / 6, type: 'Sheep' },
  { q: -2, r: 2, s: 0, angle: 7 * Math.PI / 6, type: '3:1' },
  { q: -2, r: 1, s: 1, angle: 9 * Math.PI / 6, type: '3:1' },
  { q: -1, r: -1, s: 2, angle: 11 * Math.PI / 6, type: 'Brick' },
  { q: 1, r: -2, s: 1, angle: -Math.PI / 6, type: 'Wood' },
];

const PORT_COLORS: Record<string, string> = {
  '3:1': '#ffffff',
  'Wheat': '#fbbf24',
  'Ore': '#94a3b8',
  'Sheep': '#86efac',
  'Brick': '#f87171',
  'Wood': '#166534',
};

function Port({ position, angle, type }: { position: [number, number, number], angle: number, type: string }) {
  return (
    <group position={position} rotation={[0, angle, 0]}>
      {/* Wooden Dock */}
      <mesh position={[0, 0.05, 0.8]}>
        <boxGeometry args={[0.4, 0.05, 0.6]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      {/* Dock Posts */}
      <mesh position={[-0.15, 0.1, 1.0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.3]} />
        <meshStandardMaterial color="#451a03" roughness={0.9} />
      </mesh>
      <mesh position={[0.15, 0.1, 1.0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.3]} />
        <meshStandardMaterial color="#451a03" roughness={0.9} />
      </mesh>
      
      {/* Trade Sign */}
      <group position={[0, 0.2, 1.0]} rotation={[-Math.PI / 6, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.3, 0.2, 0.02]} />
          <meshStandardMaterial color="#fef3c7" roughness={0.8} />
        </mesh>
        <Text
          position={[0, 0, 0.015]}
          fontSize={0.08}
          color={PORT_COLORS[type] || '#000000'}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {type === '3:1' ? '3:1' : '2:1'}
        </Text>
        {type !== '3:1' && (
          <Text
            position={[0, -0.06, 0.015]}
            fontSize={0.04}
            color={PORT_COLORS[type]}
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {type.toUpperCase()}
          </Text>
        )}
      </group>
    </group>
  );
}

export function Ports3D() {
  const ports = useMemo(() => {
    return PORT_LOCATIONS.map((port, index) => {
      const x = HEX_WIDTH * (port.q + port.r / 2);
      const z = HEX_HEIGHT * (3 / 4) * port.r;
      return {
        id: `port-${index}`,
        position: [x, 0.1, z] as [number, number, number],
        angle: port.angle,
        type: port.type,
      };
    });
  }, []);

  return (
    <group>
      {ports.map(port => (
        <Port key={port.id} position={port.position} angle={port.angle} type={port.type} />
      ))}
    </group>
  );
}

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { ResourceType } from '../domain/types';

interface Resource3DProps {
  type: ResourceType;
}

const ResourceModel = ({ type }: { type: ResourceType }) => {
  switch (type) {
    case ResourceType.WOOD:
      return (
        <mesh>
          <cylinderGeometry args={[0.4, 0.4, 1.5, 16]} />
          <meshStandardMaterial color="#8b4513" roughness={0.9} />
        </mesh>
      );
    case ResourceType.BRICK:
      return (
        <mesh>
          <boxGeometry args={[1.2, 0.6, 0.6]} />
          <meshStandardMaterial color="#b22222" roughness={0.8} />
        </mesh>
      );
    case ResourceType.SHEEP:
      return (
        <group>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.6, 16, 16]} />
            <meshStandardMaterial color="#ffffff" roughness={1} />
          </mesh>
          <mesh position={[0.5, 0.3, 0]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial color="#212121" roughness={0.5} />
          </mesh>
        </group>
      );
    case ResourceType.WHEAT:
      return (
        <group>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 1.5, 8]} />
            <meshStandardMaterial color="#ffd700" />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
            <coneGeometry args={[0.3, 0.6, 8]} />
            <meshStandardMaterial color="#ffd700" />
          </mesh>
        </group>
      );
    case ResourceType.ORE:
      return (
        <mesh>
          <dodecahedronGeometry args={[0.7]} />
          <meshStandardMaterial color="#757575" roughness={0.4} metalness={0.6} />
        </mesh>
      );
    default:
      return null;
  }
};

export function Resource3D({ type }: Resource3DProps) {
  return (
    <div className="w-12 h-12">
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Environment preset="city" />
        <group rotation={[0.4, Math.PI / 4, 0]}>
          <ResourceModel type={type} />
        </group>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2} />
      </Canvas>
    </div>
  );
}

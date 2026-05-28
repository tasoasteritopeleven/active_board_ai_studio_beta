import { ReactNode } from 'react';
import { XR, XROrigin, useXR } from '@react-three/xr';
import { OrbitControls } from '@react-three/drei';
import { tableForgeXRStore } from '@/xr/tableForgeXR';

interface TableForgeXRSceneProps {
  children: ReactNode;
  /** World offset for the board table in VR (seated, table-scale). */
  originPosition?: [number, number, number];
  orbitMinDistance?: number;
  orbitMaxDistance?: number;
}

function DesktopOrbitControls({
  minDistance = 4,
  maxDistance = 25,
}: {
  minDistance?: number;
  maxDistance?: number;
}) {
  const session = useXR((s) => s.session);
  if (session) return null;

  return (
    <OrbitControls
      makeDefault
      enableZoom
      enablePan
      enableRotate
      rotateSpeed={1}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2.3}
      minDistance={minDistance}
      maxDistance={maxDistance}
      enableDamping
      dampingFactor={0.05}
      zoomSpeed={1.2}
    />
  );
}

export function TableForgeXRScene({
  children,
  originPosition = [0, 1.35, -0.85],
  orbitMinDistance,
  orbitMaxDistance,
}: TableForgeXRSceneProps) {
  return (
    <XR store={tableForgeXRStore}>
      <XROrigin position={originPosition} scale={0.85}>
        {children}
      </XROrigin>
      <DesktopOrbitControls minDistance={orbitMinDistance} maxDistance={orbitMaxDistance} />
    </XR>
  );
}

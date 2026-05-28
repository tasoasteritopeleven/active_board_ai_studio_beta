import { useRef, useEffect } from 'react';
import { Html, PivotControls } from '@react-three/drei';
import * as THREE from 'three';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTelepresenceOptional } from '@/contexts/TelepresenceContext';

interface Player {
  id: string;
  name: string;
  color: string;
}

interface PresencePanel3DProps {
  player: Player;
  position: [number, number, number];
  rotation: [number, number, number];
  isLocal?: boolean;
  isLayoutMode?: boolean;
}

export function PresencePanel3D({
  player,
  position,
  rotation,
  isLocal,
  isLayoutMode,
}: PresencePanel3DProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const telepresence = useTelepresenceOptional();

  const isVideoEnabled = isLocal ? (telepresence?.isVideoEnabled ?? false) : false;
  const isAudioEnabled = isLocal ? (telepresence?.isAudioEnabled ?? false) : false;

  const stream = isLocal
    ? telepresence?.localStream ?? null
    : telepresence?.getRemoteStream(player.id) ?? null;

  const latency = isLocal ? 0 : (telepresence?.getLatencyMs(player.id) ?? 0);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const toggleVideo = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isLocal) telepresence?.toggleVideo();
  };

  const toggleAudio = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isLocal) telepresence?.toggleAudio();
  };

  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.lookAt(new THREE.Vector3(0, position[1] + 7, 0));
    }
  }, [position]);

  const showVideo = Boolean(stream) && (isLocal ? isVideoEnabled : true);

  const content = (
    <Html transform occlude="blending" distanceFactor={10} style={{ width: '256px', height: '192px' }}>
      <div
        className="w-full h-full bg-slate-900/80 backdrop-blur-md border-[3px] rounded-xl overflow-hidden flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.5)]"
        style={{ borderColor: player.color }}
      >
        <div className="bg-slate-800/80 px-3 py-1 flex justify-between items-center border-b border-slate-700">
          <span className="text-white font-bold text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: player.color }} />
            {player.name}
          </span>
          <span className="text-green-400 text-[10px] font-mono flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            {telepresence?.enabled ? 'WebRTC' : 'LOCAL'} • {isLocal ? '0ms' : `${latency}ms`}
          </span>
        </div>

        <div className="flex-1 relative bg-black overflow-hidden pointer-events-auto">
          {showVideo ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={isLocal}
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800">
              <VideoOff className="w-8 h-8 mb-2 opacity-30 text-white" />
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                style={{ backgroundColor: player.color }}
              >
                {player.name[0]}
              </div>
            </div>
          )}

          {isLocal && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900/80 backdrop-blur rounded px-2 py-1 z-30">
              <Button
                variant="ghost"
                size="icon"
                className={`w-8 h-8 rounded-full hover:bg-slate-700 ${!isAudioEnabled ? 'text-red-400' : 'text-slate-300'}`}
                onClick={toggleAudio}
              >
                {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`w-8 h-8 rounded-full hover:bg-slate-700 ${!isVideoEnabled ? 'text-red-400' : 'text-slate-300'}`}
                onClick={toggleVideo}
              >
                {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </Button>
            </div>
          )}

          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-10 opacity-60" />
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] z-20" />
        </div>
      </div>
    </Html>
  );

  const avatar = (
    <group position={[0, 1.2, 0]} scale={[0.5, 0.5, 0.5]}>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.5, 0.2, 16]} />
        <meshStandardMaterial color={player.color} roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.8, 0.3]} />
        <meshStandardMaterial color={player.color} roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color={player.color}
          roughness={0.5}
          metalness={0.1}
          emissive="#fff"
          emissiveIntensity={0.1}
        />
      </mesh>
    </group>
  );

  if (isLayoutMode) {
    return (
      <group position={position} ref={groupRef}>
        <PivotControls scale={1.5} activeAxes={[true, true, true]}>
          {avatar}
          {content}
        </PivotControls>
      </group>
    );
  }

  return (
    <group position={position} ref={groupRef}>
      {avatar}
      {content}
    </group>
  );
}

import { useRef, useEffect, useState } from 'react';
import { Html, PivotControls } from '@react-three/drei';
import * as THREE from 'three';

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

export function PresencePanel3D({ player, position, rotation, isLocal, isLayoutMode }: PresencePanel3DProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (isLocal) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(s => {
          setStream(s);
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch(err => console.warn("Could not access camera for presence panel:", err));
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isLocal]);

  const content = (
    <Html transform position={[0, 0, 0]} rotation={[0, 0, 0]} scale={0.1}>
      <div className="w-64 h-48 bg-slate-900/80 backdrop-blur-md border-2 rounded-xl overflow-hidden flex flex-col shadow-2xl" style={{ borderColor: player.color }}>
        {/* Header */}
        <div className="bg-slate-800/80 px-3 py-1 flex justify-between items-center border-b border-slate-700">
          <span className="text-white font-bold text-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: player.color }}></div>
            {player.name}
          </span>
          <span className="text-green-400 text-[10px] font-mono flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            LIVE • {isLocal ? '0ms' : Math.floor(Math.random() * 80 + 20) + 'ms'}
          </span>
        </div>
        
        {/* Video / Avatar Area */}
        <div className="flex-1 relative bg-black overflow-hidden">
          {isLocal && stream ? (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-80" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-800">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg" style={{ backgroundColor: player.color }}>
                {player.name[0]}
              </div>
            </div>
          )}
          
          {/* CRT Scanline overlay effect */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-10 opacity-60" />
          
          {/* Vignette */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] z-20" />
        </div>
      </div>
    </Html>
  );

  if (isLayoutMode) {
    return (
      <group position={position} rotation={rotation}>
        <PivotControls scale={1.5} activeAxes={[true, true, true]}>
          {content}
        </PivotControls>
      </group>
    );
  }

  return <group position={position} rotation={rotation}>{content}</group>;
}

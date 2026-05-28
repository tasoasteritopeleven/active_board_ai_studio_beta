import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useCatanStore } from '../../store/catanStore';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';

const SLOT_RADIUS = 22;
const HEIGHT = 0.2;

// We need 6 slots: Local, Opposite, and 4 remaining sides in a hexagon shape
const SLOTS = [
  new THREE.Vector3(0, HEIGHT, SLOT_RADIUS), // 0: Local (bottom)
  new THREE.Vector3(0, HEIGHT, -SLOT_RADIUS), // 1: Opposite (top)
  new THREE.Vector3(SLOT_RADIUS * 0.866, HEIGHT, SLOT_RADIUS * 0.5), // 2: Bottom Right
  new THREE.Vector3(SLOT_RADIUS * 0.866, HEIGHT, -SLOT_RADIUS * 0.5), // 3: Top Right
  new THREE.Vector3(-SLOT_RADIUS * 0.866, HEIGHT, SLOT_RADIUS * 0.5), // 4: Bottom Left
  new THREE.Vector3(-SLOT_RADIUS * 0.866, HEIGHT, -SLOT_RADIUS * 0.5), // 5: Top Left
];

export function Telepresence3D() {
  const { players, activePlayerId } = useCatanStore();
  
  // Create a mapping of player to slot index
  // P1 is always 0 (Local).
  // Active player (if not P1) is always 1 (Opposite).
  // Others fill remaining slots 2-5 logically around the board.

  const allPlayerIds = Object.keys(players);
  const playerSlotMapping: Record<string, number> = {};
  
  playerSlotMapping['p1'] = 0;
  
  let remainingSlots = [2, 3, 4, 5];
  
  if (activePlayerId !== 'p1' && allPlayerIds.includes(activePlayerId)) {
    playerSlotMapping[activePlayerId] = 1;
  } else if (allPlayerIds.length > 1) {
    // If P1 is active, we just put P2 in opposite so it's not empty, or leave it. 
    // Let's put P2 opposite.
    const p2Id = allPlayerIds.find(p => p !== 'p1');
    if (p2Id) playerSlotMapping[p2Id] = 1;
  }

  // Fill remaining
  let nextSlotIdx = 0;
  allPlayerIds.forEach(pid => {
    if (playerSlotMapping[pid] === undefined) {
      if (nextSlotIdx < remainingSlots.length) {
         playerSlotMapping[pid] = remainingSlots[nextSlotIdx];
         nextSlotIdx++;
      }
    }
  });

  return (
    <group>
      {allPlayerIds.map(pid => (
        <PlayerCamera3D 
          key={pid}
          playerId={pid} 
          position={SLOTS[playerSlotMapping[pid]] || SLOTS[0]} 
          isLocal={pid === 'p1'}
        />
      ))}
    </group>
  );
}

interface PlayerCamera3DProps {
  playerId: string;
  position: THREE.Vector3;
  isLocal?: boolean;
}

function PlayerCamera3D({ 
  playerId, position, isLocal
}: PlayerCamera3DProps) {
  const { players, activePlayerId, setupPhase, setupRolls } = useCatanStore();
  const player = players[playerId];
  const isActive = activePlayerId === playerId;
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isVideoEnabled || isAudioEnabled) {
      navigator.mediaDevices.getUserMedia({ 
        video: isVideoEnabled, 
        audio: isAudioEnabled 
      })
      .then(s => setStream(s))
      .catch(err => {
        console.warn("Could not access media devices for " + playerId + ". Ensure permissions are granted.");
        setIsVideoEnabled(false);
        setIsAudioEnabled(false);
      });
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isVideoEnabled, isAudioEnabled]);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const toggleVideo = () => setIsVideoEnabled(!isVideoEnabled);
  const toggleAudio = () => setIsAudioEnabled(!isAudioEnabled);
  
  const groupRef = useRef<THREE.Group>(null);
  const targetPos = useRef(position.clone());

  // Update target position if it changes (smooth lerp)
  useEffect(() => {
    targetPos.current.copy(position);
  }, [position]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Look at center but higher up, so they lean back like an easel
    const lookTarget = new THREE.Vector3(0, groupRef.current.position.y + 7, 0);
    groupRef.current.lookAt(lookTarget);
    
    // Small hover effect if active
    if (isActive) {
      const hover = Math.sin(state.clock.elapsedTime * 2) * 0.2;
      groupRef.current.position.y = targetPos.current.y + hover;
    }
  });

  return (
      <group ref={groupRef} position={position}>
        <Html 
          transform 
          occlude="blending"
        className="will-change-transform"
        style={{
          width: '280px', 
          height: '180px',
        }}
        distanceFactor={10} 
      >
        <div 
          className={`w-full h-full pointer-events-auto bg-slate-900 border-4 rounded-xl overflow-hidden shadow-2xl relative flex items-center justify-center transition-colors duration-500`}
          style={{ borderColor: isActive ? player.color : '#1e293b' }}
        >
          {isActive && (
            <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(255,255,255,0.2)] pointer-events-none z-10"></div>
          )}

          {isLocal && (
            <div className="absolute top-2 left-2 z-20 bg-blue-600/90 backdrop-blur text-white text-xs font-bold px-2 py-0.5 rounded shadow">
              YOU
            </div>
          )}

          {setupPhase === 'DETERMINING_ORDER' && setupRolls[playerId] && (
            <div className="absolute inset-x-0 bottom-0 top-0 m-auto h-20 w-32 bg-slate-950/90 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl flex flex-col items-center justify-center z-40 animate-in zoom-in spin-in-1 duration-500">
               <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">ΖΑΡΙΑ</span>
               <span className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]">{setupRolls[playerId]}</span>
            </div>
          )}

          {stream && isVideoEnabled ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted={true} // always mute in simulation to prevent mic feedback loop
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-500 w-full h-full bg-slate-800">
              <VideoOff className="w-10 h-10 mb-2 opacity-50" />
              <span 
                className="text-sm font-bold uppercase tracking-widest text-slate-400 px-4 text-center max-w-full truncate" 
                style={{ color: player.color }}
              >
                {player?.name || playerId}
              </span>
            </div>
          )}

          {/* Controls for all for testing */}
          <div className={`absolute ${isLocal ? 'bottom-2' : 'top-2'} ${isLocal ? 'left-1/2 -translate-x-1/2' : 'right-2'} flex items-center gap-1 bg-slate-900/80 backdrop-blur rounded px-2 py-1 z-30`}>
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

          {/* CRT Scanline overlay effect */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-20 opacity-60" />
          
          {/* Vignette */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] z-25" />
        </div>
      </Html>
    </group>
  );
}

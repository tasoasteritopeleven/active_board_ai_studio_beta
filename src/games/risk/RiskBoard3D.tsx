/**
 * TableForge - Risk 3D World Map Board  
 * Physical board game on a war-room table with recognizable continent shapes,
 * territory markers, 3D army pieces, and interactive gameplay
 */

import { useRef, useState, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Text,
  PerspectiveCamera,
  Html,
  Environment,
  useTexture,
  Billboard,
  Float,
} from '@react-three/drei';
import { EffectComposer, Bloom, DepthOfField, Vignette, SMAA } from '@react-three/postprocessing';
import * as THREE from 'three';
import { type GameState, type Territory, CONTINENTS } from './RiskEngine';
import { PresencePanel3D } from '@/components/game/PresencePanel3D';

// ============================================================================
// FLAT MAP APPROACH — Like a real Risk board game on a table
// Territory positions map from engine 2D coords (0-800, 0-520) to 3D table
// ============================================================================

const CONTINENT_BG_COLORS: Record<string, string> = {
  'north-america': '#C4A240',  // Warm gold
  'south-america': '#B85C38',  // Terracotta
  'europe': '#4A7AB5',         // Steel blue
  'africa': '#7B5EA7',         // Purple
  'asia': '#4AAA60',           // Forest green
  'australia': '#C76B8A',      // Rose
};

const CONTINENT_LABEL_COLORS: Record<string, string> = {
  'north-america': '#FFD700',
  'south-america': '#FF6B6B',
  'europe': '#60A5FA',
  'africa': '#C084FC',
  'asia': '#4ADE80',
  'australia': '#F472B6',
};

// Scale from engine coords to 3D table
function toBoard(x: number, y: number): [number, number, number] {
  // Map 800x520 engine space to 50x32 board space
  return [(x / 800) * 50 - 25, 0.12, (y / 520) * 32 - 16];
}

// ============================================================================
// TERRITORY PIECE — A colored game piece sitting on the board
// ============================================================================

interface TerritoryPieceProps {
  territory: Territory;
  playerColor: string;
  continentColor: string;
  isSelected: boolean;
  isAttackSource: boolean;
  isAttackTarget: boolean;
  onClick: () => void;
}

function TerritoryPiece({ territory, playerColor, continentColor, isSelected, isAttackSource, isAttackTarget, onClick }: TerritoryPieceProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const pos = useMemo(() => toBoard(territory.position.x, territory.position.y), [territory.position]);

  // Create dashed border geometry
  const borderGeo = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(theta) * 1.3, Math.sin(theta) * 1.3, 0));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  // Animate hover and pulsing highlight
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      const lift = hovered ? 0.15 : isSelected ? 0.1 : 0;
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, pos[1] + lift, 0.1);
    }
    if (ringRef.current && isSelected) {
      const scale = 1 + Math.sin(t * 4) * 0.05;
      ringRef.current.scale.set(scale, scale, 1);
      const material = ringRef.current.material as THREE.MeshBasicMaterial;
      if (material) material.opacity = 0.6 + Math.sin(t * 4) * 0.2;
    }
  });

  const isHighlighted = isSelected || isAttackSource || isAttackTarget;
  const borderColor = isAttackTarget ? '#FF4444' : isAttackSource ? '#FFCC00' : isSelected ? '#FFFFFF' : continentColor;

  // Army type visual: 1-4 = infantry, 5-9 = cavalry, 10+ = cannon
  const armyType = territory.armies >= 10 ? 'artillery' : territory.armies >= 5 ? 'cavalry' : 'infantry';

  return (
    <group ref={groupRef} position={[pos[0], pos[1], pos[2]]}>
      {/* Continent background circle (always visible, shows which continent) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <circleGeometry args={[1.3, 64]} />
        <meshStandardMaterial color={continentColor} roughness={0.8} transparent opacity={0.4} />
      </mesh>

      {/* Dashed border representing the state boundary */}
      <lineLoop geometry={borderGeo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]} onUpdate={(self) => self.computeLineDistances()}>
        <lineDashedMaterial color="#ffffff" transparent opacity={0.5} dashSize={0.2} gapSize={0.2} />
      </lineLoop>

      {/* Highlight ring when selected/attacking */}
      {isHighlighted && (
        <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
          <ringGeometry args={[1.05, 1.35, 64]} />
          <meshBasicMaterial color={borderColor} transparent opacity={0.7} />
        </mesh>
      )}

      {/* Main territory disc — player ownership color */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
      >
        <cylinderGeometry args={[1.0, 1.0, 0.1, 64]} />
        <meshStandardMaterial
          color={playerColor}
          roughness={0.5}
          metalness={0.15}
          emissive={hovered ? playerColor : '#000000'}
          emissiveIntensity={hovered ? 0.3 : 0}
        />
      </mesh>

      {/* Army figurine on top of disc */}
      <group position={[0, 0.06, 0]}>
        {armyType === 'infantry' && (
          <>
            {/* Soldier body */}
            <mesh position={[0, 0.18, 0]} castShadow>
              <capsuleGeometry args={[0.08, 0.2, 8, 16]} />
              <meshStandardMaterial color={playerColor} roughness={0.5} metalness={0.2} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 0.38, 0]} castShadow>
              <sphereGeometry args={[0.07, 16, 16]} />
              <meshStandardMaterial color={playerColor} roughness={0.5} metalness={0.2} />
            </mesh>
            {/* Weapon/rifle */}
            <mesh position={[0.06, 0.25, 0]} rotation={[0, 0, 0.3]} castShadow>
              <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
              <meshStandardMaterial color="#444" metalness={0.6} roughness={0.3} />
            </mesh>
          </>
        )}
        {armyType === 'cavalry' && (
          <>
            {/* Horse body */}
            <mesh position={[0, 0.12, 0]} castShadow>
              <boxGeometry args={[0.25, 0.15, 0.12]} />
              <meshStandardMaterial color={playerColor} roughness={0.5} metalness={0.2} />
            </mesh>
            {/* Horse head */}
            <mesh position={[0.15, 0.2, 0]} rotation={[0, 0, 0.5]} castShadow>
              <boxGeometry args={[0.06, 0.12, 0.06]} />
              <meshStandardMaterial color={playerColor} roughness={0.5} metalness={0.2} />
            </mesh>
            {/* Rider */}
            <mesh position={[0, 0.28, 0]} castShadow>
              <capsuleGeometry args={[0.05, 0.12, 8, 12]} />
              <meshStandardMaterial color={playerColor} roughness={0.5} metalness={0.3} />
            </mesh>
          </>
        )}
        {armyType === 'artillery' && (
          <>
            {/* Cannon barrel */}
            <mesh position={[0.1, 0.1, 0]} rotation={[0, 0, 0.3]} castShadow>
              <cylinderGeometry args={[0.04, 0.06, 0.3, 16]} />
              <meshStandardMaterial color="#555" metalness={0.7} roughness={0.2} />
            </mesh>
            {/* Cannon base/carriage */}
            <mesh position={[0, 0.05, 0]} castShadow>
              <boxGeometry args={[0.2, 0.06, 0.12]} />
              <meshStandardMaterial color={playerColor} roughness={0.5} metalness={0.2} />
            </mesh>
            {/* Wheels */}
            <mesh position={[-0.08, 0.05, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.02, 16]} />
              <meshStandardMaterial color="#333" metalness={0.5} roughness={0.4} />
            </mesh>
            <mesh position={[-0.08, 0.05, -0.08]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.02, 16]} />
              <meshStandardMaterial color="#333" metalness={0.5} roughness={0.4} />
            </mesh>
          </>
        )}
      </group>

      {/* Army count — Billboard for readability */}
      <Billboard position={[0, 1.2, 0]}>
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <Text
            fontSize={0.5}
            color="#FFFFFF"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.06}
            outlineColor="#000"
            fontWeight="bold"
          >
            {String(territory.armies)}
          </Text>
        </Float>
      </Billboard>

      {/* Territory name & Continent — Billboard below */}
      <Billboard position={[0, -0.6, 0.8]}>
        <group>
          <Text
            fontSize={0.28}
            color="#FFFFFF"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.04}
            outlineColor="#000"
            fontWeight="bold"
          >
            {territory.name}
          </Text>
          <Text
            position={[0, -0.25, 0]}
            fontSize={0.16}
            color={continentColor}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000"
            letterSpacing={0.1}
          >
            {territory.continent.replace('-', ' ').toUpperCase()}
          </Text>
        </group>
      </Billboard>
    </group>
  );
}

// ============================================================================
// CONNECTION LINES between neighboring territories
// ============================================================================

function ConnectionLines({ gameState }: { gameState: GameState }) {
  const lines = useMemo(() => {
    const result: { from: [number, number, number]; to: [number, number, number]; sameOwner: boolean }[] = [];
    gameState.territories.forEach(t => {
      t.neighbors.forEach(nid => {
        if (t.id > nid) return;
        const n = gameState.territories.find(x => x.id === nid);
        if (!n) return;
        
        const sameOwner = t.ownerId === n.ownerId && t.ownerId !== null;
        
        // Handle wrap-around connections (like Alaska to Kamchatka)
        if (Math.abs(t.position.x - n.position.x) > 400) {
          const leftNode = t.position.x < n.position.x ? t : n;
          const rightNode = t.position.x < n.position.x ? n : t;
          
          // Draw line from left node to left edge
          result.push({
            from: toBoard(leftNode.position.x, leftNode.position.y),
            to: toBoard(-50, (leftNode.position.y + rightNode.position.y) / 2),
            sameOwner
          });
          
          // Draw line from right node to right edge
          result.push({
            from: toBoard(rightNode.position.x, rightNode.position.y),
            to: toBoard(850, (leftNode.position.y + rightNode.position.y) / 2),
            sameOwner
          });
          return;
        }
        
        result.push({
          from: toBoard(t.position.x, t.position.y),
          to: toBoard(n.position.x, n.position.y),
          sameOwner,
        });
      });
    });
    return result;
  }, [gameState.territories]);

  return (
    <group>
      {lines.map((l, i) => {
        const pts = [new THREE.Vector3(l.from[0], 0.08, l.from[2]), new THREE.Vector3(l.to[0], 0.08, l.to[2])];
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        return (
          <primitive object={new THREE.Line(geo)} key={i} onUpdate={(self: THREE.Line) => self.computeLineDistances()}>
            <lineDashedMaterial 
              color={l.sameOwner ? '#ffffff' : '#1e293b'} 
              transparent 
              opacity={l.sameOwner ? 0.4 : 0.6} 
              dashSize={0.4}
              gapSize={0.2}
            />
          </primitive>
        );
      })}
    </group>
  );
}

// ============================================================================
// CONTINENT NAME LABELS floating above the board
// ============================================================================

function ContinentLabels({ gameState }: { gameState: GameState }) {
  return (
    <group>
      {CONTINENTS.map(c => {
        const ts = gameState.territories.filter(t => t.continent === c.id);
        if (!ts.length) return null;
        const ax = ts.reduce((s, t) => s + t.position.x, 0) / ts.length;
        const ay = ts.reduce((s, t) => s + t.position.y, 0) / ts.length;
        const p = toBoard(ax, ay);
        return (
          <Text key={c.id} position={[p[0], 0.25, p[2] - 2.2]} rotation={[-Math.PI / 2, 0, 0]}
            fontSize={0.55} color={CONTINENT_LABEL_COLORS[c.id] || '#fff'}
            anchorX="center" anchorY="middle" fillOpacity={0.8}
            outlineWidth={0.04} outlineColor="#000"
          >
            {c.name} (+{c.bonus})
          </Text>
        );
      })}
    </group>
  );
}

// ============================================================================
// BOARD CONTENT — the full 3D scene
// ============================================================================

interface BoardContentProps {
  gameState: GameState;
  selectedTerritory: string | null;
  onTerritoryClick: (territoryId: string) => void;
  onReinforce?: (id: string, amount: number) => void;
  isLayoutMode?: boolean;
}

function BoardContent({ gameState, selectedTerritory, onTerritoryClick, onReinforce, isLayoutMode }: BoardContentProps) {
  // High-resolution stylized world map for Risk feel
  const mapTexture = useTexture('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2066&auto=format&fit=crop');
  
  const getPlayerColor = (pid: string | null) => {
    if (!pid) return '#666666';
    return gameState.players.find(p => p.id === pid)?.color || '#666666';
  };

  const selectedTerritoryData = useMemo(() => 
    gameState.territories.find(t => t.id === selectedTerritory),
    [gameState.territories, selectedTerritory]
  );

  const currentPlayer = useMemo(() => 
    gameState.players.find(p => p.id === gameState.currentPlayerId),
    [gameState.players, gameState.currentPlayerId]
  );

  return (
    <>
      {/* Cinematic Lighting Rig - BRIGHTER for better visibility */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[15, 25, 15]} intensity={2.5} castShadow shadow-mapSize={[4096, 4096]} shadow-bias={-0.0001} />
      <pointLight position={[-15, 20, -15]} intensity={1.2} color="#a855f7" />
      <spotLight position={[0, 40, 0]} intensity={2.0} angle={0.8} penumbra={1.0} castShadow />
      
      {/* HDR Environment for realistic reflections */}
      <Environment preset="studio" />

      {/* Camera — top-down angled view like looking at a board game */}
      <PerspectiveCamera makeDefault position={[0, 32, 15]} fov={45} />
      <OrbitControls 
        enablePan 
        enableZoom 
        enableRotate 
        minDistance={12} 
        maxDistance={60} 
        maxPolarAngle={Math.PI / 2.2} 
        minPolarAngle={0.05}
        makeDefault
      />

      <color attach="background" args={['#0A0C10']} />
      <fog attach="fog" args={['#0A0C10', 45, 80]} />

      {/* === WAR ROOM TABLE === */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[60, 0.3, 42]} />
        <meshStandardMaterial color="#6B4423" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* Board surface — printed map (flat) */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[54, 36]} />
        <meshStandardMaterial 
          map={mapTexture} 
          color="#ffffff" 
          roughness={0.2} 
          metalness={0.05}
          emissive="#2A4B6E"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Ocean grid lines for map feel */}
      <gridHelper args={[54, 27, '#2A4B6E', '#2A4B6E']} position={[0, 0.03, 0]} />

      {/* Brass table edge trim - BRIGHTER */}
      {[[-27.1, 0, 0], [27.1, 0, 0]].map(([x, , z], i) => (
        <mesh key={`ev${i}`} position={[x, 0, z]}>
          <boxGeometry args={[0.3, 0.35, 36.4]} />
          <meshStandardMaterial color="#D4AF37" roughness={0.2} metalness={0.8} />
        </mesh>
      ))}
      {[[0, 0, -18.1], [0, 0, 18.1]].map(([x, , z], i) => (
        <mesh key={`eh${i}`} position={[x, 0, z]}>
          <boxGeometry args={[54.4, 0.35, 0.3]} />
          <meshStandardMaterial color="#D4AF37" roughness={0.2} metalness={0.8} />
        </mesh>
      ))}

      {/* Connection lines between territories */}
      <ConnectionLines gameState={gameState} />

      {/* Continent labels */}
      <ContinentLabels gameState={gameState} />

      {/* Territory game pieces */}
      {gameState.territories.map(territory => (
        <TerritoryPiece
          key={territory.id}
          territory={territory}
          playerColor={getPlayerColor(territory.ownerId)}
          continentColor={CONTINENT_BG_COLORS[territory.continent] || '#666'}
          isSelected={selectedTerritory === territory.id}
          isAttackSource={gameState.attackingFrom === territory.id}
          isAttackTarget={gameState.attackingTo === territory.id}
          onClick={() => onTerritoryClick(territory.id)}
        />
      ))}

      {/* 3D Deployment UI — Floating above selected territory */}
      {selectedTerritoryData && 
       gameState.phase === 'reinforce' && 
       selectedTerritoryData.ownerId === gameState.currentPlayerId && (
        <Html
          position={toBoard(selectedTerritoryData.position.x, selectedTerritoryData.position.y).map((v, i) => i === 1 ? v + 2.5 : v) as [number, number, number]}
          center
          distanceFactor={15}
          zIndexRange={[100, 0]}
        >
          <div className="flex flex-col items-center gap-2 pointer-events-auto animate-in zoom-in duration-300">
            <div className="bg-slate-900/95 backdrop-blur-2xl border-2 border-primary/50 rounded-2xl p-2 flex gap-2 shadow-[0_0_40px_rgba(0,0,0,0.7)] ring-1 ring-white/10">
              {[1, 5, 10].map(amount => (
                <button
                  key={amount}
                  onClick={() => onReinforce?.(selectedTerritoryData.id, amount)}
                  disabled={(currentPlayer?.armiesToPlace || 0) < amount}
                  className="group relative w-14 h-14 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-col items-center justify-center hover:bg-primary hover:border-primary transition-all active:scale-95 disabled:opacity-20 disabled:hover:bg-slate-800/50 disabled:active:scale-100"
                >
                  <span className="text-[10px] font-black text-slate-400 group-hover:text-white transition-colors">+{amount}</span>
                  <div className="mt-1 flex gap-0.5">
                    {amount === 1 && <div className="w-1.5 h-1.5 rounded-full bg-white/40 group-hover:bg-white/90" />}
                    {amount === 5 && Array(3).fill(0).map((_, i) => <div key={i} className="w-1 h-2 rounded-full bg-white/40 group-hover:bg-white/90" />)}
                    {amount === 10 && <div className="w-5 h-1.5 rounded-sm bg-white/40 group-hover:bg-white/90" />}
                  </div>
                  {/* Tooltip-like effect on hover */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    DEPLOY {amount}
                  </div>
                </button>
              ))}
            </div>
            {/* Pointer arrow */}
            <div className="w-4 h-4 bg-slate-900/95 border-r-2 border-b-2 border-primary/50 rotate-45 -mt-3 shadow-lg" />
          </div>
        </Html>
      )}

      {/* 3D Spatial Presence Panels */}
      {gameState.players.map((player, index) => {
        // Position panels around the table
        const angle = (index / gameState.players.length) * Math.PI * 2;
        const radius = 28;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const rotationY = -angle + Math.PI / 2;

        return (
          <PresencePanel3D
            key={player.id}
            player={player}
            position={[x, 5, z]}
            rotation={[0, rotationY, 0]}
            isLocal={index === 0} // First player is local for demo
            isLayoutMode={isLayoutMode}
          />
        );
      })}

      {/* Post-processing Pipeline */}
      <EffectComposer>
        <Bloom luminanceThreshold={1.0} mipmapBlur intensity={0.3} />
        <Vignette eskil={false} offset={0.02} darkness={0.6} />
        <SMAA />
      </EffectComposer>
    </>
  );
}

// ============================================================================
// MAIN EXPORT
// ============================================================================

interface RiskBoard3DProps {
  gameState: GameState;
  selectedTerritory: string | null;
  onTerritoryClick: (territoryId: string) => void;
  onReinforce?: (id: string, amount: number) => void;
  isLayoutMode?: boolean;
}

export default function RiskBoard3D({ gameState, selectedTerritory, onTerritoryClick, onReinforce, isLayoutMode }: RiskBoard3DProps) {
  return (
    <div className="w-full h-full bg-black overflow-hidden">
      <Canvas 
        shadows 
        gl={{ 
          antialias: true, 
          powerPreference: "high-performance",
          stencil: false,
          depth: true
        }} 
        dpr={typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 4) : 2}
      >
        <Suspense fallback={<Html center><div className="text-white font-mono animate-pulse">LOADING WORLD MAP...</div></Html>}>
          <BoardContent
            gameState={gameState}
            selectedTerritory={selectedTerritory}
            onTerritoryClick={onTerritoryClick}
            onReinforce={onReinforce}
            isLayoutMode={isLayoutMode}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

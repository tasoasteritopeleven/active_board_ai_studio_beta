import { useMemo } from 'react';
import { BoardGameTable } from '@/components/boardgame/BoardGameTable';
import { type GameState } from './RiskEngine';

const CONTINENT_COLORS: Record<string, string> = {
  'north-america': '#C4A240',
  'south-america': '#B85C38',
  europe: '#4A7AB5',
  africa: '#7B5EA7',
  asia: '#4AAA60',
  australia: '#C76B8A',
};

interface RiskBoard2DProps {
  gameState: GameState;
  selectedTerritory: string | null;
  onTerritoryClick: (id: string) => void;
}

/** Lightweight 2D fallback when WebGL is unavailable or overloaded */
export function RiskBoard2D({ gameState, selectedTerritory, onTerritoryClick }: RiskBoard2DProps) {
  const nodes = useMemo(
    () =>
      gameState.territories.map((t) => ({
        id: t.id,
        name: t.name,
        x: (t.position.x / 800) * 100,
        y: (t.position.y / 520) * 100,
        armies: t.armies,
        color: gameState.players.find((p) => p.id === t.ownerId)?.color ?? '#64748b',
        continent: t.continent,
      })),
    [gameState.territories, gameState.players],
  );

  return (
    <BoardGameTable>
      <div className="relative w-[min(96vw,900px)] aspect-[800/520]">
        <div className="absolute inset-[4%] boardgame-felt rounded-lg overflow-hidden">
          <svg viewBox="0 0 100 65" className="w-full h-full">
            <rect width="100" height="65" fill="#0d3d5c" opacity="0.35" />
            {nodes.map((n) => (
              <g
                key={n.id}
                onClick={() => onTerritoryClick(n.id)}
                className="cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onTerritoryClick(n.id)}
              >
                <circle
                  cx={n.x}
                  cy={n.y * 0.65}
                  r={selectedTerritory === n.id ? 2.8 : 2.2}
                  fill={n.color}
                  stroke={selectedTerritory === n.id ? '#fff' : CONTINENT_COLORS[n.continent] ?? '#94a3b8'}
                  strokeWidth={selectedTerritory === n.id ? 0.35 : 0.2}
                />
                <text
                  x={n.x}
                  y={n.y * 0.65 + 0.5}
                  textAnchor="middle"
                  fontSize="1.2"
                  fill="#f8fafc"
                  fontWeight="bold"
                >
                  {n.armies}
                </text>
              </g>
            ))}
          </svg>
        </div>
        {selectedTerritory && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-black/70 text-white text-xs font-bold uppercase tracking-wider">
            {gameState.territories.find((t) => t.id === selectedTerritory)?.name}
          </div>
        )}
      </div>
    </BoardGameTable>
  );
}

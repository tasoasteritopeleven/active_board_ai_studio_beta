import { HexId, HexTile, TerrainType, Vec3 } from './types';

const HEX_SIZE = 1.0;
const HEX_WIDTH = Math.sqrt(3) * HEX_SIZE;
const HEX_HEIGHT = 2 * HEX_SIZE;

// Standard Catan letter to number mapping
const LETTER_TO_NUMBER: Record<string, number> = {
  A: 5, B: 2, C: 6, D: 3, E: 8, F: 10, G: 9, H: 12, I: 11, 
  J: 4, K: 8, L: 10, M: 9, N: 4, O: 5, P: 6, Q: 3, R: 11
};

// Spiral order of coordinates for radius 2
const SPIRAL_ORDER = [
  // Ring 2
  [0, -2, 2], [1, -2, 1], [2, -2, 0], [2, -1, -1], [2, 0, -2], [1, 1, -2],
  [0, 2, -2], [-1, 2, -1], [-2, 2, 0], [-2, 1, 1], [-2, 0, 2], [-1, -1, 2],
  // Ring 1
  [0, -1, 1], [1, -1, 0], [1, 0, -1], [0, 1, -1], [-1, 1, 0], [-1, 0, 1],
  // Ring 0
  [0, 0, 0]
];

export function generateTopology(radius: number): Record<HexId, HexTile> {
  const hexes: Record<HexId, HexTile> = {};
  
  // Standard Catan distribution for radius 2
  const terrainPool = [
    TerrainType.DESERT,
    ...Array(4).fill(TerrainType.FOREST),
    ...Array(4).fill(TerrainType.PASTURE),
    ...Array(4).fill(TerrainType.FIELDS),
    ...Array(3).fill(TerrainType.HILLS),
    ...Array(3).fill(TerrainType.MOUNTAINS),
  ];
  
  // Shuffle terrain pool
  for (let i = terrainPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [terrainPool[i], terrainPool[j]] = [terrainPool[j], terrainPool[i]];
  }

  let terrainIndex = 0;

  // First, create the hexes with terrain
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) {
      const s = -q - r;
      const id = `${q},${r},${s}`;
      
      const x = HEX_WIDTH * (q + r / 2);
      const z = HEX_HEIGHT * (3 / 4) * r;
      
      const terrain = terrainPool[terrainIndex++];
      
      hexes[id] = {
        id,
        q,
        r,
        s,
        terrain,
        position: { x, y: 0, z }
      };
    }
  }

  // Then, assign number/letter tokens in a spiral, skipping the desert
  let letterCharCode = 65; // 'A'
  for (const [q, r, s] of SPIRAL_ORDER) {
    const id = `${q},${r},${s}`;
    const hex = hexes[id];
    if (hex && hex.terrain !== TerrainType.DESERT) {
      const letter = String.fromCharCode(letterCharCode++);
      hex.letterToken = letter;
      hex.numberToken = LETTER_TO_NUMBER[letter];
    }
  }
  
  return hexes;
}

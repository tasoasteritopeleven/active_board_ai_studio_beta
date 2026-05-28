import { useState } from 'react';
import { motion } from 'framer-motion';

const PIP_LAYOUT: Record<number, number[][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

function DieFace({ value, rolling }: { value: number; rolling: boolean }) {
  const pips = PIP_LAYOUT[value] ?? PIP_LAYOUT[1];
  return (
    <motion.div
      className="relative w-11 h-11 rounded-lg bg-gradient-to-br from-[#fffef9] to-[#e8e0d0] border border-[#c9b896] shadow-md"
      animate={rolling ? { rotateX: [0, 360], rotateY: [0, 360] } : {}}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      <div className="absolute inset-1 grid grid-cols-3 grid-rows-3 gap-0.5 p-0.5">
        {Array.from({ length: 9 }).map((_, i) => {
          const row = Math.floor(i / 3);
          const col = i % 3;
          const show = pips.some(([r, c]) => r === row && c === col);
          return (
            <div
              key={i}
              className={`rounded-full ${show ? 'bg-[#1a1a1a]' : 'bg-transparent'}`}
            />
          );
        })}
      </div>
    </motion.div>
  );
}

interface PhysicalDiceProps {
  onRoll?: (a: number, b: number) => void;
  className?: string;
  values?: [number, number];
  rolling?: boolean;
}

export function PhysicalDice({ onRoll, className, values, rolling: controlledRolling }: PhysicalDiceProps) {
  const [a, setA] = useState(1);
  const [b, setB] = useState(1);
  const [rolling, setRolling] = useState(false);

  const isRolling = controlledRolling ?? rolling;
  const valA = values ? values[0] : a;
  const valB = values ? values[1] : b;

  const roll = () => {
    if (controlledRolling !== undefined && values) return;
    if (!onRoll) return;
    setRolling(true);
    setTimeout(() => {
      const na = 1 + Math.floor(Math.random() * 6);
      const nb = 1 + Math.floor(Math.random() * 6);
      setA(na);
      setB(nb);
      setRolling(false);
      onRoll(na, nb);
    }, 520);
  };

  return (
    <button
      type="button"
      onClick={roll}
      className={`boardgame-dice-tray flex items-center gap-3 px-4 py-2 ${className ?? ''}`}
      style={{ cursor: onRoll ? 'pointer' : 'default' }}
    >
      <DieFace value={valA} rolling={isRolling} />
      <DieFace value={valB} rolling={isRolling} />
    </button>
  );
}

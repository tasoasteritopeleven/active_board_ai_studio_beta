import { useMemo } from 'react';

const PIP_LAYOUTS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [
    [72, 28],
    [28, 72],
  ],
  3: [
    [72, 28],
    [50, 50],
    [28, 72],
  ],
  4: [
    [28, 28],
    [72, 28],
    [28, 72],
    [72, 72],
  ],
  5: [
    [28, 28],
    [72, 28],
    [50, 50],
    [28, 72],
    [72, 72],
  ],
  6: [
    [28, 28],
    [72, 28],
    [28, 50],
    [72, 50],
    [28, 72],
    [72, 72],
  ],
};

function DieFace({ value, className }: { value: number; className?: string }) {
  const pips = PIP_LAYOUTS[Math.min(6, Math.max(1, value))] ?? PIP_LAYOUTS[1];

  return (
    <div
      className={`relative w-10 h-10 rounded-lg bg-gradient-to-br from-white to-zinc-100 border border-zinc-300/80 shadow-[3px_4px_0_#a8a29e,inset_0_1px_2px_#fff] ${className ?? ''}`}
    >
      {pips.map(([left, top], i) => (
        <span
          key={i}
          className="absolute w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-900 shadow-sm"
          style={{ left: `${left}%`, top: `${top}%` }}
        />
      ))}
    </div>
  );
}

export function PhysicalDice({
  values,
  rolling,
}: {
  values: [number, number];
  rolling?: boolean;
}) {
  const style = useMemo(
    () => ({
      transform: rolling ? 'rotate(8deg) translateY(-2px)' : 'rotate(-4deg)',
      transition: 'transform 0.2s ease',
    }),
    [rolling]
  );

  return (
    <div className="flex items-center justify-center gap-2.5 py-1" style={style}>
      <DieFace value={values[0]} />
      <DieFace value={values[1]} />
    </div>
  );
}

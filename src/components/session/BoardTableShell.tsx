import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BoardTableShellProps {
  children: ReactNode;
  className?: string;
  /** Optional felt/table tint */
  variant?: 'walnut' | 'felt' | 'war-room';
}

const VARIANTS = {
  walnut: 'from-amber-950/30 via-slate-950 to-amber-950/20',
  felt: 'from-emerald-950/25 via-slate-950 to-emerald-950/15',
  'war-room': 'from-stone-900/40 via-slate-950 to-red-950/20',
};

export function BoardTableShell({ children, className, variant = 'walnut' }: BoardTableShellProps) {
  return (
    <div
      className={cn(
        'relative rounded-2xl overflow-hidden',
        'bg-gradient-to-br',
        VARIANTS[variant],
        'ring-1 ring-amber-900/30 shadow-[inset_0_0_80px_rgba(0,0,0,0.5)]',
        className
      )}
    >
      {/* Wood grain edge */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 30%, rgba(180,120,60,0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(120,80,40,0.06) 0%, transparent 45%)
          `,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

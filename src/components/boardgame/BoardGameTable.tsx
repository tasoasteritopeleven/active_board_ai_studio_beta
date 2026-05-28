import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BoardGameTableProps {
  children: ReactNode;
  variant?: 'wood' | 'war-room' | 'felt';
  className?: string;
  /** Slight 3D tilt like looking at a table from your seat */
  tilt?: boolean;
}

export function BoardGameTable({
  children,
  variant = 'wood',
  className,
  tilt = true,
}: BoardGameTableProps) {
  const surface =
    variant === 'felt'
      ? 'bg-felt-green'
      : variant === 'war-room'
        ? 'bg-wood-table'
        : 'bg-wood-table';

  return (
    <div
      className={cn(
        'relative flex-1 min-h-0 flex items-center justify-center overflow-hidden',
        surface,
        className
      )}
    >
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 40%, transparent 0%, rgba(0,0,0,0.65) 100%)',
        }}
      />
      <div className={cn('relative z-10 w-full h-full flex items-center justify-center', tilt && 'board-perspective')}>
        <div className={cn('w-full h-full flex items-center justify-center', tilt && 'board-tilt')}>
          {children}
        </div>
      </div>
    </div>
  );
}

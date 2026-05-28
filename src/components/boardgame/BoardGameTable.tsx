import type { ReactNode } from 'react';
import '@/styles/boardgame.css';

interface BoardGameTableProps {
  children: ReactNode;
  className?: string;
}

/** Wood table + spotlight — frames any physical board component */
export function BoardGameTable({ children, className }: BoardGameTableProps) {
  return (
    <div className={`boardgame-table flex flex-col items-center justify-center ${className ?? ''}`}>
      <div className="boardgame-table-surface w-full h-full flex flex-col">{children}</div>
    </div>
  );
}

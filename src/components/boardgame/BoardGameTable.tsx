import type { ReactNode } from 'react';
import '@/styles/boardgame.css';

interface BoardGameTableProps {
  children: ReactNode;
  className?: string;
}

/** Wood table + spotlight — frames any physical board component */
export function BoardGameTable({ children, className }: BoardGameTableProps) {
  return (
    <div className={`boardgame-table ${className ?? ''}`}>
      <div className="boardgame-table-surface">{children}</div>
    </div>
  );
}

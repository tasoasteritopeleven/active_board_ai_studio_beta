import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import '@/styles/boardgame.css';

interface PhysicalTableLayoutProps {
  title: string;
  subtitle?: string;
  headerRight?: ReactNode;
  board: ReactNode;
  /** Compact controls — floats over board edge, not a full manager panel */
  actionDock?: ReactNode;
  /** Optional slim sidebar (players, log) — hidden on small screens by default */
  sidebar?: ReactNode;
}

/**
 * Board-first layout: the physical table fills the viewport;
 * chrome is minimal and peripheral (industry tabletop UX pattern).
 */
export function PhysicalTableLayout({
  title,
  subtitle,
  headerRight,
  board,
  actionDock,
  sidebar,
}: PhysicalTableLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-[#06080c] overflow-hidden text-white">
      <header className="h-12 shrink-0 border-b border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-between px-3 z-30">
        <div className="flex items-center gap-2 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 shrink-0 h-8 w-8"
            onClick={() => navigate('/games')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xs font-bold uppercase tracking-[0.15em] truncate">{title}</h1>
            {subtitle && (
              <p className="text-[9px] text-slate-500 font-mono truncate">{subtitle}</p>
            )}
          </div>
        </div>
        {headerRight && <div className="flex items-center gap-2 shrink-0">{headerRight}</div>}
      </header>

      <div className="flex-1 flex min-h-0 relative">
        <main className="flex-1 relative min-h-0 min-w-0">
          {board}
          <div className="boardgame-vignette" />
          {actionDock && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[min(96%,420px)] pointer-events-none">
              <div className="pointer-events-auto rounded-2xl border border-white/10 bg-black/55 backdrop-blur-xl shadow-2xl p-3">
                {actionDock}
              </div>
            </div>
          )}
        </main>

        {sidebar && (
          <aside className="hidden lg:flex w-72 shrink-0 border-l border-white/5 bg-black/35 backdrop-blur-md flex-col overflow-y-auto custom-scrollbar z-10">
            {sidebar}
          </aside>
        )}
      </div>
    </div>
  );
}

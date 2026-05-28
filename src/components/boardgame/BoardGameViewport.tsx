import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { UnityBoardCanvas } from '@/components/unity/UnityBoardCanvas';
import { BoardGameTable } from '@/components/boardgame/BoardGameTable';
import type { TableForgeGameId } from '@/lib/unity/bridge';

interface BoardGameViewportProps {
  game: TableForgeGameId;
  state?: object;
  /** Primary WebGL fallback — typically R3F 3D board */
  render3D: ReactNode;
  /** Secondary fallback — CSS/paper board when 3D unavailable */
  render2D?: ReactNode;
  className?: string;
}

/**
 * Tiered rendering: Unity WebGL → Three.js board → CSS tabletop.
 */
export function BoardGameViewport({
  game,
  state,
  render3D,
  render2D,
  className,
}: BoardGameViewportProps) {
  const cssFallback = render2D ? (
    <BoardGameTable>{render2D}</BoardGameTable>
  ) : null;

  const threeFallback = (
    <div className="absolute inset-0">
      <Suspense
        fallback={
          cssFallback ?? (
            <div className="boardgame-unity-loading">
              <span>Φόρτωση ταμπλό…</span>
              <div className="boardgame-unity-loading__bar" />
            </div>
          )
        }
      >
        {render3D}
      </Suspense>
      {render2D && (
        <noscript>
          <div className="absolute inset-0">{cssFallback}</div>
        </noscript>
      )}
    </div>
  );

  return (
    <UnityBoardCanvas
      game={game}
      state={state}
      className={className ?? 'absolute inset-0'}
      fallback={threeFallback}
    />
  );
}

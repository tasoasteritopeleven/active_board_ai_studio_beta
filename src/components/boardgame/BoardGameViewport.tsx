import { useEffect, useState, type ReactNode } from 'react';
import { Suspense } from 'react';
import { UnityBoardCanvas } from '@/components/unity/UnityBoardCanvas';
import { BoardGameTable } from '@/components/boardgame/BoardGameTable';
import type { TableForgeGameId } from '@/lib/unity/bridge';
import { unityBuildAvailable } from '@/lib/unity/paths';

interface BoardGameViewportProps {
  game: TableForgeGameId;
  /** Pre-stringified state from useStableBoardState */
  stateJson?: string;
  render3D: ReactNode;
  render2D?: ReactNode;
  className?: string;
}

function ThreeFallback({
  render3D,
  render2D,
  className,
}: {
  render3D: ReactNode;
  render2D?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className ?? 'absolute inset-0'}>
      <Suspense
        fallback={
          <div className="boardgame-unity-loading">
            <span>Φόρτωση ταμπλό…</span>
            <div className="boardgame-unity-loading__bar" />
          </div>
        }
      >
        {render3D}
      </Suspense>
      {render2D && (
        <div className="absolute inset-0 opacity-0 pointer-events-none" aria-hidden>
          <BoardGameTable>{render2D}</BoardGameTable>
        </div>
      )}
    </div>
  );
}

/**
 * Renders 3D board immediately; overlays Unity WebGL only when a build exists.
 */
export function BoardGameViewport({
  game,
  stateJson,
  render3D,
  render2D,
  className,
}: BoardGameViewportProps) {
  const [unityAvailable, setUnityAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      if (!cancelled) setUnityAvailable(false);
    }, 800);

    unityBuildAvailable().then((ok) => {
      if (!cancelled) {
        window.clearTimeout(timeout);
        setUnityAvailable(ok);
      }
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, []);

  const threeLayer = (
    <ThreeFallback render3D={render3D} render2D={render2D} className={className} />
  );

  if (unityAvailable !== true) {
    return threeLayer;
  }

  const parsedState = stateJson ? (JSON.parse(stateJson) as object) : undefined;

  return (
    <UnityBoardCanvas
      game={game}
      state={parsedState}
      className={className ?? 'absolute inset-0'}
      fallback={threeLayer}
    />
  );
}

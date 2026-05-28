import { useEffect, useState, type ReactNode } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import {
  buildInitPayload,
  buildStatePayload,
  parseUnityMessage,
  type TableForgeGameId,
} from '@/lib/unity/bridge';
import {
  UNITY_BUILD_PATHS,
  UNITY_BUILD_PATHS_FALLBACK,
  unityBuildAvailable,
} from '@/lib/unity/paths';
import '@/styles/boardgame.css';

interface UnityBoardCanvasProps {
  game: TableForgeGameId;
  state?: object;
  className?: string;
  fallback: ReactNode;
}

function UnityPlayer({
  game,
  state,
  className,
  useBrotli,
  onFailed,
}: {
  game: TableForgeGameId;
  state?: object;
  className?: string;
  useBrotli: boolean;
  onFailed: () => void;
}) {
  const paths = useBrotli ? UNITY_BUILD_PATHS : UNITY_BUILD_PATHS_FALLBACK;
  const { unityProvider, isLoaded, loadingProgression, sendMessage } = useUnityContext({
    ...paths,
    companyName: 'TableForge',
    productName: 'TableForge',
  });

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!isLoaded) onFailed();
    }, 45000);
    return () => window.clearTimeout(t);
  }, [isLoaded, onFailed]);

  useEffect(() => {
    window.TableForgeUnityBridge = {
      onUnityMessage: (msg) => parseUnityMessage(msg),
    };
    return () => {
      delete window.TableForgeUnityBridge;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    sendMessage('TableForgeJsBridge', 'ReceiveFromReact', buildInitPayload(game));
  }, [isLoaded, game, sendMessage]);

  useEffect(() => {
    if (!isLoaded || state === undefined) return;
    sendMessage(
      'TableForgeJsBridge',
      'ReceiveFromReact',
      buildStatePayload(state),
    );
  }, [isLoaded, state, sendMessage]);

  return (
    <div className={className ?? 'absolute inset-0'}>
      {!isLoaded && (
        <div className="boardgame-unity-loading">
          <span>Unity WebGL — {Math.round(loadingProgression * 100)}%</span>
          <div className="boardgame-unity-loading__bar" />
        </div>
      )}
      <Unity
        unityProvider={unityProvider}
        style={{ width: '100%', height: '100%', visibility: isLoaded ? 'visible' : 'hidden' }}
      />
    </div>
  );
}

export function UnityBoardCanvas({
  game,
  state,
  className,
  fallback,
}: UnityBoardCanvasProps) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [useBrotli, setUseBrotli] = useState(true);
  const [unityFailed, setUnityFailed] = useState(false);

  useEffect(() => {
    (async () => {
      const brotli = await unityBuildAvailable();
      if (brotli) {
        setAvailable(true);
        setUseBrotli(true);
        return;
      }
      const plain = await fetch(UNITY_BUILD_PATHS_FALLBACK.loaderUrl, {
        method: 'HEAD',
      }).then((r) => r.ok);
      setAvailable(plain);
      setUseBrotli(false);
    })();
  }, []);

  if (available !== true || unityFailed) {
    return <>{fallback}</>;
  }

  return (
    <UnityPlayer
      game={game}
      state={state}
      className={className}
      useBrotli={useBrotli}
      onFailed={() => setUnityFailed(true)}
    />
  );
}

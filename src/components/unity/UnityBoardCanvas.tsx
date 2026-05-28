import { useEffect, useState, useRef, type ReactNode } from 'react';
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
} from '@/lib/unity/paths';
import '@/styles/boardgame.css';

const UNITY_ENABLED =
  import.meta.env.VITE_UNITY_WEBGL === 'true' ||
  import.meta.env.VITE_UNITY_WEBGL === '1';

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

  const initSent = useRef(false);
  const lastState = useRef('');

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!isLoaded) onFailed();
    }, 20000);
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
    if (!isLoaded || initSent.current) return;
    initSent.current = true;
    sendMessage('TableForgeJsBridge', 'ReceiveFromReact', buildInitPayload(game));
  }, [isLoaded, game, sendMessage]);

  useEffect(() => {
    if (!isLoaded || state === undefined) return;
    const payload = buildStatePayload(state);
    if (payload === lastState.current) return;
    lastState.current = payload;
    sendMessage('TableForgeJsBridge', 'ReceiveFromReact', payload);
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
  if (!UNITY_ENABLED) {
    return <>{fallback}</>;
  }

  const [useBrotli] = useState(true);
  const [unityFailed, setUnityFailed] = useState(false);

  if (unityFailed) {
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

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
}: {
  game: TableForgeGameId;
  state?: object;
  className?: string;
  useBrotli: boolean;
}) {
  const paths = useBrotli ? UNITY_BUILD_PATHS : UNITY_BUILD_PATHS_FALLBACK;
  const { unityProvider, isLoaded, sendMessage } = useUnityContext({
    ...paths,
    companyName: 'TableForge',
    productName: 'TableForge',
  });

  useEffect(() => {
    window.TableForgeUnityBridge = {
      onUnityMessage: (msg) => {
        parseUnityMessage(msg);
      },
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
      <Unity
        unityProvider={unityProvider}
        style={{ width: '100%', height: '100%' }}
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

  if (available !== true) {
    return <>{fallback}</>;
  }

  return (
    <UnityPlayer
      game={game}
      state={state}
      className={className}
      useBrotli={useBrotli}
    />
  );
}

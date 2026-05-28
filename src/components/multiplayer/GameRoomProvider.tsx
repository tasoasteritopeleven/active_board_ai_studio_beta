import { ReactNode, useMemo } from 'react';
import { LiveObject } from '@liveblocks/client';
import { RoomProvider } from '@liveblocks/react';
import { liveblocksEnabled } from '@/lib/liveblocks/client';
import { TelepresenceProvider } from '@/contexts/TelepresenceContext';
import { useAuth } from '@/contexts/AuthContext';

interface GameRoomProviderProps {
  roomId: string;
  children: ReactNode;
  /** When true, initializes Liveblocks storage for Catan authoritative sync. */
  withCatanStorage?: boolean;
}

export function GameRoomProvider({
  roomId,
  children,
  withCatanStorage = false,
}: GameRoomProviderProps) {
  const { user } = useAuth();
  const localUserId = user?.id ?? 'guest-local';

  const initialStorage = useMemo(() => {
    if (!withCatanStorage) return undefined;
    return {
      catan: new LiveObject({
        version: 0,
        snapshot: '{}',
        hostConnectionId: null as number | null,
      }),
    };
  }, [withCatanStorage]);

  if (!liveblocksEnabled) {
    return (
      <TelepresenceProvider localUserId={localUserId}>{children}</TelepresenceProvider>
    );
  }

  return (
    <RoomProvider
      id={roomId}
      initialPresence={{
        telepresenceId: localUserId,
        status: 'online' as const,
        videoOn: false,
        audioOn: false,
      }}
      initialStorage={initialStorage}
    >
      <TelepresenceProvider localUserId={localUserId}>{children}</TelepresenceProvider>
    </RoomProvider>
  );
}

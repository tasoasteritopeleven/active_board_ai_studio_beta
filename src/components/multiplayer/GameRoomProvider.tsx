import { ReactNode } from 'react';
import { RoomProvider } from '@liveblocks/react';
import { liveblocksEnabled } from '@/lib/liveblocks/client';

interface GameRoomProviderProps {
  roomId: string;
  children: ReactNode;
}

/** Wraps a game session with a Liveblocks room when configured. */
export function GameRoomProvider({ roomId, children }: GameRoomProviderProps) {
  if (!liveblocksEnabled) {
    return <>{children}</>;
  }

  return (
    <RoomProvider id={roomId} initialPresence={{ cursor: null, status: 'online' as const }}>
      {children}
    </RoomProvider>
  );
}

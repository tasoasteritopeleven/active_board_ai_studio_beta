import type { LiveList, LiveObject } from '@liveblocks/client';

declare global {
  interface Liveblocks {
    Storage: {
      catanLog: LiveList<string>;
      catanCheckpoint: LiveObject<{
        seq: number;
        snapshotJson: string;
        hostConnectionId: number | null;
      }>;
    };
  }
}

export {};

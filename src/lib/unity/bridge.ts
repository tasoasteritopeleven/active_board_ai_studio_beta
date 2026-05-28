export type TableForgeGameId = 'monopoly' | 'codenames' | 'risk';

export type UnityOutboundMessage =
  | { type: 'ready'; game: string }
  | { type: string; data?: unknown };

export interface TableForgeUnityBridge {
  onUnityMessage?: (message: string) => void;
}

declare global {
  interface Window {
    TableForgeUnityBridge?: TableForgeUnityBridge;
  }
}

export function parseUnityMessage(raw: string): UnityOutboundMessage | null {
  try {
    return JSON.parse(raw) as UnityOutboundMessage;
  } catch {
    return null;
  }
}

export function buildInitPayload(game: TableForgeGameId): string {
  return JSON.stringify({ cmd: 'init', game });
}

export function buildStatePayload(state: object): string {
  return JSON.stringify({ cmd: 'state', state: JSON.stringify(state) });
}

export interface AiChatRequest {
  message: string;
  context?: string;
}

export interface AiChatResponse {
  text: string;
}

export interface CodenamesHintRequest {
  words: string[];
  team: 'red' | 'blue';
  count?: number;
}

export interface CodenamesHintResponse {
  clue: string;
  count: number;
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `AI request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export function askTableForgeAi(req: AiChatRequest) {
  return postJson<AiChatResponse>('/api/ai/chat', req);
}

export function requestCodenamesHint(req: CodenamesHintRequest) {
  return postJson<CodenamesHintResponse>('/api/ai/codenames-hint', req);
}

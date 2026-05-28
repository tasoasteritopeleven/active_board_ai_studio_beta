import { useRef } from 'react';

/** Stable JSON string for Unity bridge — avoids sendMessage spam on parent re-renders. */
export function useStableBoardState(state: object): string {
  const json = JSON.stringify(state);
  const ref = useRef(json);
  if (ref.current !== json) ref.current = json;
  return ref.current;
}

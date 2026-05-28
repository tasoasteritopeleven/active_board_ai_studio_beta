import { createXRStore, type XRStore } from '@react-three/xr';

/** Shared WebXR store for seated table-scale board game sessions. */
export const tableForgeXRStore: XRStore = createXRStore({
  hand: { model: true },
  controller: { model: true },
  gaze: true,
  transientPointer: true,
});

export function enterTableForgeVR(): Promise<XRSession | undefined> {
  return tableForgeXRStore.enterVR();
}

export function enterTableForgeAR(): Promise<XRSession | undefined> {
  return tableForgeXRStore.enterAR();
}

export function exitTableForgeXR(): void {
  tableForgeXRStore.getState().session?.end();
}

export function isWebXRSupported(): boolean {
  return typeof navigator !== 'undefined' && 'xr' in navigator;
}

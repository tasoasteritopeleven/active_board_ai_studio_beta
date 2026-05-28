const BASE = '/unity/TableForge/Build';

export const UNITY_BUILD_PATHS = {
  loaderUrl: `${BASE}/TableForge.loader.js`,
  dataUrl: `${BASE}/TableForge.data.br`,
  frameworkUrl: `${BASE}/TableForge.framework.js.br`,
  codeUrl: `${BASE}/TableForge.wasm.br`,
} as const;

/** Uncompressed fallbacks when Brotli artifacts are absent */
export const UNITY_BUILD_PATHS_FALLBACK = {
  loaderUrl: `${BASE}/TableForge.loader.js`,
  dataUrl: `${BASE}/TableForge.data`,
  frameworkUrl: `${BASE}/TableForge.framework.js`,
  codeUrl: `${BASE}/TableForge.wasm`,
} as const;

export async function unityBuildAvailable(): Promise<boolean> {
  try {
    const res = await fetch(UNITY_BUILD_PATHS.loaderUrl, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

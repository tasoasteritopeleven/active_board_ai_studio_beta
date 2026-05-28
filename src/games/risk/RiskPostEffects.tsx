import { EffectComposer, Bloom, Vignette, SMAA } from '@react-three/postprocessing';

/** Lazy-loaded post-processing stack (keeps @react-three/postprocessing out of the main Risk chunk). */
export default function RiskPostEffects() {
  return (
    <EffectComposer>
      <Bloom luminanceThreshold={1.0} mipmapBlur intensity={0.1} />
      <Vignette eskil={false} offset={0.02} darkness={0.6} />
      <SMAA />
    </EffectComposer>
  );
}

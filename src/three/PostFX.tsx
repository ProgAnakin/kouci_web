import { EffectComposer, Bloom, Vignette, ToneMapping, SMAA } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'

/**
 * Cinematic post stack. The hero <Canvas> renders `flat` (no renderer tone
 * mapping) so the composer owns color: Bloom lifts the highlights, ACES Filmic
 * tone maps, SMAA cleans the edges and a soft vignette finishes the frame.
 *
 * Depth-based effects (SSAO, depth-of-field) are intentionally omitted — their
 * extra depth/normal passes are fragile across GL drivers (depth-stencil blit
 * errors) for a full-screen background canvas. N8AO + a screen-space DOF would
 * be the robust way to add them back later.
 */
export function PostFX() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom intensity={0.5} luminanceThreshold={0.65} luminanceSmoothing={0.3} mipmapBlur radius={0.7} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <SMAA />
      <Vignette offset={0.28} darkness={0.5} eskil={false} />
    </EffectComposer>
  )
}

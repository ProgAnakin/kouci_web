/**
 * Stylised pool-water shader for the hero. Intentionally lightweight but rich:
 * a sum-of-sines height field displaces a plane, normals come from central
 * differences of that field, and the fragment stage layers a depth tint,
 * fresnel olive→silver rim, cheap animated caustics, crest foam and a silver
 * specular glint. No textures, no reflection probes — cheap enough to hold
 * 60fps while still reading convincingly as water.
 */

export const waterVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uWaveAmp;

  varying float vElevation;
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;

  float waveHeight(vec2 p, float t) {
    float h = 0.0;
    h += sin(p.x * 0.55 + t * 0.80) * 0.16;
    h += sin(p.y * 0.85 - t * 0.62) * 0.11;
    h += sin((p.x + p.y) * 0.40 + t * 0.50) * 0.09;
    h += sin(p.x * 1.70 - t * 1.10) * 0.04; // fine detail
    return h * uWaveAmp;
  }

  void main() {
    vec3 pos = position;
    float t = uTime;

    float h = waveHeight(pos.xy, t);
    pos.z += h;

    // Normal from central differences of the height field.
    float e = 0.18;
    float hx = waveHeight(pos.xy + vec2(e, 0.0), t) - waveHeight(pos.xy - vec2(e, 0.0), t);
    float hy = waveHeight(pos.xy + vec2(0.0, e), t) - waveHeight(pos.xy - vec2(0.0, e), t);
    vec3 n = normalize(vec3(-hx, -hy, 2.0 * e));

    vElevation = h;
    vWorldNormal = normalize(mat3(modelMatrix) * n);
    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPos = worldPos.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

export const waterFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uDeep;
  uniform vec3 uBrand;
  uniform vec3 uHighlight;
  uniform vec3 uSilver;
  uniform vec3 uLightDir;
  uniform float uOpacity;

  varying float vElevation;
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;

  void main() {
    vec3 N = normalize(vWorldNormal);
    vec3 V = normalize(cameraPosition - vWorldPos);
    vec3 L = normalize(uLightDir);
    float t = uTime;

    // Depth tint: troughs stay deep, crests pick up the brand olive.
    float depthFade = smoothstep(-0.18, 0.24, vElevation);
    vec3 base = mix(uDeep, uBrand, depthFade);

    // Fresnel rim lifts toward the lighter olive at grazing angles.
    float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);
    vec3 col = mix(base, uHighlight, fres * 0.5);

    // Gentle wrapped diffuse so the surface has form, never flat.
    float diff = clamp(dot(N, L) * 0.5 + 0.5, 0.0, 1.0);
    col *= mix(0.70, 1.18, diff);

    // Cheap animated caustics — bright veins, strongest near crests.
    vec2 cp = vWorldPos.xz;
    float caustic = sin(cp.x * 2.6 + t * 1.1) * sin(cp.y * 2.4 - t * 0.9);
    caustic += 0.6 * sin((cp.x - cp.y) * 1.7 + t * 1.4);
    caustic = smoothstep(0.55, 1.0, abs(caustic) * 0.5);
    col += uHighlight * caustic * (0.10 + depthFade * 0.16);

    // Foam on the highest crests.
    float foam = smoothstep(0.16, 0.24, vElevation);
    col = mix(col, uSilver, foam * 0.5);

    // Silver specular glint — light dancing on water.
    vec3 H = normalize(L + V);
    float spec = pow(clamp(dot(N, H), 0.0, 1.0), 110.0);
    col += uSilver * spec * 0.7;

    gl_FragColor = vec4(col, uOpacity);

    // Match the renderer: ACES tone mapping, then encode to the output space.
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

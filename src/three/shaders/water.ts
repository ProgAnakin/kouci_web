/**
 * Stylised pool-water shader for the hero. Intentionally lightweight:
 * a sum-of-sines height field displaces a plane, normals come from central
 * differences of that field, and the fragment stage does a fresnel-driven
 * olive→silver tint with a soft specular glint. No textures, no reflection
 * probes — cheap enough to hold 60fps while still reading as "water".
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

    // Depth tint: troughs stay deep, crests pick up the brand olive.
    vec3 base = mix(uDeep, uBrand, smoothstep(-0.18, 0.22, vElevation));

    // Fresnel rim lifts toward the lighter olive at grazing angles.
    float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);
    vec3 col = mix(base, uHighlight, fres * 0.55);

    // Gentle wrapped diffuse so the surface has form, never flat.
    float diff = clamp(dot(N, L) * 0.5 + 0.5, 0.0, 1.0);
    col *= mix(0.72, 1.15, diff);

    // Silver specular glints — light dancing on water.
    vec3 H = normalize(L + V);
    float spec = pow(clamp(dot(N, H), 0.0, 1.0), 90.0);
    col += uSilver * spec * 0.6;

    gl_FragColor = vec4(col, uOpacity);

    // Convert the linear color we computed into the renderer's output space.
    #include <colorspace_fragment>
  }
`

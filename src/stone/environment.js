import * as THREE from 'three';

// A procedural HDR studio in equirectangular layout: cool plaster ground, overexposed
// softboxes for brilliance and dark panels for the contrast pattern a cut stone needs.
const W = 1024;
const H = 512;

const SOFTBOXES = [
  { u: 0.12, v: 0.22, w: 0.07, h: 0.2, power: 9 },
  { u: 0.37, v: 0.16, w: 0.12, h: 0.06, power: 12 },
  { u: 0.62, v: 0.25, w: 0.05, h: 0.26, power: 8 },
  { u: 0.86, v: 0.18, w: 0.09, h: 0.1, power: 10 },
  { u: 0.5, v: 0.03, w: 1, h: 0.05, power: 4 },
  { u: 0.25, v: 0.42, w: 0.02, h: 0.12, power: 14 },
  { u: 0.74, v: 0.4, w: 0.025, h: 0.08, power: 14 },
];

const PANELS = [
  { u: 0.0, v: 0.5, w: 0.08, h: 0.5, depth: 0.03 },
  { u: 0.18, v: 0.62, w: 0.04, h: 0.5, depth: 0.05 },
  { u: 0.3, v: 0.48, w: 0.06, h: 0.35, depth: 0.04 },
  { u: 0.44, v: 0.3, w: 0.03, h: 0.3, depth: 0.06 },
  { u: 0.55, v: 0.55, w: 0.1, h: 0.25, depth: 0.03 },
  { u: 0.68, v: 0.7, w: 0.05, h: 0.4, depth: 0.05 },
  { u: 0.8, v: 0.5, w: 0.05, h: 0.4, depth: 0.02 },
  { u: 0.93, v: 0.33, w: 0.03, h: 0.25, depth: 0.05 },
  { u: 0.5, v: 0.95, w: 1, h: 0.12, depth: 0.04 },
];

const inside = (u, v, box) => {
  let du = Math.abs(u - box.u);
  du = Math.min(du, 1 - du);
  return Math.max(du / (box.w / 2), Math.abs(v - box.v) / (box.h / 2));
};

const soft = (d, edge) => 1 - THREE.MathUtils.smoothstep(d, 1 - edge, 1 + edge);

export function createStudioEnvironment() {
  const data = new Uint16Array(W * H * 4);
  const toHalf = THREE.DataUtils.toHalfFloat;

  for (let y = 0; y < H; y++) {
    const v = y / (H - 1);
    for (let x = 0; x < W; x++) {
      const u = x / (W - 1);
      // Ceiling bright, horizon plaster, floor a shade darker.
      let level = v < 0.5 ? THREE.MathUtils.lerp(1.05, 0.62, v * 2) : THREE.MathUtils.lerp(0.48, 0.26, (v - 0.5) * 2);
      let r = level * 0.93;
      let g = level * 0.96;
      let b = level;

      for (const panel of PANELS) {
        const k = soft(inside(u, v, panel), 0.2);
        r = THREE.MathUtils.lerp(r, panel.depth, k);
        g = THREE.MathUtils.lerp(g, panel.depth * 1.03, k);
        b = THREE.MathUtils.lerp(b, panel.depth * 1.1, k);
      }
      for (const box of SOFTBOXES) {
        const k = soft(inside(u, v, box), 0.25) * box.power;
        r += k;
        g += k;
        b += k * 1.02;
      }

      // DataTexture row 0 is v = 0, which equirectUv maps to straight down.
      const i = ((H - 1 - y) * W + x) * 4;
      data[i] = toHalf(r);
      data[i + 1] = toHalf(g);
      data[i + 2] = toHalf(b);
      data[i + 3] = toHalf(1);
    }
  }

  const texture = new THREE.DataTexture(data, W, H, THREE.RGBAFormat, THREE.HalfFloatType);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.LinearSRGBColorSpace;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

import * as THREE from 'three';
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';

// The rough stone, ported from the accepted prototype with its default settings,
// then broken into shell shards that fly off when `burst` runs 0 → 1.
const SETTINGS = {
  seed: 7,
  facets: 260,
  chipDepth: 0.06,
  edgeBevel: 1.1,
  tipCut: 1.42,
  roughness: 0.8,
  bump: 0.012,
  clearcoat: 0.6,
  ior: 2.33,
  thickness: 1.6,
  dispersion: 5,
  haze: 2.5,
  envIntensity: 1.6,
};
const SHARDS = 34;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Octahedral faces (the natural diamond habit), dodecahedral planes that round the
// edges and cube planes that blunt the tips.
function buildPlanes(rand) {
  const planes = [];
  const jitter = (v, amount) => v.add(new THREE.Vector3(
    (rand() - 0.5) * amount, (rand() - 0.5) * amount, (rand() - 0.5) * amount,
  )).normalize();

  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) {
    planes.push({ n: jitter(new THREE.Vector3(x, y, z).normalize(), 0.08), d: 1 + (rand() - 0.5) * 0.12 });
  }
  const dodeca = [[1, 1, 0], [1, -1, 0], [1, 0, 1], [1, 0, -1], [0, 1, 1], [0, 1, -1]];
  for (const [a, b, c] of dodeca) for (const s of [-1, 1]) {
    planes.push({ n: jitter(new THREE.Vector3(a * s, b * s, c * s).normalize(), 0.1), d: SETTINGS.edgeBevel + (rand() - 0.5) * 0.08 });
  }
  for (const axis of [[1, 0, 0], [0, 1, 0], [0, 0, 1]]) for (const s of [-1, 1]) {
    planes.push({ n: new THREE.Vector3(...axis).multiplyScalar(s), d: SETTINGS.tipCut + (rand() - 0.5) * 0.15 });
  }
  return planes;
}

function intersect3(p1, p2, p3) {
  const m = new THREE.Matrix3().set(
    p1.n.x, p1.n.y, p1.n.z,
    p2.n.x, p2.n.y, p2.n.z,
    p3.n.x, p3.n.y, p3.n.z,
  );
  if (Math.abs(m.determinant()) < 1e-6) return null;
  return new THREE.Vector3(p1.d, p2.d, p3.d).applyMatrix3(m.invert());
}

function surfaceDistance(planes, dir) {
  let t = Infinity;
  for (const pl of planes) {
    const k = pl.n.dot(dir);
    if (k > 1e-6) t = Math.min(t, pl.d / k);
  }
  return t;
}

// Points on the bevelled octahedron with a small random outward lift: their hull
// keeps the octahedral habit but breaks every face into irregular micro-facets.
function buildHull(rand) {
  const planes = buildPlanes(rand);
  const points = [];
  for (let i = 0; i < planes.length; i++)
    for (let j = i + 1; j < planes.length; j++)
      for (let k = j + 1; k < planes.length; k++) {
        const p = intersect3(planes[i], planes[j], planes[k]);
        if (p && planes.every((pl) => pl.n.dot(p) <= pl.d + 1e-5)) points.push(p.multiplyScalar(0.97));
      }
  const dir = new THREE.Vector3();
  for (let i = 0; i < SETTINGS.facets; i++) {
    dir.set(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1).normalize();
    const lift = 1 + Math.pow(rand(), 3) * SETTINGS.chipDepth;
    points.push(dir.clone().multiplyScalar(surfaceDistance(planes, dir) * lift));
  }
  const geometry = new ConvexGeometry(points);
  geometry.scale(1.06, 1.0, 0.88);
  geometry.rotateZ(0.12);
  geometry.rotateX(-0.08);
  return geometry;
}

// Each hull triangle joins the shard whose seed direction is nearest its centroid,
// which cuts the shell into irregular, contiguous plates. Every plate also gets an
// inward-facing copy so it reads as a chip with thickness once it turns.
function shatter(hull, rand) {
  const seeds = [...Array(SHARDS)].map(() => new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1).normalize());
  const pos = hull.attributes.position;
  const groups = seeds.map(() => []);
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();

  for (let i = 0; i < pos.count; i += 3) {
    a.fromBufferAttribute(pos, i);
    b.fromBufferAttribute(pos, i + 1);
    c.fromBufferAttribute(pos, i + 2);
    const centroid = a.clone().add(b).add(c).divideScalar(3);
    const direction = centroid.clone().normalize();
    let best = 0;
    seeds.forEach((seed, s) => { if (seed.dot(direction) > seeds[best].dot(direction)) best = s; });
    groups[best].push([a.clone(), b.clone(), c.clone()]);
  }

  const positions = [];
  const centers = [];
  const directions = [];
  const randoms = [];
  const uvs = [];
  const corners = [];
  const rims = [];

  groups.forEach((triangles) => {
    if (!triangles.length) return;
    const center = new THREE.Vector3();
    triangles.forEach((t) => t.forEach((v) => center.add(v)));
    center.divideScalar(triangles.length * 3);
    const direction = center.clone().normalize();
    const seed = rand();
    const ou = rand();
    const ov = rand();

    const push = (v) => {
      positions.push(v.x, v.y, v.z);
      centers.push(center.x, center.y, center.z);
      directions.push(direction.x, direction.y, direction.z);
      randoms.push(seed);
      uvs.push(v.x * 0.35 + ou, (v.y + v.z) * 0.35 + ov);
    };
    // An edge used by only one triangle of the shard is on its broken rim.
    const key = (v) => `${v.x.toFixed(5)},${v.y.toFixed(5)},${v.z.toFixed(5)}`;
    const edge = (a, b) => [key(a), key(b)].sort().join('|');
    const uses = new Map();
    for (const [p, q, r] of triangles) {
      for (const e of [edge(q, r), edge(r, p), edge(p, q)]) uses.set(e, (uses.get(e) || 0) + 1);
    }
    const rim = (a, b) => (uses.get(edge(a, b)) === 1 ? 1 : 0);

    const face = (a, b, c, flags) => {
      [a, b, c].forEach((v, i) => {
        push(v);
        corners.push(i === 0 ? 1 : 0, i === 1 ? 1 : 0, i === 2 ? 1 : 0);
        rims.push(...flags);
      });
    };
    for (const [p, q, r] of triangles) {
      const [fp, fq, fr] = [rim(q, r), rim(r, p), rim(p, q)];
      face(p, q, r, [fp, fq, fr]);
      const inset = (v) => v.clone().sub(direction.clone().multiplyScalar(0.07));
      face(inset(p), inset(r), inset(q), [fp, fr, fq]);
    }
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('shardCenter', new THREE.Float32BufferAttribute(centers, 3));
  geometry.setAttribute('shardDirection', new THREE.Float32BufferAttribute(directions, 3));
  geometry.setAttribute('shardSeed', new THREE.Float32BufferAttribute(randoms, 1));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute('corner', new THREE.Float32BufferAttribute(corners, 3));
  geometry.setAttribute('rim', new THREE.Float32BufferAttribute(rims, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function noiseTexture(size, seed, scale, contrast) {
  const rand = mulberry32(seed);
  const grid = 64;
  const lattice = Array.from({ length: grid * grid }, rand);
  const value = (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const s = (q) => q * q * (3 - 2 * q);
    const at = (i, j) => lattice[((j % grid + grid) % grid) * grid + ((i % grid + grid) % grid)];
    const top = THREE.MathUtils.lerp(at(xi, yi), at(xi + 1, yi), s(xf));
    const bottom = THREE.MathUtils.lerp(at(xi, yi + 1), at(xi + 1, yi + 1), s(xf));
    return THREE.MathUtils.lerp(top, bottom, s(yf));
  };
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let f = 0, amp = 0.5, freq = scale;
    for (let o = 0; o < 5; o++) {
      f += value((x / size) * freq, (y / size) * freq) * amp;
      amp *= 0.5;
      freq *= 2;
    }
    const v = THREE.MathUtils.clamp((f - 0.5) * contrast + 0.5, 0, 1) * 255;
    const i = (y * size + x) * 4;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createCrystal() {
  const rand = mulberry32(SETTINGS.seed);
  const hull = buildHull(rand);
  hull.computeBoundingSphere();
  const geometry = shatter(hull, rand);
  // Normalised to a unit diameter so it is sized like the brilliant it contains.
  const unit = 0.5 / hull.boundingSphere.radius;
  geometry.scale(unit, unit, unit);
  ['shardCenter'].forEach((name) => {
    const attribute = geometry.attributes[name];
    for (let i = 0; i < attribute.count; i++) attribute.setXYZ(i, attribute.getX(i) * unit, attribute.getY(i) * unit, attribute.getZ(i) * unit);
  });

  const uniforms = {
    burst: { value: 0 },
    shake: { value: 0 },
    time: { value: 0 },
    rimGlow: { value: 0 },
  };

  const material = new THREE.MeshPhysicalMaterial({
    color: 0xf4f7fa,
    metalness: 0,
    transmission: 1,
    flatShading: true,
    transparent: true,
    roughness: SETTINGS.roughness,
    roughnessMap: noiseTexture(512, 11, 3, 3.5),
    bumpMap: noiseTexture(512, 23, 18, 1.4),
    bumpScale: SETTINGS.bump,
    clearcoat: SETTINGS.clearcoat,
    clearcoatRoughness: 0.08,
    ior: SETTINGS.ior,
    thickness: SETTINGS.thickness * unit,
    dispersion: SETTINGS.dispersion,
    attenuationColor: new THREE.Color(0xc9d3dc),
    attenuationDistance: SETTINGS.haze * unit,
    envMapIntensity: SETTINGS.envIntensity,
    // Kept just above zero so the thin-film variant is compiled from the start.
    iridescence: 0.001,
    iridescenceIOR: 1.8,
  });

  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', /* glsl */ `
        #include <common>
        attribute vec3 shardCenter;
        attribute vec3 shardDirection;
        attribute float shardSeed;
        uniform float burst;
        uniform float shake;
        uniform float time;
        attribute vec3 corner;
        attribute vec3 rim;
        varying vec3 vCorner;
        varying vec3 vRim;

        vec3 rotateAround(vec3 v, vec3 axis, float angle) {
          return v * cos(angle) + cross(axis, v) * sin(angle) + axis * dot(axis, v) * (1.0 - cos(angle));
        }

        vec3 shardAxis() {
          return normalize(vec3(shardSeed - 0.5, 0.6, fract(shardSeed * 7.31) - 0.5));
        }

        float shardSpin() {
          return burst * (1.5 + shardSeed * 4.0);
        }
      `)
      .replace('#include <beginnormal_vertex>', /* glsl */ `
        #include <beginnormal_vertex>
        objectNormal = rotateAround(objectNormal, shardAxis(), shardSpin());
      `)
      .replace('#include <begin_vertex>', /* glsl */ `
        vec3 local = rotateAround(position - shardCenter, shardAxis(), shardSpin()) * (1.0 - burst * 0.35);
        // Shards leave at different speeds, the fastest first, like a shell giving way.
        float travel = pow(burst, 1.6) * (1.4 + shardSeed * 2.2);
        float tremor = sin(time * 55.0 + shardSeed * 40.0) * shake * 0.012;
        vec3 transformed = shardCenter + local + shardDirection * (travel + tremor);
        vCorner = corner;
        vRim = rim;
      `);
    // Broken rims catch the light: first as cracks across the skin, then as the
    // bright edges that let clear shards read as glass over plain white marble.
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', /* glsl */ `
        #include <common>
        uniform float rimGlow;
        varying vec3 vCorner;
        varying vec3 vRim;
      `)
      .replace('#include <emissivemap_fragment>', /* glsl */ `
        #include <emissivemap_fragment>
        vec3 toEdge = vCorner / max(fwidth(vCorner), vec3(1e-4));
        float nearest = 1e4;
        if (vRim.x > 0.5) nearest = min(nearest, toEdge.x);
        if (vRim.y > 0.5) nearest = min(nearest, toEdge.y);
        if (vRim.z > 0.5) nearest = min(nearest, toEdge.z);
        totalEmissiveRadiance += vec3(1.0, 1.0, 1.02) * rimGlow * (1.0 - smoothstep(0.0, 1.6, nearest));
      `);
  };
  material.customProgramCacheKey = () => 'hallmere-crystal';

  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = 1;
  mesh.frustumCulled = false;
  return { mesh, uniforms, skin: { thickness: material.thickness, attenuation: material.attenuationColor.clone() } };
}

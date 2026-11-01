import * as THREE from 'three';
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'three/addons/libs/lil-gui.module.min.js';

const BACKGROUNDS = {
  fog: '/assets/videos/stills/B2-descent-fog-last.webp',
  bench: '/assets/photos/D-bench.jpg',
  hero: '/assets/photos/A-hero-room.jpg',
};

const params = {
  seed: 7,
  chips: 0,
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
  background: 'fog',
  spin: true,
};

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

// The crystal is the intersection of half-spaces: octahedral faces (the natural
// diamond habit), dodecahedral planes that round the edges, cube planes that blunt
// the tips, and random shallow planes that read as growth chips.
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
    planes.push({ n: jitter(new THREE.Vector3(a * s, b * s, c * s).normalize(), 0.1), d: params.edgeBevel + (rand() - 0.5) * 0.08 });
  }
  for (const axis of [[1, 0, 0], [0, 1, 0], [0, 0, 1]]) for (const s of [-1, 1]) {
    planes.push({ n: new THREE.Vector3(...axis).multiplyScalar(s), d: params.tipCut + (rand() - 0.5) * 0.15 });
  }
  for (let i = 0; i < params.chips; i++) {
    const n = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();
    const support = Math.sqrt(3) * Math.max(Math.abs(n.x), Math.abs(n.y), Math.abs(n.z));
    planes.push({ n, d: Math.min(support, params.edgeBevel * 1.4) * (1 - params.chipDepth * (0.4 + rand())) });
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

// Points scattered on the bevelled octahedron with a small random outward lift:
// their hull keeps the octahedral habit but breaks every face into irregular
// micro-facets, like the crumpled surface of a real rough stone.
function buildCrystalGeometry(seed) {
  const rand = mulberry32(seed);
  const planes = buildPlanes(rand);
  const points = [];
  for (let i = 0; i < planes.length; i++)
    for (let j = i + 1; j < planes.length; j++)
      for (let k = j + 1; k < planes.length; k++) {
        const p = intersect3(planes[i], planes[j], planes[k]);
        if (p && planes.every((pl) => pl.n.dot(p) <= pl.d + 1e-5)) points.push(p.multiplyScalar(0.97));
      }
  const dir = new THREE.Vector3();
  for (let i = 0; i < params.facets; i++) {
    dir.set(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1).normalize();
    const lift = 1 + Math.pow(rand(), 3) * params.chipDepth;
    points.push(dir.clone().multiplyScalar(surfaceDistance(planes, dir) * lift));
  }
  const geometry = new ConvexGeometry(points);
  geometry.scale(1.06, 1.0, 0.88);
  geometry.rotateZ(0.12);
  geometry.rotateX(-0.08);
  geometry.computeVertexNormals();
  addFaceUVs(geometry, rand);
  return geometry;
}

// ConvexGeometry has no UVs. Each triangle is projected onto its own plane and
// offset per face, so the frost texture lands differently on every facet.
function addFaceUVs(geometry, rand) {
  const pos = geometry.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  const n = new THREE.Vector3(), t = new THREE.Vector3(), bt = new THREE.Vector3();
  const faceOffsets = new Map();
  for (let i = 0; i < pos.count; i += 3) {
    a.fromBufferAttribute(pos, i);
    b.fromBufferAttribute(pos, i + 1);
    c.fromBufferAttribute(pos, i + 2);
    n.subVectors(b, a).cross(c.clone().sub(a)).normalize();
    t.set(0, 1, 0).cross(n);
    if (t.lengthSq() < 1e-4) t.set(1, 0, 0).cross(n);
    t.normalize();
    bt.crossVectors(n, t);
    const key = `${n.x.toFixed(2)},${n.y.toFixed(2)},${n.z.toFixed(2)}`;
    if (!faceOffsets.has(key)) faceOffsets.set(key, [rand(), rand()]);
    const [ou, ov] = faceOffsets.get(key);
    for (let k = 0; k < 3; k++) {
      const v = [a, b, c][k];
      uv[(i + k) * 2] = v.dot(t) * 0.35 + ou;
      uv[(i + k) * 2 + 1] = v.dot(bt) * 0.35 + ov;
    }
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
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

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.3, 12);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const key = new THREE.DirectionalLight(0xffffff, 7);
key.position.set(-3, 4, 3);
scene.add(key);
const rim = new THREE.DirectionalLight(0xdfe8ff, 3);
rim.position.set(4, -1, -3);
scene.add(rim);
const under = new THREE.DirectionalLight(0xffffff, 4);
under.position.set(1, -4, 2);
scene.add(under);

const material = new THREE.MeshPhysicalMaterial({
  color: 0xf4f7fa,
  metalness: 0,
  transmission: 1,
  flatShading: true,
  roughnessMap: noiseTexture(512, 11, 3, 3.5),
  bumpMap: noiseTexture(512, 23, 18, 1.4),
  clearcoatRoughness: 0.08,
  attenuationColor: new THREE.Color(0xc9d3dc),
});

const crystal = new THREE.Mesh(buildCrystalGeometry(params.seed), material);
scene.add(crystal);

function applyMaterial() {
  material.roughness = params.roughness;
  material.ior = params.ior;
  material.thickness = params.thickness;
  material.dispersion = params.dispersion;
  material.envMapIntensity = params.envIntensity;
  material.bumpScale = params.bump;
  material.clearcoat = params.clearcoat;
  material.attenuationDistance = params.haze;
}

function rebuild() {
  crystal.geometry.dispose();
  crystal.geometry = buildCrystalGeometry(params.seed);
}

const loader = new THREE.TextureLoader();
function coverBackground(texture) {
  const imageAspect = texture.image.width / texture.image.height;
  const screenAspect = window.innerWidth / window.innerHeight;
  if (imageAspect > screenAspect) {
    texture.repeat.set(screenAspect / imageAspect, 1);
    texture.offset.set((1 - texture.repeat.x) / 2, 0);
  } else {
    texture.repeat.set(1, imageAspect / screenAspect);
    texture.offset.set(0, (1 - texture.repeat.y) / 2);
  }
}
function setBackground(name) {
  loader.load(BACKGROUNDS[name], (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    coverBackground(texture);
    scene.background?.dispose?.();
    scene.background = texture;
  });
}

applyMaterial();
setBackground(params.background);

const gui = new GUI();
gui.add(params, 'seed', 1, 200, 1).onChange(rebuild);
gui.add(params, 'chips', 0, 60, 1).onChange(rebuild);
gui.add(params, 'facets', 0, 800, 10).onChange(rebuild);
gui.add(params, 'chipDepth', 0, 0.2, 0.005).onChange(rebuild);
gui.add(params, 'edgeBevel', 1.0, 1.3, 0.005).onChange(rebuild);
gui.add(params, 'tipCut', 1.2, 1.8, 0.01).onChange(rebuild);
gui.add(params, 'roughness', 0, 1, 0.01).onChange(applyMaterial);
gui.add(params, 'bump', 0, 0.05, 0.001).onChange(applyMaterial);
gui.add(params, 'clearcoat', 0, 1, 0.01).onChange(applyMaterial);
gui.add(params, 'haze', 0.2, 10, 0.1).onChange(applyMaterial);
gui.add(params, 'ior', 1, 2.333, 0.01).onChange(applyMaterial);
gui.add(params, 'thickness', 0, 4, 0.05).onChange(applyMaterial);
gui.add(params, 'dispersion', 0, 10, 0.1).onChange(applyMaterial);
gui.add(params, 'envIntensity', 0, 3, 0.05).onChange(applyMaterial);
gui.add(params, 'background', Object.keys(BACKGROUNDS)).onChange(setBackground);
gui.add(params, 'spin');

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (scene.background?.isTexture) coverBackground(scene.background);
});

renderer.setAnimationLoop(() => {
  if (params.spin) crystal.rotation.y += 0.004;
  controls.update();
  renderer.render(scene, camera);
});

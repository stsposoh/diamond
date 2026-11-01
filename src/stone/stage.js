import * as THREE from 'three';
import { MeshBVH, SAH } from 'three-mesh-bvh';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createBrilliant } from './brilliant.js';
import { createStudioEnvironment } from './environment.js';
import { createDiamondMaterial } from './material.js';
import { createWire } from './wire.js';
import { createCrystal } from './crystal.js';
import { createBackdrop } from './backdrop.js';

const SPIN_SPEED = 0.22;
const FOLLOW = 0.045;
const FOV = 30;
const DISTANCE = 4.4;
const CLEAR_SHELL = new THREE.Color(0xf2f5f8);

// Object placement is in viewport terms: x and y from -1 to 1 across the screen,
// size as the stone's diameter in fractions of the viewport height.
export function createStoneStage({ canvas, reducedMotion, lowPower, story = false, backdrops = [] }) {
  // Antialiasing stays off: edge interpolation makes the BVH ray hit front faces.
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 50);
  camera.position.set(0, 0, DISTANCE);

  const brilliant = createBrilliant();
  const bvh = new MeshBVH(brilliant.geometry, { strategy: SAH, targetLeafSize: 1 });
  const material = createDiamondMaterial({
    envMap: createStudioEnvironment(),
    bvh,
    bounces: lowPower ? 2 : 4,
  });

  const diamondRig = new THREE.Group();
  const diamond = new THREE.Mesh(brilliant.geometry, material);
  diamond.renderOrder = 3;
  diamondRig.add(diamond);
  scene.add(diamondRig);

  const state = {
    spin: 0.6,
    spinRate: 1,
    spinOffset: 0,
    restTilt: 0.42,
    tiltX: 0.42,
    yaw: 0,
    follow: 1,
    pointer: new THREE.Vector2(),
    diamond: { x: 0, y: 0.12, size: 0.42, opacity: 1, highlight: -1, dispersion: 0.04 },
    wire: { draw: 0, opacity: 0 },
    crystal: { x: 0, y: 0, size: 0.3, opacity: 0, burst: 0, shake: 0, tilt: 0.2, turn: 0, gloss: 0 },
    backdrop: { on: false, from: 0, to: 0, mix: 0 },
  };

  let wire;
  let crystal;
  let crystalRig;
  let backdrop;

  if (story) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    wire = createWire(brilliant.polygons);
    diamond.add(wire);

    crystalRig = new THREE.Group();
    crystal = createCrystal();
    crystalRig.add(crystal.mesh);
    scene.add(crystalRig);

    // The prototype's light rig: the rough stone needs direct light to read as frosted.
    const key = new THREE.DirectionalLight(0xffffff, 7);
    key.position.set(-3, 4, 3);
    const rim = new THREE.DirectionalLight(0xdfe8ff, 3);
    rim.position.set(4, -1, -3);
    const under = new THREE.DirectionalLight(0xffffff, 4);
    under.position.set(1, -4, 2);
    scene.add(key, rim, under);

    backdrop = createBackdrop(backdrops);
    scene.add(backdrop.mesh);
  }

  let halfHeight = 1;
  let halfWidth = 1;
  let unit = 1;

  const place = (rig, { x, y, size }) => {
    rig.position.set(x * halfWidth, y * halfHeight, 0);
    rig.scale.setScalar(size * unit);
  };

  const resize = () => {
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    // At least 1.5x so the downscaled canvas smooths facet edges without MSAA.
    renderer.setPixelRatio(lowPower ? Math.min(window.devicePixelRatio, 1.5) : Math.min(Math.max(window.devicePixelRatio, 1.5), 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    halfHeight = DISTANCE * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    halfWidth = halfHeight * camera.aspect;
    // On portrait screens sizes follow the width, so the stone stays about half as wide as the screen.
    unit = Math.min(halfHeight, halfWidth / 0.75) * 2;
    backdrop?.resize(width, height);
  };

  const onPointer = (event) => {
    state.pointer.set((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1);
  };

  const listeners = new Set();
  let last = performance.now();
  let drewLastFrame = false;

  const anythingVisible = () =>
    state.diamond.opacity > 0.001 || state.wire.opacity > 0.001 || state.crystal.opacity > 0.001 || state.backdrop.on;

  const render = () => {
    const now = performance.now();
    const delta = Math.min((now - last) / 1000, 0.05);
    last = now;

    if (!reducedMotion) {
      state.spin += delta * SPIN_SPEED * state.spinRate;
      state.tiltX += (state.restTilt + state.pointer.y * 0.28 * state.follow - state.tiltX) * FOLLOW;
      state.yaw += (state.pointer.x * 0.6 * state.follow - state.yaw) * FOLLOW;
    }

    place(diamondRig, state.diamond);
    diamondRig.rotation.set(state.tiltX, state.yaw, 0);
    diamond.rotation.y = state.spin + state.spinOffset;
    material.uniforms.opacity.value = state.diamond.opacity;
    material.uniforms.highlight.value = state.diamond.highlight;
    material.uniforms.dispersion.value = state.diamond.dispersion;
    diamond.visible = state.diamond.opacity > 0.001 || state.wire.opacity > 0.001;
    material.visible = state.diamond.opacity > 0.001;

    if (story) {
      wire.material.uniforms.draw.value = state.wire.draw;
      wire.material.uniforms.opacity.value = state.wire.opacity;
      wire.visible = state.wire.opacity > 0.001;

      place(crystalRig, state.crystal);
      crystalRig.rotation.set(state.crystal.tilt, state.crystal.turn + state.spin * 0.6, 0);
      crystal.mesh.material.opacity = state.crystal.opacity;
      // Broken off, the shell is thin clear glass rather than the weathered skin.
      const shell = crystal.mesh.material;
      const g = state.crystal.gloss;
      shell.roughness = THREE.MathUtils.lerp(0.8, 0.04, g);
      shell.envMapIntensity = THREE.MathUtils.lerp(1.6, 4, g);
      shell.iridescence = THREE.MathUtils.lerp(0.001, 0.5, g);
      shell.clearcoat = THREE.MathUtils.lerp(0.6, 1, g);
      shell.thickness = crystal.skin.thickness * THREE.MathUtils.lerp(1, 0.25, g);
      shell.attenuationColor.lerpColors(crystal.skin.attenuation, CLEAR_SHELL, g);
      crystal.uniforms.rimGlow.value = g * 1.6;
      crystal.mesh.visible = state.crystal.opacity > 0.001 && state.crystal.burst < 0.999;
      crystal.uniforms.burst.value = state.crystal.burst;
      crystal.uniforms.shake.value = state.crystal.shake;
      crystal.uniforms.time.value = now / 1000;

      backdrop.set(state.backdrop);
    }

    const visible = anythingVisible();
    if (visible || drewLastFrame) renderer.render(scene, camera);
    drewLastFrame = visible;
    listeners.forEach((listener) => listener(state));
  };

  // Screen position (CSS px) of a point in the brilliant's coordinates; `steady`
  // measures it on the rig, so the point follows the stone's tilt but not its spin.
  const project = (point, steady = false) => {
    const space = steady ? diamondRig : diamond;
    space.updateWorldMatrix(true, false);
    const v = point.clone().applyMatrix4(space.matrixWorld).project(camera);
    return { x: ((v.x + 1) / 2) * canvas.clientWidth, y: ((1 - v.y) / 2) * canvas.clientHeight };
  };

  resize();
  window.addEventListener('resize', () => {
    resize();
    if (reducedMotion) render();
  });

  if (reducedMotion) {
    render();
  } else {
    window.addEventListener('pointermove', onPointer, { passive: true });
    renderer.setAnimationLoop(render);
  }

  return {
    state,
    render,
    project,
    brilliant,
    // Pauses the loop entirely while the stage is off screen.
    setActive: (active) => {
      if (reducedMotion) return;
      last = performance.now();
      renderer.setAnimationLoop(active ? render : null);
    },
    onFrame: (listener) => listeners.add(listener),
  };
}

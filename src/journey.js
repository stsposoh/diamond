import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { createFlecks } from './stone/flecks.js';

gsap.registerPlugin(ScrollTrigger);

const VIDEOS = {
  descent: new URL('../assets/videos/scrub/B-descent.mp4', import.meta.url).href,
  loupe: new URL('../assets/videos/scrub/C-loupe.mp4', import.meta.url).href,
  setting: new URL('../assets/videos/scrub/E-setting.mp4', import.meta.url).href,
};

// Frames the canvas redraws behind the rough crystal, in the order the stage indexes them.
export const BACKDROPS = [
  { url: new URL('../assets/videos/stills/scrub/B-descent-end.webp', import.meta.url).href },
  { url: new URL('../assets/videos/stills/scrub/C-loupe-start.webp', import.meta.url).href },
  // Anchored right and enlarged so the loupe on the bench's left edge clears the chapter scale; matches .journey__frame--bench.
  { url: new URL('../assets/photos/web/D-bench.webp', import.meta.url).href, anchor: 1, zoom: 1.14 },
];

// The whole story is one timeline measured in vh of scroll.
const LENGTH = 2300;
const DESCENT = { start: 90, deep: 470, seconds: 15, end: 19.95 };
const CHAPTERS = [
  { id: 'top', from: 0, to: 470, hold: 0 },
  { id: 'origin', from: 470, to: 720, hold: 650 },
  { id: 'surface', from: 720, to: 1040, hold: 900 },
  { id: 'bench', from: 1040, to: 1500, hold: 1150 },
  { id: 'facets', from: 1500, to: 1900, hold: 1640 },
  { id: 'setting', from: 1900, to: LENGTH, hold: 2060 },
];

// Where the stone sits in the Flow footage, as fractions of the 16:9 frame.
const LOUPE_CRYSTAL = { x: 0.505, y: 0.46, width: 0.125 };
const SETTING_STONE = { x: 0.515, y: 0.441, width: 0.042 };
const PIT_MOUTH = { x: 0.5, y: 0.73, width: 0 };
const PIT_FLOOR = { x: 0.5, y: 0.8, width: 0 };

const descentAt = (t) => DESCENT.start + (t / DESCENT.seconds) * (DESCENT.deep - DESCENT.start);

// Rough depth for the scale: the pit is about half a kilometre, then the fog takes
// the camera the rest of the way down.
function depthAt(t) {
  if (t <= 7) return (t / 7) * 520;
  const k = Math.min((t - 7) / (DESCENT.seconds - 7), 1);
  return 520 + (150000 - 520) * Math.pow(k, 2.2);
}

const formatDepth = (metres) =>
  metres < 1 ? '0 m' : metres < 1000 ? `−${Math.round(metres / 10) * 10} m` : `−${Math.round(metres / 1000)} km`;

function scrubbable(video, url) {
  const playhead = { time: 0 };
  let ready = false;
  let requested = false;

  const load = () => {
    if (requested) return Promise.resolve();
    requested = true;
    return fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        // A fully buffered blob seeks instantly in both directions; a streamed source stalls on reverse scrubbing.
        video.src = URL.createObjectURL(blob);
        video.addEventListener('loadeddata', () => { ready = true; }, { once: true });
        video.load();
      });
  };

  gsap.ticker.add(() => {
    if (!ready || video.seeking) return;
    if (Math.abs(video.currentTime - playhead.time) > 1 / 48) video.currentTime = playhead.time;
  });

  return { playhead, load };
}

export function createJourney({ stage, onChapter, scrollTo }) {
  const root = document.querySelector('[data-journey]');
  const viewport = root.querySelector('.journey__viewport');
  const q = (selector) => root.querySelector(selector);
  const scenes = Object.fromEntries([...root.querySelectorAll('[data-scene]')].map((el) => [el.dataset.scene, el]));
  const copyOf = (name) => scenes[name].querySelector('.scene__copy');

  const fog = q('[data-fog]');
  const curtain = q('[data-curtain]');
  const veil = q('[data-veil]');
  const room = q('[data-hero-room]');
  const heroCopy = root.querySelectorAll('[data-hero-copy]');
  const flecks = q('[data-flecks]');
  const light = q('[data-hero-light]');
  const frames = {
    descent: q('[data-video="descent"]'),
    loupe: q('[data-video="loupe"]'),
    bench: q('[data-frame="bench"]'),
    plain: q('[data-frame="plain"]'),
    setting: q('[data-video="setting"]'),
  };
  const probe = document.querySelector('[data-probe]');
  const depthLabel = document.querySelector('[data-depth]');
  const depthName = document.querySelector('[data-depth-name]');
  const marks = [...document.querySelectorAll('.scale__mark')];
  const counter = q('[data-facet-count]');
  const parts = [...root.querySelectorAll('[data-part]')];

  const descent = scrubbable(frames.descent, VIDEOS.descent);
  const loupe = scrubbable(frames.loupe, VIDEOS.loupe);
  const setting = scrubbable(frames.setting, VIDEOS.setting);
  descent.load().then(() => Promise.all([loupe.load(), setting.load()]));

  // Markers only give each chapter an address; links are resolved below.
  root.querySelectorAll('.journey__marker').forEach((marker, i) => {
    marker.style.top = `${CHAPTERS[i].hold}vh`;
  });
  if (location.hash === '' || location.hash === '#top') window.scrollTo(0, 0);

  // Scale links land on each chapter's hold, not on the start of its transition.
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    const chapter = link && CHAPTERS.find((c) => `#${c.id}` === link.getAttribute('href'));
    if (!chapter) return;
    event.preventDefault();
    const top = root.getBoundingClientRect().top + window.scrollY;
    scrollTo(top + (chapter.hold / 100) * window.innerHeight);
  });

  // Fraction-of-frame coordinates to stage coordinates, through `object-fit: cover`.
  const inFrame = ({ x, y, width }) => {
    const w = viewport.clientWidth;
    const h = viewport.clientHeight;
    const scale = Math.max(w / 1920, h / 1080);
    const fw = 1920 * scale;
    const fh = 1080 * scale;
    const px = (w - fw) / 2 + x * fw;
    const py = (h - fh) / 2 + y * fh;
    return { x: (px / w) * 2 - 1, y: 1 - (py / h) * 2, size: (width * fw) / Math.min(h, w / 0.75) };
  };

  const placeProbe = (t) => {
    const from = marks[0].parentElement.offsetTop;
    const to = marks[1].parentElement.offsetTop;
    const k = Math.min(t / DESCENT.seconds, 1);
    probe.style.transform = `translateY(${from + (to - from) * k + 4}px)`;
    const descending = t > 0.05 && t < DESCENT.seconds;
    depthLabel.textContent = descending ? formatDepth(depthAt(t)) : '0 m';
    depthName.textContent = descending ? 'Descent' : 'The stone';
  };

  const updateCounter = () => {
    if (!stage) return;
    const draw = stage.state.wire.draw;
    const reached = Math.min(Math.floor(draw), 57);
    counter.textContent = String(Math.max(reached, 1)).padStart(2, '0');
  };

  const timeline = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: root,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.25,
      invalidateOnRefresh: true,
    },
    onUpdate: () => {
      placeProbe(descent.playhead.time);
      updateCounter();
      // Past the end the consultation section reports itself.
      if (!timeline.scrollTrigger.isActive) return;
      const at = timeline.scrollTrigger.progress * LENGTH;
      onChapter(CHAPTERS.findLastIndex((chapter) => at >= chapter.from));
    },
  });

  const show = (target, at, duration = 30, extra = {}) =>
    timeline.fromTo(target, { autoAlpha: 0 }, { autoAlpha: 1, duration, ease: 'power1.out', immediateRender: false, ...extra }, at);
  const hide = (target, at, duration = 30) => timeline.to(target, { autoAlpha: 0, duration, ease: 'power1.in' }, at);
  const lift = (name, at) =>
    timeline.fromTo(copyOf(name), { y: 30 }, { y: 0, duration: 50, ease: 'power2.out', immediateRender: false }, at);

  // 0 m → −150 km. Leaving the white room: copy lifts away, the room whites out into fog.
  timeline
    .to(heroCopy, { autoAlpha: 0, y: -40, duration: 50, ease: 'power1.in' }, 0)
    .to([flecks, light], { autoAlpha: 0, duration: 40 }, 5)
    .to(room, { scale: 1.12, filter: 'blur(14px)', duration: 90, ease: 'power1.in' }, 5)
    .to(fog, { autoAlpha: 1, duration: 55 }, 30)
    .set(room, { autoAlpha: 0 }, 90)
    .to(fog, { autoAlpha: 0, scale: 1.15, duration: 55, ease: 'power1.out' }, DESCENT.start)
    .to(probe, { autoAlpha: 1, duration: 20 }, 60)
    .to(veil, { autoAlpha: 1, duration: 40 }, 75)
    .to(descent.playhead, { time: DESCENT.seconds, duration: DESCENT.deep - DESCENT.start }, DESCENT.start)
    .to(descent.playhead, { time: DESCENT.end, duration: 90 }, DESCENT.deep)
    // Two fog passes hide the joins in the Flow footage.
    .fromTo(fog, { autoAlpha: 0, scale: 1 }, { autoAlpha: 1, scale: 1.08, duration: descentAt(7) - descentAt(6.3), ease: 'power2.in', immediateRender: false }, descentAt(6.3))
    .to(fog, { autoAlpha: 0, scale: 1.18, duration: descentAt(8) - descentAt(7.2), ease: 'power2.out' }, descentAt(7.2))
    .fromTo(curtain, { yPercent: 70, autoAlpha: 1 }, { yPercent: -100, duration: descentAt(14.2) - descentAt(11.8), immediateRender: false }, descentAt(11.8))
    .set(curtain, { autoAlpha: 0 }, descentAt(14.2))
    .to(probe, { autoAlpha: 0, duration: 20 }, DESCENT.deep + 10);

  // −150 km: the hold, then the rough crystal surfaces out of the fog.
  show(scenes.origin, 500, 40);
  lift('origin', 500);

  // Surface: the crystal hands itself to the cutter's tweezers in the footage.
  hide(scenes.origin, 720);
  show(frames.loupe, 735, 45);
  timeline.set(frames.descent, { autoAlpha: 0 }, 815);
  show(scenes.surface, 815, 40);
  lift('surface', 815);
  timeline.to(loupe.playhead, { time: 9.9, duration: 170 }, 850);
  // Once the handoff is done the footage drifts right, clearing the left of the frame for the copy.
  timeline.to(frames.loupe, { scale: 1.3, xPercent: 15, duration: 90, ease: 'power2.inOut' }, 840);

  // Bench: fog swallows the loupe and clears over the marble.
  hide(scenes.surface, 1040, 25);
  timeline
    .fromTo(fog, { autoAlpha: 0, scale: 1 }, { autoAlpha: 1, scale: 1.06, duration: 40, ease: 'power2.in', immediateRender: false }, 1040)
    .set(frames.bench, { autoAlpha: 1 }, 1080)
    .set(frames.loupe, { autoAlpha: 0 }, 1080)
    .to(fog, { autoAlpha: 0, scale: 1.16, duration: 45, ease: 'power2.out' }, 1080);
  show(scenes.bench, 1110, 40);
  lift('bench', 1110);

  // 57: the bench falls away to plain white.
  hide(scenes.bench, 1500);
  show(frames.plain, 1500, 60);
  timeline.to(veil, { autoAlpha: 0, duration: 60 }, 1500).to(veil, { autoAlpha: 1, duration: 50 }, 1920);
  timeline.set(frames.bench, { autoAlpha: 0 }, 1560);
  show(scenes.facets, 1560, 40);
  lift('facets', 1560);

  // Setting: the white gives way to the ring in its clamp.
  hide(scenes.facets, 1900);
  show(frames.setting, 1920, 50);
  timeline.set(frames.plain, { autoAlpha: 0 }, 1970);
  show(scenes.setting, 1990, 40);
  lift('setting', 1990);
  timeline.to(setting.playhead, { time: 9.95, duration: 190 }, 2010);

  // Out to white before the consultation.
  hide(scenes.setting, 2220);
  timeline
    .fromTo(fog, { autoAlpha: 0, scale: 1 }, { autoAlpha: 1, scale: 1.05, duration: 70, ease: 'power1.in', immediateRender: false }, 2230)
    .to(veil, { autoAlpha: 0, duration: 40 }, 2250);

  if (stage) addStone(timeline, stage, inFrame);

  timeline.set({}, {}, LENGTH);

  if (stage) {
    new IntersectionObserver(([entry]) => stage.setActive(entry.isIntersecting)).observe(root);
    stage.onFrame(() => placeParts(stage, parts, scenes.facets));
    // The big stone in 57 throws its own flecks across the white field.
    const drawPlainFlecks = createFlecks(q('[data-plain-flecks]'), { count: 22, seed: 29 });
    stage.onFrame((state) => {
      if (frames.plain.style.visibility === 'visible') drawPlainFlecks({ ...state, spin: state.spin + state.spinOffset });
    });
  }

  return timeline;
}

function addStone(timeline, stage, inFrame) {
  const { state } = stage;
  const { diamond, crystal, wire, backdrop } = state;

  // Hero: the brilliant falls through the fog into the pit and goes out at its floor.
  // The canvas rides above the fog until then; later the fog must cover the opaque backdrop.
  const canvas = document.querySelector('[data-stone]');
  gsap.set(canvas, { zIndex: 7 });
  timeline
    .to(diamond, { x: () => inFrame(PIT_MOUTH).x, y: () => inFrame(PIT_MOUTH).y, size: 0.4, duration: 150, ease: 'power1.inOut' }, 0)
    .to(diamond, { x: () => inFrame(PIT_FLOOR).x, y: () => inFrame(PIT_FLOOR).y, size: 0.08, duration: 70, ease: 'power2.in' }, 150)
    .to(diamond, { opacity: 0, duration: 45, ease: 'power1.in' }, 175)
    .set(canvas, { zIndex: 5 }, 300);

  // −150 km: the rough crystal rises out of the fog, the frame copied behind it to refract.
  timeline
    .set(backdrop, { on: true, from: 0, to: 0, mix: 0 }, 560)
    .fromTo(crystal, { opacity: 0, x: 0.22, y: 0.4, size: 0.14 }, { opacity: 1, y: 0.06, size: 0.3, duration: 80, ease: 'power2.out', immediateRender: false }, 560);

  // Surface: it travels into the tweezers and the footage takes over.
  timeline
    .set(backdrop, { to: 1 }, 720)
    .to(backdrop, { mix: 1, duration: 45 }, 735)
    .to(crystal, { x: () => inFrame(LOUPE_CRYSTAL).x, y: () => inFrame(LOUPE_CRYSTAL).y, size: () => inFrame(LOUPE_CRYSTAL).size / 0.85, tilt: 0.5, duration: 55, ease: 'power2.inOut' }, 722)
    // The smooth hull must be gone before the crumpled footage stone fully resolves.
    .to(crystal, { opacity: 0, duration: 28, ease: 'power1.in' }, 748)
    .set(backdrop, { on: false }, 835);

  // Bench: the crystal waits on the marble, shivers, sheds its skin; the cutting
  // diagram draws itself through the shards and sets into glass.
  timeline
    .set(backdrop, { on: true, from: 2, to: 2, mix: 0 }, 1080)
    .set(crystal, { x: 0.18, y: 0.04, size: 0.36, tilt: 0.25, burst: 0, shake: 0, gloss: 0 }, 1080)
    .to(crystal, { opacity: 1, duration: 40, ease: 'power1.out' }, 1085)
    .set(diamond, { x: 0.18, y: 0.04, size: 0.3, highlight: -1 }, 1150)
    .to(state, { follow: 0, duration: 20 }, 1150)
    .to(crystal, { shake: 1, duration: 70, ease: 'power1.in' }, 1160)
    .to(crystal, { burst: 1, duration: 130 }, 1230)
    .to(crystal, { gloss: 1, duration: 40 }, 1225)
    .to(crystal, { shake: 0, duration: 20 }, 1230)
    .set(crystal, { opacity: 0 }, 1362)
    .to(wire, { opacity: 1, duration: 25 }, 1240)
    .to(wire, { draw: 57.5, duration: 100, ease: 'power1.inOut' }, 1250)
    .to(diamond, { opacity: 1, duration: 60, ease: 'power1.inOut' }, 1340)
    .to(wire, { opacity: 0, duration: 60 }, 1370)
    .set(backdrop, { on: false }, 1365);

  // 57: the stone turns side-on and slowly about its axis; the diagram redraws
  // facet by facet with the counter, and the fire climbs.
  timeline
    .to(diamond, { x: 0.24, y: -0.06, size: 0.56, duration: 80, ease: 'power2.inOut' }, 1500)
    .to(state, { restTilt: 0.16, follow: 0.25, duration: 80, ease: 'power2.inOut' }, 1500)
    .to(state, { spinRate: 0, duration: 60 }, 1500)
    .set(wire, { draw: 0 }, 1535)
    .to(wire, { opacity: 0.55, duration: 20 }, 1585)
    .to(state, { spinOffset: `+=${Math.PI * 2}`, duration: 280 }, 1600)
    .to(wire, { draw: 57.5, duration: 260 }, 1600)
    .to(diamond, { highlight: 56.5, duration: 260 }, 1600)
    .set(diamond, { highlight: -1 }, 1858)
    .to(wire, { opacity: 0, duration: 14 }, 1858)
    .to(diamond, { dispersion: 0.03, duration: 260, ease: 'power1.in' }, 1600);

  // Setting: the brilliant shrinks into the tweezers, then the footage sets it.
  timeline
    .to(diamond, { x: () => inFrame(SETTING_STONE).x, y: () => inFrame(SETTING_STONE).y, size: () => inFrame(SETTING_STONE).size, dispersion: 0.04, duration: 75, ease: 'power2.inOut' }, 1910)
    .to(state, { restTilt: 0.62, follow: 0, duration: 75, ease: 'power2.inOut' }, 1910)
    .to(diamond, { opacity: 0, duration: 20 }, 1975);
}

// Leader lines from the part names to the stone's crown, girdle and pavilion.
const PART_POINTS = {};
function placeParts(stage, parts, scene) {
  if (scene.style.visibility === 'hidden' || getComputedStyle(scene).visibility === 'hidden') return;
  if (!PART_POINTS.crown) {
    const { crownY, girdleY, culetY } = stage.brilliant;
    PART_POINTS.crown = new THREE.Vector3(0.36, crownY - 0.06, 0);
    PART_POINTS.girdle = new THREE.Vector3(0.5, girdleY, 0);
    PART_POINTS.pavilion = new THREE.Vector3(0.24, (girdleY + culetY) / 2, 0);
  }
  const edge = stage.project(new THREE.Vector3(0.5, 0, 0), true).x + 72;
  parts.forEach((part) => {
    const point = stage.project(PART_POINTS[part.dataset.part], true);
    part.style.setProperty('--leader', `${Math.max(edge - point.x, 16)}px`);
    part.style.transform = `translate(${point.x}px, ${point.y}px) translateY(-50%)`;
  });
}

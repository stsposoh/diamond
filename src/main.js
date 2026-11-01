import { createStoneStage } from './stone/stage.js';
import { createFlecks } from './stone/flecks.js';
import { createJourney, BACKDROPS } from './journey.js';
import { createAtelier } from './atelier.js';
import { initConsultation } from './consultation.js';
import { playIntro } from './intro.js';
import { createSmoothScroll } from './smooth-scroll.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const lowPower = window.matchMedia('(max-width: 47.99rem), (pointer: coarse)').matches;

const marks = [...document.querySelectorAll('.scale__mark')];

const setCurrent = (index) => {
  marks.forEach((mark, i) => {
    if (i === index) mark.setAttribute('aria-current', 'true');
    else mark.removeAttribute('aria-current');
  });
};

// Reduced motion and small screens get the journey as still frames, without pinning or video.
const isStatic = reducedMotion || lowPower;
document.documentElement.classList.toggle('is-static', isStatic);

// Unpinned, each chapter's address moves from its scroll marker onto the scene itself.
if (isStatic) {
  document.querySelectorAll('.journey__marker').forEach((marker) => {
    const scene = document.querySelector(marker.id === 'top' ? '[data-hero]' : `[data-scene="${marker.id}"]`);
    scene.id = marker.id;
    marker.remove();
  });
}

// A chapter becomes current once it crosses the middle of the viewport. While the
// journey is pinned its scenes overlap, so there the timeline reports the chapter.
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setCurrent(Number(entry.target.dataset.chapter));
    });
  },
  { rootMargin: '-50% 0px -50% 0px' },
);

document.querySelectorAll(isStatic ? '[data-chapter]' : '.hand[data-chapter]').forEach((chapter) => observer.observe(chapter));

const stoneCanvas = document.querySelector('[data-stone]');
const hero = document.querySelector('[data-hero]');

const startStone = () => {
  if (!document.createElement('canvas').getContext('webgl2')) {
    stoneCanvas.remove();
    return null;
  }

  if (isStatic) hero.append(stoneCanvas);
  const stage = createStoneStage({ canvas: stoneCanvas, reducedMotion, lowPower, story: !isStatic, backdrops: BACKDROPS });

  if (!lowPower) {
    const drawFlecks = createFlecks(document.querySelector('[data-flecks]'));
    stage.onFrame(drawFlecks);
    drawFlecks(stage.state);

    // The plinth catches the stone's light: a pool that brightens on each flash, and small glints.
    const pool = document.querySelector('[data-pool]');
    const drawGlints = createFlecks(document.querySelector('[data-glints]'), { count: 18, seed: 5, area: { x: 0.08, y: 0.1, w: 0.84, h: 0.7 }, scale: 0.6 });
    stage.onFrame((state) => {
      drawGlints(state);
      pool.style.opacity = 0.65 + 0.35 * Math.pow(Math.max(Math.cos(state.spin * 3), 0), 4);
    });
  }

  if (isStatic) {
    new IntersectionObserver(([entry]) => stage.setActive(entry.isIntersecting)).observe(hero);
  }
  return stage;
};

const stage = startStone();

// Unpinned, the 57 chapter gets its own still brilliant, rendered only while on screen.
const facetsCanvas = document.querySelector('[data-facets-stone]');
if (isStatic && stage) {
  const facets = createStoneStage({ canvas: facetsCanvas, reducedMotion, lowPower });
  Object.assign(facets.state.diamond, { x: 0, y: 0.32, size: 0.5, dispersion: 0.05 });
  Object.assign(facets.state, { restTilt: 0.34, tiltX: 0.34, follow: 0 });
  facets.render();
  new IntersectionObserver(([entry]) => facets.setActive(entry.isIntersecting)).observe(facetsCanvas);
} else {
  facetsCanvas.remove();
}
// Reduced motion and touch screens keep the native scroll.
const lenis = isStatic ? null : createSmoothScroll();

if (!isStatic) createJourney({ stage, onChapter: setCurrent, scrollTo: (top) => lenis.scrollTo(top, { duration: 1.6 }) });
createAtelier({ animate: !isStatic, reducedMotion });

// Opened partway down the page, the scroll timeline already owns the hero's state.
if (document.documentElement.classList.contains('is-intro')) {
  if (window.scrollY < 10) playIntro();
  else document.documentElement.classList.remove('is-intro');
}

initConsultation();

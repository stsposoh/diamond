import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { createStoneStage } from './stone/stage.js';

gsap.registerPlugin(ScrollTrigger);

// How far the nearest plane grows by the end of the dolly; each plane grows in proportion to its depth.
const PUSH = 1.1;

// The brilliant floats over the middle of the cabinet, measured on the cabinet image:
// x across it, how far above its top edge the stone's base hovers, the stone's diameter in cabinet widths.
const PERCH = { x: 0.5, surface: 0.04, size: 0.09 };

// Stone diameter, in viewport heights, once the camera has dived into it. Much larger and
// the camera sits almost inside the stone, where the refraction shader stalls the GPU.
const FILL = 1.7;

export function createAtelier({ animate, reducedMotion }) {
  const root = document.querySelector('[data-atelier]');
  const stone = createAtelierStone(root, reducedMotion);
  if (!animate) return null;

  const planes = root.querySelectorAll('.atelier__plane');
  const near = root.querySelectorAll('[data-atelier-near]');
  const title = root.querySelector('[data-atelier-title]');
  const haze = root.querySelector('[data-atelier-haze]');
  const flash = root.querySelector('[data-atelier-flash]');
  const zoom = root.querySelector('[data-atelier-zoom]');

  // Times are 0–100 of the section: the dolly into the room, then a dive into the stone.
  const timeline = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: 0.25 },
  });

  // The journey ends in white, so the room arrives out of the same haze.
  timeline.fromTo(haze, { opacity: 1 }, { opacity: 0, duration: 15, ease: 'power1.out' }, 0);

  planes.forEach((plane) => {
    const depth = Number(plane.dataset.depth);
    timeline
      .to(plane, { scale: 1 + depth * PUSH, duration: 45, ease: 'power1.inOut' }, 8)
      .to(plane, { scale: 1 + depth * PUSH * 4, duration: 37, ease: 'power2.in' }, 55);
  });

  timeline
    .to(near, { filter: 'blur(10px)', duration: 35 }, 20)
    .fromTo(title, { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 17, ease: 'power2.out' }, 16)
    .to(title, { autoAlpha: 0, y: -60, duration: 8, ease: 'power1.in' }, 52)
    .fromTo(flash, { opacity: 0 }, { opacity: 1, duration: 8, ease: 'power1.in' }, 86);

  if (stone) {
    timeline
      .to(stone.dive, { move: 1, duration: 32, ease: 'power2.inOut' }, 55)
      .to(stone.dive, { fill: 1, duration: 37, ease: 'power3.in' }, 55)
      .to(stone.state.diamond, { dispersion: 0.065, duration: 37, ease: 'power1.in' }, 55)
      // The last stretch enlarges the finished frame instead of the 3D stone, which costs nothing.
      .to(zoom, { scale: 2.4, duration: 14, ease: 'power2.in' }, 80)
      // Hidden under the flash; at zero opacity the stage skips rendering.
      .set(stone.state.diamond, { opacity: 0 }, 94);
  }

  timeline.set({}, {}, 100);
  return timeline;
}

function createAtelierStone(root, reducedMotion) {
  const canvas = root.querySelector('[data-atelier-stone]');
  if (!document.createElement('canvas').getContext('webgl2')) {
    canvas.remove();
    return null;
  }

  const box = root.querySelector('.atelier__stage');
  const cabinet = root.querySelector('.atelier__cabinet');
  // Low-power settings throughout: at the end the stone fills the screen, the heaviest frame on the site.
  const stage = createStoneStage({ canvas, reducedMotion, lowPower: true });
  const dive = { move: 0, fill: 0 };

  // Follows the cabinet through the dolly, then drifts to the centre while it grows past the edges.
  const place = () => {
    const frame = box.getBoundingClientRect();
    const top = cabinet.getBoundingClientRect();
    const unit = Math.min(frame.height, frame.width / 0.75);
    const perched = (top.width * PERCH.size) / unit;
    const size = perched + (FILL - perched) * dive.fill;
    const x = top.left + top.width * PERCH.x - frame.left;
    const y = top.top + top.height * PERCH.surface - (size * unit) / 2 - frame.top;
    const onCabinet = { x: (x / frame.width) * 2 - 1, y: 1 - (y / frame.height) * 2 };
    Object.assign(stage.state.diamond, {
      x: onCabinet.x * (1 - dive.move),
      y: onCabinet.y * (1 - dive.move),
      size,
    });
  };

  stage.onFrame(place);
  new IntersectionObserver(([entry]) => stage.setActive(entry.isIntersecting)).observe(root);

  if (reducedMotion) {
    const still = () => {
      place();
      stage.render();
    };
    cabinet.addEventListener('load', still, { once: true });
    window.addEventListener('resize', still);
    still();
  }

  return { dive, state: stage.state };
}

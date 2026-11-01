import gsap from 'gsap';

// The hero's entrance on load. It moves inner elements and the stone canvas only: the hero's
// blocks themselves belong to the scroll timeline, which would fight over the same properties.
export function playIntro() {
  const q = (selector) => [...document.querySelectorAll(selector)];
  const rise = { autoAlpha: 0, y: 28 };

  gsap
    .timeline({ defaults: { ease: 'power3.out' }, onStart: () => document.documentElement.classList.remove('is-intro') })
    .fromTo('.hero__wash', { autoAlpha: 1 }, { autoAlpha: 0, duration: 1.2, ease: 'power1.out' }, 0)
    .fromTo(q('.stone, .hero__light'), { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 1.6 }, 0.35)
    .fromTo('.hero__title', rise, { autoAlpha: 1, y: 0, duration: 1.1 }, 0.55)
    .fromTo(q('.hero__lede, .hero__action .button'), rise, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12 }, 0.8)
    .fromTo(q('.site-nav > *, .scale'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.9, ease: 'power1.out' }, 0.9)
    .fromTo(q('.hero__awards-title, .hero__awards-list li'), { autoAlpha: 0, x: 16 }, { autoAlpha: 1, x: 0, duration: 0.8, stagger: 0.1 }, 1.05)
    .fromTo(q('.hero__cue > *'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, ease: 'power1.out', stagger: 0.15 }, 1.3);
}

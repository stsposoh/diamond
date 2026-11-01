// Spectral flecks thrown by the stone onto the room. Each fleck flashes when the
// stone's turn lines a facet up with it, and slides as the stone tilts.
const SPECTRUM = ['#ff5a6a', '#ffb347', '#f2ea6b', '#6fe3a8', '#58cdf7', '#9a7cff'];

function random(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createSprite(length, thickness) {
  const pad = thickness * 0.6;
  const sprite = document.createElement('canvas');
  sprite.width = Math.ceil(length + pad * 2);
  sprite.height = Math.ceil(thickness + pad * 2);
  const ctx = sprite.getContext('2d');

  const band = ctx.createLinearGradient(pad, 0, pad + length, 0);
  SPECTRUM.forEach((colour, i) => band.addColorStop(i / (SPECTRUM.length - 1), colour));
  ctx.fillStyle = band;
  ctx.fillRect(0, 0, sprite.width, sprite.height);

  // Soft elliptical mask so the band reads as light, not as a painted stripe.
  ctx.globalCompositeOperation = 'destination-in';
  ctx.translate(sprite.width / 2, sprite.height / 2);
  ctx.scale(sprite.width / 2, sprite.height / 2);
  const mask = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  mask.addColorStop(0, 'rgba(0,0,0,1)');
  mask.addColorStop(0.55, 'rgba(0,0,0,0.85)');
  mask.addColorStop(0.8, 'rgba(0,0,0,0.25)');
  mask.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = mask;
  ctx.fillRect(-1, -1, 2, 2);
  return sprite;
}

export function createFlecks(canvas, { count = 30, seed = 11, area = { x: 0.06, y: 0.08, w: 0.88, h: 0.64 }, scale = 1 } = {}) {
  const ctx = canvas.getContext('2d');
  const rand = random(seed);
  const flecks = [...Array(count)].map(() => {
    const length = (18 + Math.pow(rand(), 2) * 90) * scale;
    const thickness = (1.5 + rand() * 3.5) * scale;
    return {
      x: area.x + rand() * area.w,
      y: area.y + rand() * area.h,
      angle: -0.9 + rand() * 0.7,
      phase: rand() * Math.PI * 2,
      rate: 1 + Math.floor(rand() * 3),
      drift: (20 + rand() * 40) * scale,
      sprite: createSprite(length, thickness),
    };
  });

  let width = 0;
  let height = 0;
  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  return (stone) => {
    ctx.clearRect(0, 0, width, height);
    const turn = stone.spin + stone.yaw * 1.5;
    for (const fleck of flecks) {
      const wave = Math.cos(turn * fleck.rate + fleck.phase);
      const flash = Math.pow(Math.max(wave, 0), 8);
      if (flash < 0.01) continue;
      const x = fleck.x * width + Math.sin(turn * fleck.rate + fleck.phase) * fleck.drift;
      const y = fleck.y * height + (stone.tiltX - 0.42) * fleck.drift * 3;
      ctx.save();
      ctx.globalAlpha = flash * 0.9;
      ctx.translate(x, y);
      ctx.rotate(fleck.angle);
      ctx.drawImage(fleck.sprite, -fleck.sprite.width / 2, -fleck.sprite.height / 2);
      ctx.restore();
    }
  };
}

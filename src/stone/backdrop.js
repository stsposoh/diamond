import * as THREE from 'three';

// A full-screen copy of the frame the page shows under the canvas, drawn inside the
// scene so the transmissive crystal has something to refract. It is cover-fitted
// exactly like the CSS frame, and sRGB in / sRGB out without tone mapping, so it
// lands on the same pixels and stays invisible as a layer.
// Each frame may be anchored and zoomed from one side, mirroring the CSS frame's
// `object-position` and `transform: scale()` with the same origin.
export function createBackdrop(frames) {
  const loader = new THREE.TextureLoader();
  const textures = frames.map(({ url }) => {
    const texture = loader.load(url, () => refit());
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  });
  const framing = frames.map(({ anchor = 0.5, zoom = 1 }) => ({ anchor, zoom }));

  const uniforms = {
    from: { value: textures[0] },
    to: { value: textures[0] },
    mixAmount: { value: 0 },
    frameFrom: { value: new THREE.Vector4(1, 1, 0.5, 1) },
    frameTo: { value: new THREE.Vector4(1, 1, 0.5, 1) },
  };
  let screen = 1;
  let current = { from: 0, to: 0 };

  const material = new THREE.ShaderMaterial({
    uniforms,
    depthTest: false,
    depthWrite: false,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.999, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D from;
      uniform sampler2D to;
      uniform float mixAmount;
      uniform vec4 frameFrom;
      uniform vec4 frameTo;
      varying vec2 vUv;

      // frame: cover scale (xy), horizontal anchor (z), zoom (w).
      vec2 frameUv(vec2 screen, vec4 frame) {
        vec2 p = vec2(frame.z, 0.5) + (screen - vec2(frame.z, 0.5)) / frame.w;
        return vec2(p.x * frame.x + (1.0 - frame.x) * frame.z, (p.y - 0.5) * frame.y + 0.5);
      }

      void main() {
        vec4 a = texture2D(from, frameUv(vUv, frameFrom));
        vec4 b = texture2D(to, frameUv(vUv, frameTo));
        gl_FragColor = mix(a, b, mixAmount);
        #include <colorspace_fragment>
      }
    `,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  mesh.frustumCulled = false;
  mesh.renderOrder = -1;
  mesh.visible = false;

  // Same arithmetic as `object-fit: cover` for each frame's own aspect.
  const fit = (target, index) => {
    const image = textures[index].image;
    const frame = image ? image.width / image.height : 16 / 9;
    const { anchor, zoom } = framing[index];
    target.set(screen > frame ? 1 : screen / frame, screen > frame ? frame / screen : 1, anchor, zoom);
  };

  function refit() {
    fit(uniforms.frameFrom.value, current.from);
    fit(uniforms.frameTo.value, current.to);
  }

  const resize = (width, height) => {
    screen = width / height;
    refit();
  };

  const set = (state) => {
    mesh.visible = state.on;
    if (state.from !== current.from || state.to !== current.to) {
      uniforms.from.value = textures[state.from];
      uniforms.to.value = textures[state.to];
      current = { from: state.from, to: state.to };
      refit();
    }
    uniforms.mixAmount.value = state.mix;
  };

  return { mesh, resize, set };
}

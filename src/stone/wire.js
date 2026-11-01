import * as THREE from 'three';
import { CROWN_FACETS } from './brilliant.js';

// The cutting diagram: every facet outline as line segments, drawn facet by facet.
// `draw` runs 0–57; each facet's edges grow along their length as `draw` passes it.
// The girdle is drawn between crown and pavilion but is not one of the 57.
export function createWire(polygons) {
  const positions = [];
  const order = [];
  const along = [];

  for (const { id, points } of polygons) {
    const slot = id < 0 ? CROWN_FACETS - 0.5 : id;
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
      order.push(slot, slot);
      along.push(0, 1);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('order', new THREE.Float32BufferAttribute(order, 1));
  geometry.setAttribute('along', new THREE.Float32BufferAttribute(along, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    uniforms: {
      draw: { value: 0 },
      opacity: { value: 0 },
      color: { value: new THREE.Color(0x14171b) },
    },
    vertexShader: /* glsl */ `
      attribute float order;
      attribute float along;
      varying float vOrder;
      varying float vAlong;
      void main() {
        vOrder = order;
        vAlong = along;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float draw;
      uniform float opacity;
      uniform vec3 color;
      varying float vOrder;
      varying float vAlong;
      void main() {
        float grown = clamp(draw - vOrder, 0.0, 1.0);
        if (vAlong > grown) discard;
        gl_FragColor = vec4(color, opacity * 0.85);
        #include <colorspace_fragment>
      }
    `,
  });

  const lines = new THREE.LineSegments(geometry, material);
  lines.renderOrder = 4;
  lines.frustumCulled = false;
  return lines;
}

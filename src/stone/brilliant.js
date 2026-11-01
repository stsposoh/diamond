import * as THREE from 'three';

// Round brilliant close to Tolkowsky proportions, girdle diameter 1.
// Every triangle carries the index of the facet it belongs to (0–56): crown facets
// first (table, stars, kites, upper girdles), then the pavilion (mains, lower girdles).
const R = 0.5;
const TABLE_CORNER = 0.303;
const STAR_POINT = 0.4;
const LOWER_GIRDLE_POINT = 0.125;
const CROWN_ANGLE = THREE.MathUtils.degToRad(34.5);
const PAVILION_ANGLE = THREE.MathUtils.degToRad(40.8);
const GIRDLE = 0.03;

const STEP = Math.PI / 4;
const HALF = Math.PI / 8;

const girdleTop = GIRDLE / 2;
const girdleBottom = -GIRDLE / 2;
const crownHeight = (R - TABLE_CORNER) * Math.tan(CROWN_ANGLE);
const pavilionDepth = R * Math.tan(PAVILION_ANGLE);

const at = (angle, radius, y) => new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius);

// Height of a point on a crown kite or pavilion main plane, from its distance projected
// onto that facet's main direction; this keeps every kite planar.
const crownY = (projected) => girdleTop + (R - projected) * Math.tan(CROWN_ANGLE);
const pavilionY = (projected) => girdleBottom - (R - projected) * Math.tan(PAVILION_ANGLE);

export const FACET_COUNT = 57;
export const CROWN_FACETS = 33;

export function createBrilliant() {
  const main = (m) => m * STEP;
  const between = (m) => m * STEP + HALF;

  const table = [...Array(8)].map((_, m) => at(main(m), TABLE_CORNER, girdleTop + crownHeight));
  const star = [...Array(8)].map((_, m) => at(between(m), STAR_POINT, crownY(STAR_POINT * Math.cos(HALF))));
  const girdleUpper = [...Array(16)].map((_, i) => at(i * HALF, R, girdleTop));
  const girdleLower = [...Array(16)].map((_, i) => at(i * HALF, R, girdleBottom));
  const lower = [...Array(8)].map((_, m) => at(between(m), LOWER_GIRDLE_POINT, pavilionY(LOWER_GIRDLE_POINT * Math.cos(HALF))));
  const culet = new THREE.Vector3(0, girdleBottom - pavilionDepth, 0);
  const center = new THREE.Vector3(0, (girdleTop + crownHeight + culet.y) / 2, 0);

  const positions = [];
  const facets = [];
  const polygons = [];
  let facet = 0;

  const triangle = (a, b, c, id, outline = true) => {
    if (outline) polygons.push({ id, points: [a, b, c] });
    const normal = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a));
    const centroid = new THREE.Vector3().add(a).add(b).add(c).divideScalar(3).sub(center);
    const [p, q, r] = normal.dot(centroid) < 0 ? [a, c, b] : [a, b, c];
    positions.push(p.x, p.y, p.z, q.x, q.y, q.z, r.x, r.y, r.z);
    facets.push(id, id, id);
  };
  const polygon = (points, id) => {
    for (let i = 1; i < points.length - 1; i++) triangle(points[0], points[i], points[i + 1], id, false);
    polygons.push({ id, points });
  };
  const next = (m) => (m + 1) % 8;
  const prev = (m) => (m + 7) % 8;

  polygon(table, facet++);
  for (let m = 0; m < 8; m++) triangle(table[m], table[next(m)], star[m], facet++);
  for (let m = 0; m < 8; m++) polygon([table[m], star[m], girdleUpper[m * 2], star[prev(m)]], facet++);
  for (let m = 0; m < 8; m++) {
    triangle(star[m], girdleUpper[m * 2], girdleUpper[m * 2 + 1], facet++);
    triangle(star[m], girdleUpper[m * 2 + 1], girdleUpper[(m * 2 + 2) % 16], facet++);
  }

  for (let m = 0; m < 8; m++) polygon([culet, lower[m], girdleLower[m * 2], lower[prev(m)]], facet++);
  for (let m = 0; m < 8; m++) {
    triangle(lower[m], girdleLower[m * 2], girdleLower[m * 2 + 1], facet++);
    triangle(lower[m], girdleLower[m * 2 + 1], girdleLower[(m * 2 + 2) % 16], facet++);
  }

  // The girdle band is not counted among the 57 facets.
  for (let i = 0; i < 16; i++) {
    const j = (i + 1) % 16;
    polygon([girdleUpper[i], girdleUpper[j], girdleLower[j], girdleLower[i]], -1);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('facet', new THREE.Float32BufferAttribute(facets, 1));
  geometry.computeVertexNormals();
  geometry.translate(0, -center.y, 0);
  const offset = new THREE.Vector3(0, -center.y, 0);
  polygons.forEach((p) => { p.points = p.points.map((point) => point.clone().add(offset)); });

  return { geometry, polygons, crownY: table[0].y - center.y, girdleY: -center.y, culetY: culet.y - center.y };
}

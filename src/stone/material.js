import * as THREE from 'three';
import { MeshBVHUniformStruct, BVHShaderGLSL } from 'three-mesh-bvh';

// Ray-traced brilliant: each colour channel refracts in with its own index, bounces
// inside the stone against a BVH of its own facets and samples the studio on the way
// out. The spread between channel indices is the stone's fire.
export function createDiamondMaterial({ envMap, bvh, bounces = 4, dispersion = 0.04 }) {
  const uniforms = {
    envMap: { value: envMap },
    bvh: { value: new MeshBVHUniformStruct() },
    bounces: { value: bounces },
    ior: { value: 2.417 },
    dispersion: { value: dispersion },
    exposure: { value: 1 },
    opacity: { value: 1 },
    highlight: { value: -1 },
  };
  uniforms.bvh.value.updateFrom(bvh);

  return new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    premultipliedAlpha: true,
    vertexShader: /* glsl */ `
      attribute float facet;
      varying vec3 vWorldPosition;
      varying vec3 vWorldNormal;
      varying float vFacet;

      void main() {
        vFacet = facet;
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorldPosition = world.xyz;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */ `
      #define RAY_OFFSET 0.0005
      #define MAX_BOUNCES 6

      #include <common>
      precision highp isampler2D;
      precision highp usampler2D;

      ${BVHShaderGLSL.common_functions}
      ${BVHShaderGLSL.bvh_struct_definitions}
      ${BVHShaderGLSL.bvh_ray_functions}

      varying vec3 vWorldPosition;
      varying vec3 vWorldNormal;
      varying float vFacet;

      uniform sampler2D envMap;
      uniform float opacity;
      uniform float highlight;
      uniform BVH bvh;
      uniform float bounces;
      uniform float ior;
      uniform float dispersion;
      uniform float exposure;
      uniform mat4 modelMatrix;

      vec3 env(vec3 direction) {
        return texture2D(envMap, equirectUv(direction)).rgb;
      }

      vec3 trace(vec3 direction, vec3 normal, float eta, mat4 toLocal) {
        vec3 rayDirection = refract(direction, normal, 1.0 / eta);
        vec3 rayOrigin = (toLocal * vec4(vWorldPosition + rayDirection * RAY_OFFSET, 1.0)).xyz;
        rayDirection = normalize((toLocal * vec4(rayDirection, 0.0)).xyz);

        for (int i = 0; i < MAX_BOUNCES; i++) {
          if (float(i) >= bounces) break;

          uvec4 faceIndices = uvec4(0u);
          vec3 faceNormal = vec3(0.0, 0.0, 1.0);
          vec3 barycoord = vec3(0.0);
          float side = 1.0;
          float dist = 0.0;
          bvhIntersectFirstHit(bvh, rayOrigin, rayDirection, faceIndices, faceNormal, barycoord, side, dist);

          vec3 hit = rayOrigin + rayDirection * dist;
          vec3 outward = refract(rayDirection, faceNormal, eta);
          if (dot(outward, outward) > 0.0) {
            rayDirection = outward;
            break;
          }
          rayDirection = reflect(rayDirection, faceNormal);
          rayOrigin = hit + rayDirection * RAY_OFFSET;
        }

        return normalize((modelMatrix * vec4(rayDirection, 0.0)).xyz);
      }

      void main() {
        mat4 toLocal = inverse(modelMatrix);
        vec3 viewDirection = normalize(vWorldPosition - cameraPosition);
        vec3 normal = normalize(vWorldNormal);

        float r = env(trace(viewDirection, normal, ior * (1.0 - dispersion), toLocal)).r;
        float g = env(trace(viewDirection, normal, ior, toLocal)).g;
        float b = env(trace(viewDirection, normal, ior * (1.0 + dispersion), toLocal)).b;

        // Schlick reflection off the outer surface: the white flash on the table and kites.
        float f0 = pow((ior - 1.0) / (ior + 1.0), 2.0);
        float fresnel = f0 + (1.0 - f0) * pow(1.0 - max(dot(-viewDirection, normal), 0.0), 5.0);
        vec3 surface = env(reflect(viewDirection, normal));

        vec3 colour = mix(vec3(r, g, b), surface, fresnel) * exposure;
        // The facet the counter has just reached catches a little more light.
        colour *= 1.0 + 0.6 * (1.0 - smoothstep(0.0, 0.5, abs(vFacet - highlight)));
        gl_FragColor = vec4(colour, 1.0);

        #include <tonemapping_fragment>
        #include <colorspace_fragment>

        gl_FragColor *= opacity;
      }
    `,
  });
}

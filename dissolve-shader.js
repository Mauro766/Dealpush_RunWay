
import * as THREE from 'three';

/**
 * Aplica una disolución procedural a los materiales de un modelo GLB.
 *
 * mode:
 *   "dissolve" -> el auto desaparece
 *   "reveal"   -> el auto aparece
 */
export function applyDissolveShader(root, mode = 'dissolve') {
  const uniformsList = [];

  root.traverse((object) => {
    if (!object.isMesh || !object.material) return;

    const originalMaterials = Array.isArray(object.material)
      ? object.material
      : [object.material];

    const patchedMaterials = originalMaterials.map((original) => {
      const material = original.clone();

      const uniforms = {
        uDissolve: {
          value: mode === 'reveal' ? 0 : 1
        },
        uMode: {
          value: mode === 'reveal' ? 1 : 0
        },
        uEdgeWidth: { value: 0.045 },
        uEdgeColor: { value: new THREE.Color(0x168bff) }
      };

      material.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, uniforms);

        shader.vertexShader = shader.vertexShader.replace(
          '#include <common>',
          `#include <common>
          varying vec3 vDissolvePosition;`
        );

        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
          vDissolvePosition =
            (modelMatrix * vec4(transformed, 1.0)).xyz;`
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <common>',
          `#include <common>

          varying vec3 vDissolvePosition;

          uniform float uDissolve;
          uniform float uMode;
          uniform float uEdgeWidth;
          uniform vec3 uEdgeColor;

          float hash31(vec3 p) {
            p = fract(p * 0.1031);
            p += dot(p, p.yzx + 33.33);
            return fract((p.x + p.y) * p.z);
          }

          float noise3D(vec3 p) {
            vec3 i = floor(p);
            vec3 f = fract(p);

            f = f * f * (3.0 - 2.0 * f);

            float n000 = hash31(i + vec3(0.0, 0.0, 0.0));
            float n100 = hash31(i + vec3(1.0, 0.0, 0.0));
            float n010 = hash31(i + vec3(0.0, 1.0, 0.0));
            float n110 = hash31(i + vec3(1.0, 1.0, 0.0));
            float n001 = hash31(i + vec3(0.0, 0.0, 1.0));
            float n101 = hash31(i + vec3(1.0, 0.0, 1.0));
            float n011 = hash31(i + vec3(0.0, 1.0, 1.0));
            float n111 = hash31(i + vec3(1.0, 1.0, 1.0));

            float x00 = mix(n000, n100, f.x);
            float x10 = mix(n010, n110, f.x);
            float x01 = mix(n001, n101, f.x);
            float x11 = mix(n011, n111, f.x);

            return mix(
              mix(x00, x10, f.y),
              mix(x01, x11, f.y),
              f.z
            );
          }`
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <color_fragment>',
          `#include <color_fragment>

          float dissolvePattern =
            noise3D(vDissolvePosition * 2.8);

          if (uMode < 0.5) {
            if (dissolvePattern < uDissolve) discard;
          } else {
            if (dissolvePattern > uDissolve) discard;
          }

          float dissolveEdge = 1.0 - smoothstep(
            0.0,
            uEdgeWidth,
            abs(dissolvePattern - uDissolve)
          );`
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <output_fragment>',
          `outgoingLight +=
            uEdgeColor * dissolveEdge * 3.0;

          #include <output_fragment>`
        );
      };

      material.customProgramCacheKey = () => 'digital-dissolve-v1';
      material.needsUpdate = true;

      uniformsList.push(uniforms);
      return material;
    });

    object.material = Array.isArray(object.material)
      ? patchedMaterials
      : patchedMaterials[0];
  });

  return uniformsList;
}

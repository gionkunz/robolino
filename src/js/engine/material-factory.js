import THREE from '../three';
import ShaderFactory from '../engine/shader-factory';
import resourceSymbols from '../resource-symbols';
import extend from 'extend';
import {renderingEngine} from '../app';

export const materialTypes = {
  phong: Symbol(),
  shader: Symbol(),
  spherical: Symbol()
};

const materialFactoryFunctions = {
  [materialTypes.phong]: 'createPhongMaterial',
  [materialTypes.shader]: 'createShaderMaterial',
  [materialTypes.vertexColor]: 'createGlowMaterial',
  [materialTypes.spherical]: 'createSphericalMaterial'
};
const materials = new Map();

export default class MaterialFactory {
  static material(key) {
    return materials.get(key);
  }

  static createMaterial(key, type, data) {
    data = extend({}, data, {
      vertexColors: THREE.VertexColors
    });

    return MaterialFactory[materialFactoryFunctions[type]](key, data);
  }

  static createPhongMaterial(key, data) {
    const material = new THREE.MeshPhongMaterial(data);
    materials.set(key, material);
    return material;
  }

  static createShaderMaterial(key, data) {
    const shader = ShaderFactory.shader(data.shaderKey);
    delete data.shaderKey;

    data.vertexShader = shader.vertex;
    data.fragmentShader = shader.fragment;

    const material = new THREE.ShaderMaterial(data);
    materials.set(key, material);
    return material;
  }

  static createSphericalMaterial(key, data) {
    const defaultData = {
      uniforms: {
        tNormal: {type: 't', value: new THREE.Texture()},
        tMatCap: {type: 't', value: new THREE.Texture()},
        time: {type: 'f', value: 0},
        bump: {type: 'f', value: 0},
        noise: {type: 'f', value: 0.04},
        repeat: {type: 'v2', value: new THREE.Vector2(1, 1)},
        useNormal: {type: 'f', value: 0},
        useRim: {type: 'f', value: 0},
        rimPower: {type: 'f', value: 2},
        useScreen: {type: 'f', value: 0},
        normalScale: {type: 'f', value: 0.5},
        normalRepeat: {type: 'f', value: 1},
        fogColor: {type: 'v3', value: new THREE.Vector3(0, 0, 0)},
        fogNear: {type: 'f', value: 1},
        fogFar: {type: 'f', value: 1500},
        shadowMap: { type: 'tv', value: [renderingEngine.light1.shadowMap] },
        shadowMapSize: { type: 'v2v', value: [renderingEngine.light1.shadowMapSize] },
        shadowBias: { type: 'fv1', value: [renderingEngine.light1.shadowBias] },
        shadowDarkness: { type: 'fv1', value: [renderingEngine.light1.shadowDarkness] },
        shadowMatrix: { type: 'm4v', value: [renderingEngine.light1.shadowMatrix] }
      },
      wrapping: THREE.ClampToEdgeWrapping,
      shading: THREE.SmoothShading,
      side: THREE.FrontSide
    };

    data = extend(true, defaultData, data);
    data.shaderKey = resourceSymbols.shaders.spherical;
    return MaterialFactory.createShaderMaterial(key, data);
  }

  static createGlowMaterial(key, data = {glowColor: 0xffffff}) {
    data.shaderKey = resourceSymbols.shaders.vertexColor;
    data.shading = THREE.SmoothShading;
    return MaterialFactory.createShaderMaterial(key, data);
  }
}

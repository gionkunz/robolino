import THREE from './three';
import resourceSymbols from './resource-symbols';
import TextureFactory from './engine/texture-factory';
import ShaderFactory from './engine/shader-factory';
import ModelFactory from './engine/model-factory';
import MaterialFactory, {materialTypes} from './engine/material-factory';
import DeferredCall from './core/deferred-call';

const textureDefinitions = {
  [resourceSymbols.textures.sphericalBlack]: { url: './assets/textures/spherical/944_large_remake2.jpg'},
  [resourceSymbols.textures.sphericalMatball03]: { url: './assets/textures/spherical/matball03.jpg'},
  [resourceSymbols.textures.sphericalDarkMetalAntistrophy]: { url: './assets/textures/spherical/dark-metal-antistrophy.jpg'},
  [resourceSymbols.textures.sphericalChromeRough]: { url: './assets/textures/spherical/metal-rough.jpg'},
  [resourceSymbols.textures.normalBumps]: {url: './assets/textures/normal/normal.jpg'},
  [resourceSymbols.textures.normalStone3]: {url: './assets/textures/normal/2563-normal.jpg'},
  [resourceSymbols.textures.normalSkin]: {url: './assets/textures/normal/295-normal.jpg'},
  [resourceSymbols.textures.normalTileEven]: {url: './assets/textures/normal/normalmap_tile_even.jpg'},
  [resourceSymbols.textures.normalMetalWalkwayBumps]: {url: './assets/textures/normal/879-normal.jpg'}
};

const shaderDefinitions = {
  [resourceSymbols.shaders.spherical]: {
    vertex: './assets/shaders/vertex/spherical-vs.glsl',
    fragment: './assets/shaders/fragment/spherical-fs.glsl'
  }
};

const materialDefinition = {
  [resourceSymbols.materials.grayMatter]: {
    type: materialTypes.phong,
    data: {
      color: 0xdddddd,
      vertexColors: THREE.VertexColors,
      normalMap: new DeferredCall(() => TextureFactory.texture(resourceSymbols.textures.normalStone3)),
      normalScale: new THREE.Vector2(0.2, 0.2),
      shininess: 20,
      specular: 0xefefef
    }
  },
  [resourceSymbols.materials.ground]: {
    type: materialTypes.phong,
    data: {
      color: 0xdddddd,
      vertexColors: THREE.VertexColors,
      normalMap: new DeferredCall(() => TextureFactory.texture(resourceSymbols.textures.normalTileEven, {
        clone: true,
        overrides: {
          wrapS: THREE.RepeatWrapping,
          wrapT: THREE.RepeatWrapping,
          repeat: new THREE.Vector2(100, 100)
        }
      })),
      normalScale: new THREE.Vector2(0.2, 0.2)
    }
  },
  [resourceSymbols.materials.redPhong]: {
    type: materialTypes.phong,
    data: {
      color: 0x882222,
      ambient: 0x882222,
      specular: 0xffeeee,
      perPixel: true,
      vertexColors: THREE.FaceColors
    }
  },
  [resourceSymbols.materials.pureWhite]: {
    type: materialTypes.phong,
    data: {
      color: 0xffffff,
      vertexColors: THREE.VertexColors,
      shininess: 0
    }
  },
  [resourceSymbols.materials.sphericalBlack]: {
    type: materialTypes.spherical,
    data: {
      uniforms: {
        tMatCap: {value: new DeferredCall(() => TextureFactory.texture(resourceSymbols.textures.sphericalBlack))},
        tNormal: {value: new DeferredCall(() => TextureFactory.texture(resourceSymbols.textures.normalBumps))},
        useNormal: {value: 1}
      }
    }
  },
  [resourceSymbols.materials.darkMetal]: {
    type: materialTypes.spherical,
    data: {
      uniforms: {
        tMatCap: {value: new DeferredCall(() => TextureFactory.texture(resourceSymbols.textures.sphericalDarkMetalAntistrophy))},
        tNormal: {
          value: new DeferredCall(() => TextureFactory.texture(resourceSymbols.textures.normalSkin, {
            clone: true,
            overrides: {
              wrapS: THREE.RepeatWrapping,
              wrapT: THREE.RepeatWrapping
            }
          }))
        },
        useNormal: {value: 1},
        repeat: {value: new THREE.Vector2(5, 5)}
      }
    }
  },
  [resourceSymbols.materials.chromeWalkway]: {
    type: materialTypes.spherical,
    data: {
      uniforms: {
        tMatCap: {value: new DeferredCall(() => TextureFactory.texture(resourceSymbols.textures.sphericalChromeRough))},
        tNormal: {
          value: new DeferredCall(() => TextureFactory.texture(resourceSymbols.textures.normalMetalWalkwayBumps, {
            clone: true,
            overrides: {
              wrapS: THREE.RepeatWrapping,
              wrapT: THREE.RepeatWrapping
            }
          }))
        },
        useNormal: {value: 1},
        normalScale: {value: 0.3},
        repeat: {value: new THREE.Vector2(5, 5)},
        useRim: {value: 1},
        rimPower: {value: 2.5}
      }
    }
  },
  [resourceSymbols.materials.organicGreen]: {
    type: materialTypes.spherical,
    data: {
      uniforms: {
        tMatCap: {value: new DeferredCall(() => TextureFactory.texture(resourceSymbols.textures.sphericalMatball03))},
        tNormal: {value: new DeferredCall(() => TextureFactory.texture(resourceSymbols.textures.normalSkin))},
        useNormal: {value: 1},
        useRim: {value: 1},
        rimPower: {value: 2.5}
      }
    }
  },
  [resourceSymbols.materials.glowBlue]: {
    type: materialTypes.glow,
    data: {
      color: 0xdef3ff
    }
  }
};

const modelDefinitions = {
  [resourceSymbols.models.cube]: {
    url: './assets/models/cube.dae',
    options: {
      materials: {
        material1: resourceSymbols.materials.chromeWalkway
      }
    }
  },
  [resourceSymbols.models.suzanne]: {
    url: './assets/models/uv-monkey.dae',
    options: {
      materials: {
        material1: resourceSymbols.materials.organicGreen
      }
    }
  },
  [resourceSymbols.models.glowCube]: {
    url: './assets/models/glow-cube.dae',
    options: {
      materials: {
        material1: resourceSymbols.materials.redPhong,
        material2: resourceSymbols.materials.glowBlue
      }
    }
  }
};

function withResource(symbols, definitions, callback) {
  return Object.keys(symbols).map((key) => {
    const resourceKey = symbols[key];
    if (!definitions[resourceKey]) {
      throw new Error(`Resource "${key}" was not found in resource definitions ${definitions}`);
    }
    return callback(resourceKey, definitions[resourceKey]);
  });
}

export default function loadResources() {
  return Promise.all([
    // With all texture symbols, load textures from texture definitions
    Promise.all(withResource(resourceSymbols.textures, textureDefinitions, (resourceKey, data) =>
      TextureFactory.loadTexture(resourceKey, data.url, data.options || {}))),
    // With all shader symbols, load shaders from shader definitions
    Promise.all(withResource(resourceSymbols.shaders, shaderDefinitions, (resourceKey, data) =>
      ShaderFactory.loadShader(resourceKey, data.vertex, data.fragment)))
  ]).then(() => {
    // Textures and shaders need to be loaded before we create materials
    return Promise.all(withResource(resourceSymbols.materials, materialDefinition, (resourceKey, data) => {
      DeferredCall.resolveDeferredCalls(data);
      MaterialFactory.createMaterial(resourceKey, data.type, data.data);
    }));
  }).then(() => {
    // Materials needed to be initialized before we load the models
    return Promise.all(withResource(resourceSymbols.models, modelDefinitions, (resourceKey, data) =>
      ModelFactory.loadModel(resourceKey, data.url, data.options || {})));
  });
}
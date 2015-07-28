import THREE from './three';
import resourceSymbols from './resource-symbols';
import MaterialFactory from './engine/material-factory';
import TextureFactory from './engine/texture-factory';

export default function initializeMaterials() {
  MaterialFactory.createPhongMaterial(resourceSymbols.materials.grayMatter, {
    color: 0xdddddd,
    vertexColors: THREE.VertexColors,
    normalMap: TextureFactory.texture(resourceSymbols.textures.normalStone3),
    normalScale: new THREE.Vector2(0.2, 0.2),
    shininess: 20,
    specular: 0xefefef
  });

  MaterialFactory.createPhongMaterial(resourceSymbols.materials.ground, {
    color: 0xdddddd,
    vertexColors: THREE.VertexColors,
    normalMap: TextureFactory.texture(resourceSymbols.textures.normalTileEven, {
      clone: true,
      overrides: {
        wrapS: THREE.RepeatWrapping,
        wrapT: THREE.RepeatWrapping,
        repeat: new THREE.Vector2(100, 100)
      }
    }),
    normalScale: new THREE.Vector2(0.2, 0.2)
  });

  MaterialFactory.createPhongMaterial(resourceSymbols.materials.redPhong, {
    color: 0x882222,
    ambient: 0x882222,
    specular: 0xffeeee,
    perPixel: true,
    vertexColors: THREE.FaceColors
  });

  MaterialFactory.createPhongMaterial(resourceSymbols.materials.pureWhite, {
    color: 0xffffff,
    vertexColors: THREE.VertexColors,
    shininess: 0
  });

  MaterialFactory.createSphericalMaterial(resourceSymbols.materials.sphericalBlack, {
    uniforms: {
      tMatCap: {value: TextureFactory.texture(resourceSymbols.textures.sphericalBlack)},
      tNormal: {value: TextureFactory.texture(resourceSymbols.textures.normalBumps)},
      useNormal: {value: 1}
    }
  });

  MaterialFactory.createSphericalMaterial(resourceSymbols.materials.darkMetal, {
    uniforms: {
      tMatCap: {value: TextureFactory.texture(resourceSymbols.textures.sphericalDarkMetalAntistrophy)},
      tNormal: {value: TextureFactory.texture(resourceSymbols.textures.normalSkin, {
        clone: true,
        overrides: {
          wrapS: THREE.RepeatWrapping,
          wrapT: THREE.RepeatWrapping
        }
      })},
      useNormal: {value: 1},
      repeat: {value: new THREE.Vector2(5, 5)}
    }
  });

  MaterialFactory.createSphericalMaterial(resourceSymbols.materials.chromeWalkway, {
    uniforms: {
      tMatCap: {value: TextureFactory.texture(resourceSymbols.textures.sphericalChromeRough)},
      tNormal: {value: TextureFactory.texture(resourceSymbols.textures.normalMetalWalkwayBumps, {
        clone: true,
        overrides: {
          wrapS: THREE.RepeatWrapping,
          wrapT: THREE.RepeatWrapping
        }
      })},
      useNormal: {value: 1},
      normalScale: {value: 0.3},
      repeat: {value: new THREE.Vector2(5, 5)},
      useRim: {value: 1},
      rimPower: {value: 2.5}
    }
  });

  MaterialFactory.createSphericalMaterial(resourceSymbols.materials.organicGreen, {
    uniforms: {
      tMatCap: {value: TextureFactory.texture(resourceSymbols.textures.sphericalMatball03)},
      tNormal: {value: TextureFactory.texture(resourceSymbols.textures.normalSkin)},
      useNormal: {value: 1},
      useRim: {value: 1},
      rimPower: {value: 2.5}
    }
  });
}

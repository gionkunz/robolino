import THREE from '../three';
import Map from 'core-js/es6/map';
import MaterialFactory from '../engine/material-factory';

const models = new Map();
const loader = new THREE.ColladaLoader();
loader.options.convertUpAxis = true;

const objectTypeFilter = [
  THREE.Mesh.prototype,
  THREE.SkinnedMesh.prototype,
  THREE.Bone.prototype,
  THREE.Group.prototype,
  THREE.Object3D.prototype
];

export default class ModelLoader {
  static model(key) {
    return models.get(key);
  }

  static loadModel(key, url, options) {
    return new Promise((resolve) => {
      loader.load(url, (collada) => {
        const model = {
          group: collada.scene,
          animations: []
        };

        collada.scene.traverse((child) => {
          if (objectTypeFilter.indexOf(Object.getPrototypeOf(child)) !== -1) {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              child.geometry.computeTangents();

              if (options.materials && child.material && options.materials[child.material.name]) {
                // We found a material mapping so we will replace the material using the material factory
                const materialKey = options.materials[child.material.name];
                const material = MaterialFactory.material(materialKey);
                material.needsUpdate = true;
                child.material = material;
              }

              if (child.geometry.animation) {
                model.animations.push(new THREE.Animation(model.mesh, model.mesh.geometry.animation));
              }
            }
          } else {
            // TODO: Also remove empty wrappers
            child.parent.remove(child);
          }
        });

        models.set(key, model);
        resolve(model);
      });
    });
  }
}

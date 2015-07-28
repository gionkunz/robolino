import THREE from '../three';
import Map from 'core-js/es6/map';
import MaterialFactory from './material-factory';

const geometries = new Map();

export default class MeshFactory {
  static geometry(key) {
    return geometries.get(key);
  }

  static createMesh(geometry, material, options = {}) {
    geometry = geometry instanceof THREE.Geometry ? geometry : geometries.get(geometry);
    if (options.cloneGeometry) {
      geometry = geometry.clone();
      geometry.needsUpdate = true;
    }

    geometry.verticesNeedUpdate = true;
    geometry.normalsNeedUpdate = true;
    geometry.uvsNeedUpdate = true;

    if (options.computeFaceNormals) {
      geometry.computeFaceNormals();
    }
    if (options.computeVertexNormals) {
      geometry.computeVertexNormals();
    }
    if (options.computeMorphNormals) {
      geometry.computeMorphNormals();
    }
    if (options.computeTangents) {
      geometry.computeTangents();
    }

    material = material instanceof THREE.Material ? material : MaterialFactory.material(material);
    if (options.cloneMaterial) {
      material = material.clone();
      material.needsUpdate = true;
    }

    return new THREE.Mesh(geometry, material);
  }
}

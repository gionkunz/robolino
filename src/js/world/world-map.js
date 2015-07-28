import THREE from '../three';
import MeshFactory from '../engine/mesh-factory';
import resourceSymbols from '../resource-symbols';

export default class WorldMap {
  constructor(renderingEngine, blockSize) {
    this.renderingEngine = renderingEngine;
    this.blockSize = blockSize;

    this.geometries = {
      block: new THREE.BoxGeometry(blockSize, blockSize, blockSize, 10, 10, 10),
      ground: new THREE.PlaneGeometry(2000, 2000)
    };

    let ground = MeshFactory.createMesh(this.geometries.ground, resourceSymbols.materials.ground, {
      computeTangents: true
    });
    ground.receiveShadow = true;
    ground.rotation.x = -Math.PI / 2;
    this.renderingEngine.scene.add(ground);

    this.materialNames = {
      '1': resourceSymbols.materials.grayMatter,
      '2': resourceSymbols.materials.redPhong,
      '3': resourceSymbols.materials.pureWhite,
      '4': resourceSymbols.materials.sphericalBlack
    };

    this.mapData = [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 2, 0, 0, 1],
      [1, 0, 2, 0, 0, 3, 0, 1],
      [1, 0, 1, 0, 4, 2, 0, 1],
      [1, 0, 1, 2, 0, 0, 0, 1],
      [1, 0, 1, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1]
    ];

    this.mapMeshes = [];

    this.mapData.forEach((row, rowIndex) => {
      row.forEach((field, fieldIndex) => {
        if (field !== 0) {
          let block = MeshFactory.createMesh(this.geometries.block, this.materialNames[field], {
            computeTangents: true,
            computeMorphNormals: true,
            computeFaceNormals: true
          });
          block.castShadow = true;
          block.receiveShadow = true;
          block.position.set(
            (fieldIndex - row.length / 2) * this.blockSize * 4,
            blockSize / 2 - 0.5,
            (rowIndex - this.mapData.length / 2) * this.blockSize * 4
          );

          this.renderingEngine.scene.add(block);
          this.mapMeshes.push(block);
        }
      });
    });
  }
}

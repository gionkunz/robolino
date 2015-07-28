import THREE from '../three';
import Map from 'core-js/es6/map';
import * as ImageUtilities from '../core/image-utilities';
import extend from 'extend';

const textures = new Map();

export default class TextureFactory {
  static texture(key, options) {
    let texture;

    if (options) {
      texture = options.clone ? textures.get(key).clone() : textures.get(key);
      texture.needsUpdate = true;

      if (options.overrides) {
        extend(true, texture, options.overrides);
      }
    } else {
      texture = textures.get(key);
    }

    return texture;
  }

  static loadTexture(key, url, options = {}) {
    return ImageUtilities.loadImageFromUrl(url)
      .then((image) => options.powerOfTwo === false ? image : ImageUtilities.convertImageToPowerOfTwo(image))
      .then((image) => {
        const texture = new THREE.Texture(image);
        texture.needsUpdate = true;
        textures.set(key, texture);
        return texture;
      });
  }
}

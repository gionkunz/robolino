import THREE from '../three';

import extend from 'extend';

import WAGNER from 'spite/Wagner';
import 'spite/Wagner/Wagner.base';

import resourceSymbols from '../resource-symbols';
import MaterialFactory from './material-factory';

WAGNER.vertexShadersPath = './assets/shaders/vertex';
WAGNER.fragmentShadersPath = './assets/shaders/fragment';
WAGNER.assetsPath = './assets';

export const features = {
  antiAliasing: 'antiAliasing',
  depthOfField: 'depthOfField',
  bloom: 'bloom',
  glow: 'glow',
  dirt: 'dirt'
};

const defaultFeatureSettings = {
  [features.antiAliasing]: true,
  [features.glow]: true,
  [features.depthOfField]: true,
  [features.bloom]: true,
  [features.dirt]: true
};

export default class RenderingEngine {
  constructor(container, timeMachine, featureSettings) {
    this.container = container;
    this.timeMachine = timeMachine;
    this.featureSettings = extend({}, defaultFeatureSettings, featureSettings);

    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      preserveDrawingBuffer: true
    });

    this.fov = 50;

    this.cameraNear = 1;
    this.cameraFar = 10000;

    this.clearColor = 0x030303;

    this.timeFactor = 0.1;

    this.width = container.offsetWidth;
    this.height = container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(this.clearColor, 0);
    this.renderer.autoClearColor = true;

    this.renderer.shadowMapType = THREE.PCFShadowMap;
    this.renderer.shadowMapEnabled = true;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(this.clearColor, 1, 1500);

    this.camera = new THREE.PerspectiveCamera(this.fov, this.width / this.height, this.cameraNear, this.cameraFar);
    this.camera.position.set(0, 50, 150);
    this.camera.lookAt(this.scene.position);

    this.clock = new THREE.Clock();

    this.controls = new THREE.TrackballControls(this.camera);
    this.controls.rotateSpeed = 2.0;
    this.controls.zoomSpeed = 2;
    this.controls.panSpeed = 1;
    this.controls.noZoom = false;
    this.controls.noPan = false;
    this.controls.staticMoving = true;
    this.controls.dynamicDampingFactor = 0.15;

    this.createLights();
  }

  createLights() {
    this.ambient = new THREE.AmbientLight(0x444444);
    this.scene.add(this.ambient);

    this.light1 = new THREE.SpotLight(0xffffff, 1, 0, Math.PI / 2, 1);
    this.light1.position.set(300, 1000, -800);
    this.light1.target.position.set(0, 0, 0);
    this.light1.castShadow = true;

    this.light1.shadowMapWidth = 4096;
    this.light1.shadowMapHeight = 4096;

    this.light1.shadowCameraNear = 100;
    this.light1.shadowCameraFar = 2000;
    this.light1.shadowCameraFov = 35;
    this.light1.shadowDarkness = 0.2;
    this.scene.add(this.light1);
  }

  initialize() {
    this.initializeDepth();
    this.initializeComposer();
    this.initializePostEffects();
    this.initializeGlow();

    this.container.appendChild(this.renderer.domElement);
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
    this.onWindowResize();
  }

  initializeDepth() {
    this.depth = {
      material: MaterialFactory.material(resourceSymbols.materials.depthShader),
      texture: null
    };
  }

  initializeGlow() {
    this.glow = {
      material: MaterialFactory.material(resourceSymbols.materials.vertexColor),
      composer: new WAGNER.Composer(this.renderer, {
        useRGBA: false
      }),
      blurPass: new WAGNER.FullBoxBlurPass(),
      texture: null
    };
    this.glow.composer.setSize(this.width, this.height);
  }

  initializeComposer() {
    this.composer = new WAGNER.Composer(this.renderer, {
      useRGBA: false
    });
    this.composer.setSize(this.width, this.height);
    this.passes = {};
  }

  initializePostEffects() {
    this.passes.fxaaPass = new WAGNER.FXAAPass();

    const glowBlendPass = new WAGNER.BlendPass();
    glowBlendPass.params.mode = WAGNER.BlendMode.Screen;
    this.passes.glowBlendPass = glowBlendPass;

    const multiPassBloomPass = new WAGNER.MultiPassBloomPass();
    multiPassBloomPass.params.blurAmount = 2;
    multiPassBloomPass.params.blendMode = WAGNER.BlendMode.Screen;
    multiPassBloomPass.blendPass.params.opacity = 0.3;
    this.passes.multiPassBloomPass = multiPassBloomPass;

    const guidedFullBoxBlurPass = new WAGNER.GuidedFullBoxBlurPass();
    guidedFullBoxBlurPass.params.amount = 10;
    guidedFullBoxBlurPass.params.invertBiasMap = true;
    this.passes.guidedFullBoxBlurPass = guidedFullBoxBlurPass;

    const dirtPass = new WAGNER.DirtPass();
    dirtPass.params.blendMode = WAGNER.BlendMode.Screen;
    dirtPass.blendPass.params.opacity = 0.2;
    this.passes.dirtPass = dirtPass;
  }

  render() {
    this.lastTimeDelta = this.clock.getDelta();
    THREE.AnimationHandler.update(this.lastTimeDelta * this.timeMachine.timeFactor);
    this.controls.update(this.lastTimeDelta * this.timeMachine.timeFactor);

    this.renderer.autoClearColor = true;
    this.composer.reset();

    if (this.featureSettings[features.depthOfField]) {
      this.renderDepth();
    }

    if (this.featureSettings[features.glow]) {
      this.renderGlow();
    }

    this.composer.render(this.scene, this.camera);

    if (this.featureSettings[features.glow]) {
      this.composer.pass(this.passes.glowBlendPass);
      this.composer.pass(this.passes.glowBlendPass);
      this.composer.pass(this.passes.glowBlendPass);
    }

    if (this.featureSettings[features.bloom]) {
      this.composer.pass(this.passes.multiPassBloomPass);
    }

    if (this.featureSettings[features.depthOfField]) {
      this.composer.pass(this.passes.guidedFullBoxBlurPass);
    }

    if (this.featureSettings[features.dirt]) {
      this.composer.pass(this.passes.dirtPass);
    }

    if (this.featureSettings[features.antiAliasing]) {
      this.composer.pass(this.passes.fxaaPass);
    }

    this.composer.toScreen();

    window.requestAnimationFrame(this.render.bind(this));
  }

  renderDepth() {
    this.scene.overrideMaterial = this.depth.material;
    this.composer.render(this.scene, this.camera, null, this.depth.texture);
    this.passes.guidedFullBoxBlurPass.params.tBias = this.depth.texture;
    this.scene.overrideMaterial = null;
  }

  renderGlow() {
    this.scene.overrideMaterial = this.glow.material;
    this.composer.render(this.scene, this.camera, null, this.glow.texture);

    this.glow.composer.reset();
    this.glow.composer.setSource(this.glow.texture);
    this.glow.blurPass.params.amount = 1;
    this.glow.composer.pass(this.glow.blurPass);
    this.glow.blurPass.params.amount = 2;
    this.glow.composer.pass(this.glow.blurPass);
    this.glow.composer.toTexture(this.glow.texture);

    this.passes.glowBlendPass.params.tInput2 = this.glow.texture;
    this.scene.overrideMaterial = null;
  }

  addMesh(mesh) {
    this.scene.add(mesh);
  }

  setFeature(feature, enabled) {
    this.featureSettings[feature] = enabled;
  }

  isFeatureEnabled(feature) {
    return this.featureSettings[feature];
  }

  onWindowResize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    this.renderer.setSize(this.width, this.height);

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.composer.setSize(this.width, this.height);

    this.glow.composer.setSize(this.width, this.height);
    this.glow.texture = WAGNER.Pass.prototype.getOfflineTexture(this.width, this.height, false);
    this.depth.texture = WAGNER.Pass.prototype.getOfflineTexture(this.width, this.height, false);

    this.controls.handleResize();
  }
}

import THREE from '../three';
import Map from 'core-js/es6/map';

import WAGNER from 'spite/Wagner';
import 'spite/Wagner/Wagner.base';
import ShaderLoader from 'spite/Wagner/ShaderLoader';

import resourceSymbols from '../resource-symbols';
import TextureFactory from './texture-factory';

import GlowMaterial from './glow-material';

WAGNER.vertexShadersPath = './assets/shaders/vertex';
WAGNER.fragmentShadersPath = './assets/shaders/fragment';
WAGNER.assetsPath = './assets';

export default class RenderingEngine {
  constructor(container, timeMachine) {
    this.container = container;
    this.timeMachine = timeMachine;

    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      preserveDrawingBuffer: true
    });

    this.fov = 35;

    this.cameraNear = 1;
    this.cameraFar = 10000;
    this.depthNear = 10;
    this.depthFar = 600;

    this.timeFactor = 0.1;

    this.width = container.offsetWidth;
    this.height = container.offsetHeight;
    this.renderer.shadowMapType = THREE.PCFShadowMap;
    this.renderer.shadowMapEnabled = true;
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.autoClearColor = true;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x000000, 1, 1500);

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
    this.initializeDepthData();
    this.initializeComposer();
    this.initializePostEffects();
    //this.initializeGlow();

    container.appendChild(this.renderer.domElement);
    window.addEventListener('resize', this.onWindowResize.bind(this), false);
    this.onWindowResize();
  }

  render() {
    const delta = this.clock.getDelta();
    THREE.AnimationHandler.update(delta * this.timeMachine.timeFactor);

    this.renderer.autoClearColor = true;
    this.composer.reset();

    this.scene.overrideMaterial = this.depthMaterial;
    this.composer.render(this.scene, this.camera, null, this.depthTexture);

    if (this.passes.has('guidedFullBoxBlurPass')) {
      this.passes.get('guidedFullBoxBlurPass').params.tBias = this.depthTexture;
    }

    if (this.passes.has('ssaoPass')) {
      this.passes.get('ssaoPass').params.texture = this.depthTexture;
    }

    this.scene.overrideMaterial = null;

    this.composer.render(this.scene, this.camera);
    for (let pass of this.passes.values()) {
      this.composer.pass(pass);
    }

    this.composer.toScreen();
    this.controls.update(delta * this.timeMachine.timeFactor);
    //this.renderGlow();

    window.requestAnimationFrame(this.render.bind(this));
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

  initializeDepthData() {
    const shaderLoader = new ShaderLoader();
    this.depthMaterial = new THREE.MeshBasicMaterial();
    this.depthTexture = null;

    shaderLoader.add('depth-vs', WAGNER.vertexShadersPath + '/packed-depth-vs.glsl');
    shaderLoader.add('depth-fs', WAGNER.fragmentShadersPath + '/packed-depth-fs.glsl');
    shaderLoader.load();
    shaderLoader.onLoaded(function onLoaded() {
      this.depthMaterial = new THREE.ShaderMaterial({
        uniforms: {
          mNear: {type: 'f', value: this.depthNear},
          mFar: {type: 'f', value: this.depthFar}
        },
        vertexShader: shaderLoader.get('depth-vs'),
        fragmentShader: shaderLoader.get('depth-fs'),
        shading: THREE.SmoothShading
      });
    }.bind(this));
  }

  /*initializeGlow() {
   const glowCamera = new THREE.PerspectiveCamera(this.fov, this.width / this.height, this.cameraNear, this.cameraFar);
   glowCamera.position.set(0, 50, 150);
   glowCamera.lookAt(this.scene.position);

   this.glow = {
   composer: new WAGNER.Composer(this.renderer),
   scene: new THREE.Scene(),
   camera: glowCamera,
   texture: null,
   material: new THREE.MeshBasicMaterial()
   };

   this.glowBlendPass = new WAGNER.BlendPass();
   this.glow.scene.add(new THREE.AmbientLight(0xffffff));
   this.glow.scene.overrideMaterial = this.glow.material;
   this.glow.composer.setSize(this.width, this.height);
   }*/

  /*renderGlow() {
   this.glow.composer.reset();
   this.glow.composer.scene.children.forEach((child) => this.glow.composer.scene.remove(child));
   this.scene.traverse((child) => {
   if (child instanceof THREE.Mesh && child.material instanceof GlowMaterial) {
   this.glow.composer.scene.add(child.clone());
   }
   });

   this.renderer.render(this.glow.scene, this.glow.camera);
   }*/

  initializeComposer() {
    this.composer = new WAGNER.Composer(this.renderer, {
      useRGBA: false
    });
    this.composer.setSize(this.width, this.height);
    this.passes = new Map();
  }

  initializePostEffects() {
    const fxaaPass = new WAGNER.FXAAPass();
    this.passes.set('fxaaPass', fxaaPass);

    const multiPassBloomPass = new WAGNER.MultiPassBloomPass();
    multiPassBloomPass.params.blurAmount = 2;
    multiPassBloomPass.params.blendMode = WAGNER.BlendMode.Screen;
    multiPassBloomPass.blendPass.params.opacity = 0.5;
    this.passes.set('multiPassBloomPass', multiPassBloomPass);

    const guidedFullBoxBlurPass = new WAGNER.GuidedFullBoxBlurPass();
    guidedFullBoxBlurPass.params.amount = 10;
    guidedFullBoxBlurPass.params.invertBiasMap = true;
    this.passes.set('guidedFullBoxBlurPass', guidedFullBoxBlurPass);

    const dirtPass = new WAGNER.DirtPass();
    this.passes.set('dirtPass', dirtPass);
  }

  addMesh(mesh) {
    this.scene.add(mesh);
  }

  onWindowResize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    this.renderer.setSize(this.width, this.height);

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.composer.setSize(this.width, this.height);
    this.depthTexture = WAGNER.Pass.prototype.getOfflineTexture(this.width, this.height, true);
    //this.glow.texture = WAGNER.Pass.prototype.getOfflineTexture(this.width, this.height, true);

    this.controls.handleResize();
  }
}

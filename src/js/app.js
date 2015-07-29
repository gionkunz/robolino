import 'fetch';

import TimeMachine from './engine/time-machine';
import RenderingEngine, {features as renderingFeatures} from './engine/rendering-engine';
import WorldMap from './world/world-map';
import resourceSymbols from './resource-symbols';
import loadResources from './resources';
import ModelFactory from './engine/model-factory';

export const timeMachine = new TimeMachine(0.5);
export const renderingEngine = new RenderingEngine(document.querySelector('.l-container__intrinsic'), timeMachine);

export const resourceLoader = loadResources().then(() => {
  renderingEngine.initialize();
  new WorldMap(renderingEngine, 10);

  const model0 = ModelFactory.model(resourceSymbols.models.glowMesh).group.clone();
  model0.needsUpdate = true;
  model0.position.set(-30, 20, 0);
  model0.rotateZ(45);
  model0.scale.set(4, 4, 4);
  renderingEngine.addMesh(model0);

  const model1 = ModelFactory.model(resourceSymbols.models.cube).group.clone();
  model1.needsUpdate = true;
  model1.position.set(-15, 20, 0);
  model1.scale.set(4, 4, 4);
  renderingEngine.addMesh(model1);

  const model2 = ModelFactory.model(resourceSymbols.models.suzanne).group.clone();
  model2.needsUpdate = true;
  model2.position.set(0, 20, 0);
  model2.scale.set(4, 4, 4);
  renderingEngine.addMesh(model2);

  const model3 = ModelFactory.model(resourceSymbols.models.glowSphere).group.clone();
  model3.needsUpdate = true;
  model3.position.set(15, 20, 0);
  model3.scale.set(4, 4, 4);
  renderingEngine.addMesh(model3);

  timeMachine.eventEmitter.on('tick', () => {
    model0.rotateZ(-0.02);
    model1.rotateY(0.1);
    model2.rotateY(0.05);
    model3.rotateY(-0.08);
  });

  document.addEventListener('click', (event) => {
    if (!event.target.matches('[robo-toggle-feature]')) {
      return;
    }

    const featureName = event.target.getAttribute('robo-toggle-feature');
    const enabled = renderingEngine.isFeatureEnabled(renderingFeatures[featureName]);
    renderingEngine.setFeature(featureName, !enabled);
  });

  const fpsNumberElement = document.querySelector('.fps__number');

  setInterval(() => {
    fpsNumberElement.innerHTML = '' + Math.round(1 / renderingEngine.lastTimeDelta);
  }, 300);

  renderingEngine.render();
});

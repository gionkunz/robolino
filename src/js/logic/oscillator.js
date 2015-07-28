import {timeMachine} from '../app';
import Input from './input';
import Output from './output';
import {nthProxy} from '../core/event-emitter';
import DataValue from './data-value';

export default class Oscillator {
  constructor(options = {}) {
    this.options = options;
    this.phase = 0;
    this.active = new Input();
    this.output = new Output();

    timeMachine.eventEmitter.on('tick', nthProxy(options.rate || 1).proxy(this.step.bind(this)));
  }

  step() {
    const sequence = this.options.sequence || [1];
    this.output.send(new DataValue(this, sequence[this.phase++ % sequence.length]));
  }
}

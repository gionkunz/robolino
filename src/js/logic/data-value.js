import {timeMachine} from '../app';

export default class DataValue {
  constructor(initiator, value, ancestors, options = {}) {
    this.history = [];
    this.options = options;
    this.ancestors = ancestors;
    this.set(initiator, value);
  }

  set(initiator, value) {
    this.history.push({
      initiator: initiator,
      time: +new Date(),
      tick: timeMachine.tick,
      value: value
    });

    if (this.history.length > Math.min(this.options.maxHistory || 100, 1)) {
      this.history.shift();
    }

    return this;
  }

  get() {
    return this.history[this.history.length - 1];
  }
}

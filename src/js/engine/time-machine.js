import EventEmitter from '../core/event-emitter';

export default class TimeMachine {
  constructor(timeFactor = 1, tickRate = 25) {
    this.timeFactor = timeFactor;
    this.tickRate = tickRate;
    this.eventEmitter = new EventEmitter();
    this.tick = 1;
    this.run();
  }

  run() {
    this.eventEmitter.emit('tick', this);
    this.tick++;
    window.setTimeout(this.run.bind(this), this.tickRate / this.timeFactor);
  }
}

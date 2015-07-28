import EventEmitter from '../core/event-emitter';
import DataValue from './data-value';

export default class Input {
  constructor(options = {}) {
    this.connections = [];
    this.lastData = new DataValue(this, undefined);
    this.readCount = 0;
    this.eventEmitter = options.eventEmitter || new EventEmitter();
  }

  receive(data) {
    this.lastData = data;
    this.readCount++;
    this.eventEmitter.emit('data', data);
  }
}

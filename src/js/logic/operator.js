import Map from 'core-js/es6/map';
import Input from './input';
import Output from './output';
import DataValue from './data-value';

export const AND = Symbol();
export const OR = Symbol();
export const XOR = Symbol();

const strategies = new Map();
strategies.set(AND, (a, b) => !!a && !!b);
strategies.set(OR, (a, b) => !!a || !!b);
strategies.set(XOR, (a, b) => !a !== !b);

export default class Operator {
  constructor(options = {}) {
    this.connections = [];
    this.options = options;
    this.active = new Input();
    this.input1 = new Input();
    this.input2 = new Input();
    this.output = new Output();

    this.input1.eventEmitter.on('data', this.data.bind(this));
    this.input2.eventEmitter.on('data', this.data.bind(this));
  }

  data() {
    const state = strategies.get(this.options.type)(this.input1.lastData.get().value, this.input2.lastData.get().value);
    this.output.send(new DataValue(this, +state, [this.input1.lastData, this.input2.lastData]));
  }
}

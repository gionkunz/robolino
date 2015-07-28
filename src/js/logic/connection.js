import DataValue from './data-value';

export default class Connection {
  constructor(output, input) {
    this.output = output;
    this.input = input;
    this.lastData = new DataValue(this, undefined);

    output.connections.push(this);
    input.connections.push(this);
  }

  send(data) {
    if (data.get() !== this.lastData.get()) {
      this.input.receive(data);
    }
    this.lastData = data;
  }

  disconnect() {
    this.output.connections.splice(this.output.connections.indexOf(this), 1);
    this.input.connections.splice(this.input.connections.indexOf(this), 1);
    // As input gets disconnected we send a new value with undefined
    this.input.receive(new DataValue(this, undefined));
  }
}

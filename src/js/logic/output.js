export default class Output {
  constructor() {
    this.connections = [];
    this.writeCount = 0;
  }

  send(data) {
    this.writeCount++;
    this.connections.forEach((connection) => connection.send(data));
  }
}

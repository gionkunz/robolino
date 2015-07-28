import Input from './input';
import times from '../core/times';

function formatDataValueHistory(dataValue, level = 0) {
  let history = dataValue.history.map((data) => `${data.initiator.constructor.name}[${data.tick}] {${data.value}}`).join(' → ');

  if (dataValue.ancestors) {
    history = history + '\n' + dataValue.ancestors.map((ancestorDataValue) => formatDataValueHistory(ancestorDataValue, level + 1)).join('\n');
  }

  return times(level).map(() => '\t').join('') + history;
}

export default class Logger {
  constructor() {
    this.active = new Input();
    this.input = new Input();
    this.input.eventEmitter.on('data', (data) => {
      console.log(formatDataValueHistory(data));
    });
  }
}

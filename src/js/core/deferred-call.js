import flattenObject from './flatten-object';

export default class DeferredCall {
  constructor(fn) {
    this.fn = fn;
  }

  resolve() {
    return this.fn();
  }

  static resolveDeferredCalls(object) {
    flattenObject(object)
      .filter((property) => property.value instanceof DeferredCall)
      .forEach((property) => property.obj[property.key] = property.value.resolve());
    return object;
  }
}

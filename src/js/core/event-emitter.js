import Map from 'core-js/es6/map';

/**
 * A small proxy for filtering only every nth event.
 *
 * @param n Every nth time the proxy will pass through
 * @returns {proxy: Function}
 */
export function nthProxy(n) {
  let counter = 0;

  return {
    proxy(handler) {
      return function nth(data) {
        if (++counter % n === 0) {
          handler(data);
        }
      };
    }
  };
}

/**
 * A very basic event module that helps to generate and catch events.
 *
 * @module EventEmitter
 */
export default class EventEmitter {
  constructor() {
    this.handlers = new Map();
  }

  /**
   * Add an event handler for a specific event
   *
   * @param {String} event The event name
   * @param {Function} handler A event handler function
   */
  on(event, handler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event).push(handler);
  }

  /**
   * Remove an event handler of a specific event name or remove all event handlers for a specific event.
   *
   * @param {String} event The event name where a specific or all handlers should be removed
   * @param {Function} [handler] An optional event handler function. If specified only this specific handler will be removed and otherwise all handlers are removed.
   */
  off(event, handler) {
    // Only do something if there are event handlers with this name existing
    if (this.handlers.has(event)) {
      // If handler is set we will look for a specific handler and only remove this
      if (handler) {
        const handlerList = this.handlers.get(event);
        handlerList.splice(handlerList.indexOf(handler), 1);
        if (handlerList.length === 0) {
          this.handlers.delete(event);
        }
      } else {
        // If no handler is specified we remove all handlers for this event
        this.handlers.delete(event);
      }
    }
  }

  /**
   * Use this function to emit an event. All handlers that are listening for this event will be triggered with the data parameter.
   *
   * @param {String} event The event name that should be triggered
   * @param {*} data Arbitrary data that will be passed to the event handler callback functions
   */
  emit(event, data) {
    // Only do something if there are event handlers with this name existing
    if (this.handlers.has(event)) {
      this.handlers.get(event).forEach((handler) => handler(data));
    }

    // Emit event to star event handlers
    if (this.handlers.has('*')) {
      this.handlers.get('*').forEach((starHandler) => starHandler(event, data));
    }
  }
}

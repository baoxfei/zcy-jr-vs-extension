import { EventEmitter } from "node:events";

class EventBus extends EventEmitter {
  public events: Map<string, ((...args: any[]) => void)[]>;
  constructor() {
    super();
    this.events = new Map();
  }

  public on(eventName: string, callback: any) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }
    const callbacks = this.events.get(eventName)!;
    callbacks.push(callback);
    this.events.set(eventName, callbacks);
    return this;
  }

  public emit(eventName: string, ...args: any[]) {
    try {
      const callbacks = this.events.get(eventName) || [];
      for (const callback of callbacks) {
        callback(...args);
      }
      return true;
    } catch (error) {
      return false;
    }
  }
  delete(eventName: string) {
   return  this.events.delete(eventName);
  }
}

const eventBus = new EventBus();

export default eventBus;
import { EventEmitter } from "node:events";


// 事件类型
enum EventType {
  PublicSnippet = 'publicSnippet',
  PersonalSnippet = 'personalSnippet',
  sendMessageToWebview = 'sendMessageToWebview',
  GenerateSnippetWebview = 'generateSnippetWebview'
}

class EventBus extends EventEmitter {
  public events: Map<EventType, ((...args: any[]) => void)[]>;
  constructor() {
    super();
    this.events = new Map();
  }

  public on(eventName: EventType, callback: any) {
    if ([EventType.PersonalSnippet, EventType.PublicSnippet].includes(eventName)) {
      this.events.set(eventName, [callback])
      return this;
    }
    if (!this.events.has(eventName)) {
      this.events.set(eventName, []);
    }

    const callbacks = this.events.get(eventName)!;
    callbacks.push(callback);
    this.events.set(eventName, callbacks);
    return this;
  }

  public emit(eventName: EventType, ...args: any[]) {
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
  delete(eventName: EventType) {
   return  this.events.delete(eventName);
  }
}

const eventBus = new EventBus();

export {
  eventBus,
  EventType
}

export default eventBus;
/**
 * Event bus with a listener registration race.
 *
 * BUG: init() fires the 'ready' event, but subscribers register after init()
 * is called in the typical usage pattern (init → subscribe → use). Under
 * normal execution, init() is essentially synchronous (no real async work),
 * so the event fires synchronously in the same microtask as subscribe().
 * Under delay injection, init() yields, the 'ready' event fires, and then
 * subscribe() runs — but the listener missed the event.
 *
 * This is the classic "emit before listen" race condition.
 */

export class EventBus {
  constructor() {
    this.listeners = new Map();
    this.history = [];
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  async emit(event, data) {
    this.history.push({ event, data });
    const handlers = this.listeners.get(event) || [];
    for (const handler of handlers) {
      await handler(data);
    }
  }

  getHistory() {
    return [...this.history];
  }
}

export class App {
  constructor() {
    this.bus = new EventBus();
    this.state = { initialized: false };
  }

  async init() {
    await this._loadConfig();

    // BUG: emits 'ready' immediately — any listener registered after init()
    // is called (but before it's awaited) will miss this event
    await this.bus.emit('ready', { status: 'ok' });
  }

  async _loadConfig() {
    this.state.config = { debug: false };
  }

  onReady(callback) {
    this.bus.on('ready', callback);
  }
}

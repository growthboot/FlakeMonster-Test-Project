import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { App } from '../src/event-bus.js';

describe('App event bus', () => {
  it('fires ready event to registered listeners', async () => {
    const app = new App();

    let readyData = null;

    // BUG: Register listener AFTER calling init() but before awaiting it.
    // Under normal execution, init() hasn't yielded yet when onReady runs,
    // so the listener is registered before the 'ready' event fires.
    // Under delay injection, init() yields at _loadConfig(), the event fires,
    // and onReady() registers too late.
    const initPromise = app.init();
    app.onReady((data) => { readyData = data; });
    await initPromise;

    assert.notStrictEqual(readyData, null, 'ready listener should have been called');
    assert.strictEqual(readyData.status, 'ok');
  });

  it('records ready event in history', async () => {
    const app = new App();
    const initPromise = app.init();
    await initPromise;

    const history = app.bus.getHistory();
    assert.strictEqual(history.length, 1);
    assert.strictEqual(history[0].event, 'ready');
  });

  it('sets config during init', async () => {
    const app = new App();
    await app.init();

    assert.deepStrictEqual(app.state.config, { debug: false });
  });
});

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Cache } from '../src/cache.js';

describe('Cache', () => {
  it('warm-up populates all keys before read', async () => {
    const cache = new Cache();
    const fetchFn = async (key) => `value-${key}`;

    // warmUp fires _populateKey for each key without awaiting.
    // Under normal execution, the microtasks complete before the next line runs.
    // Under delay injection, warmUp returns before writes finish.
    await cache.warmUp(['a', 'b', 'c'], fetchFn);

    assert.strictEqual(cache.size, 3, `expected 3 entries, got ${cache.size}`);
    assert.strictEqual(cache.get('a'), 'value-a');
    assert.strictEqual(cache.get('b'), 'value-b');
    assert.strictEqual(cache.get('c'), 'value-c');
  });

  it('warm-up fetches each key exactly once', async () => {
    const cache = new Cache();
    const fetchFn = async (key) => key.toUpperCase();

    await cache.warmUp(['x', 'y'], fetchFn);

    assert.strictEqual(cache.fetchCount, 2, `expected 2 fetches, got ${cache.fetchCount}`);
  });

  it('has() returns true for warmed keys', async () => {
    const cache = new Cache();
    const fetchFn = async (key) => 42;

    await cache.warmUp(['test-key'], fetchFn);

    assert.strictEqual(cache.has('test-key'), true);
    assert.strictEqual(cache.has('missing'), false);
  });
});

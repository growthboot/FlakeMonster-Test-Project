/**
 * Cache with an unawaited warm-up race.
 *
 * BUG: warmUp() iterates over keys and calls _populateKey for each,
 * but doesn't await the individual calls — it fires them all and returns.
 * Under normal execution, the microtasks complete before anything else runs,
 * so the cache is fully populated by the time the caller reads from it.
 * Under delay injection, warmUp() returns before all entries are written,
 * and subsequent reads see cache misses.
 */

export class Cache {
  constructor() {
    this.store = new Map();
    this.fetchCount = 0;
  }

  async warmUp(keys, fetchFn) {
    for (const key of keys) {
      // BUG: not awaited — fires concurrently, returns before writes complete
      this._populateKey(key, fetchFn);
    }
  }

  async _populateKey(key, fetchFn) {
    if (this.store.has(key)) return;
    this.fetchCount++;
    const value = await fetchFn(key);
    this.store.set(key, value);
  }

  get(key) {
    return this.store.get(key);
  }

  has(key) {
    return this.store.has(key);
  }

  get size() {
    return this.store.size;
  }
}

/**
 * Task queue with a deferred binding gap.
 *
 * BUG: start() kicks off _processLoop() without awaiting it, then immediately
 * sets this.running = true. Under normal execution the first task is already
 * being processed by the time anyone checks this.running. Under async delay,
 * _processLoop() hasn't started yet when this.running is read, causing
 * enqueue() to push items that never get processed because the loop condition
 * was checked before items arrived.
 */

export class TaskQueue {
  constructor() {
    this.queue = [];
    this.results = [];
    this.running = false;
    this._done = null;
    this.finished = new Promise((resolve) => { this._done = resolve; });
  }

  async start() {
    this.running = true;

    // BUG: not awaited — _processLoop runs concurrently
    this._processLoop();
  }

  async enqueue(task) {
    this.queue.push(task);
  }

  async _processLoop() {
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      const result = await this._execute(task);
      this.results.push(result);
    }
    this.running = false;
    this._done();
  }

  async _execute(task) {
    return { name: task.name, output: task.name.toUpperCase(), status: 'done' };
  }

  getResults() {
    return [...this.results];
  }
}

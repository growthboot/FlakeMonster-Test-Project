import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TaskQueue } from '../src/task-queue.js';

describe('TaskQueue', () => {
  it('processes all enqueued tasks', async () => {
    const q = new TaskQueue();

    // Enqueue before starting — these are in the queue when _processLoop begins
    await q.enqueue({ name: 'task-a' });
    await q.enqueue({ name: 'task-b' });
    await q.enqueue({ name: 'task-c' });

    await q.start();
    await q.finished;

    // Under normal execution, _processLoop processes all 3 synchronously.
    // Under delay injection, start() may yield before _processLoop drains the queue,
    // so the loop exits early (queue appears empty when checked between delays).
    const results = q.getResults();
    assert.strictEqual(results.length, 3, `expected 3 results, got ${results.length}`);
    assert.deepStrictEqual(
      results.map(r => r.name),
      ['task-a', 'task-b', 'task-c']
    );
  });

  it('marks queue as not running after completion', async () => {
    const q = new TaskQueue();
    await q.enqueue({ name: 'only-task' });
    await q.start();
    await q.finished;

    assert.strictEqual(q.running, false);
  });

  it('produces correct output for each task', async () => {
    const q = new TaskQueue();
    await q.enqueue({ name: 'hello' });
    await q.start();
    await q.finished;

    const results = q.getResults();
    assert.strictEqual(results[0].output, 'HELLO');
    assert.strictEqual(results[0].status, 'done');
  });
});

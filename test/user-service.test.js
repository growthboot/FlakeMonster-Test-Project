import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { UserService } from '../src/user-service.js';

describe('UserService', () => {
  it('loads user with preferences', async () => {
    const svc = new UserService();
    await svc.loadUser(1);
    await svc.ready;

    // This passes normally because _loadPreferences completes as a microtask.
    // Under delay injection, ready resolves before preferences are set.
    assert.strictEqual(svc.user.name, 'Alice');
    assert.notStrictEqual(svc.preferences, null, 'preferences should be loaded');
    assert.strictEqual(svc.preferences.theme, 'dark');
  });

  it('displays name with locale', async () => {
    const svc = new UserService();
    await svc.loadUser(2);
    await svc.ready;

    // Depends on preferences being loaded before getDisplayName is called.
    const name = svc.getDisplayName();
    assert.strictEqual(name, 'Bob (fr-FR)');
  });

  it('handles missing user gracefully', async () => {
    const svc = new UserService();
    await svc.loadUser(999);
    await svc.ready;

    assert.strictEqual(svc.getDisplayName(), 'Anonymous');
  });
});

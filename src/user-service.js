/**
 * User service with a premature ready signal.
 *
 * BUG: loadUser() sets this.user and then calls _loadPreferences() without
 * awaiting it. Under normal execution _loadPreferences() completes near-instantly
 * (it's a microtask), so this.ready resolves with preferences populated.
 * Under any real async delay, this.ready resolves before preferences are set.
 */

const users = {
  1: { id: 1, name: 'Alice', email: 'alice@example.com' },
  2: { id: 2, name: 'Bob', email: 'bob@example.com' },
};

const preferences = {
  1: { theme: 'dark', locale: 'en-US' },
  2: { theme: 'light', locale: 'fr-FR' },
};

export class UserService {
  constructor() {
    this.user = null;
    this.preferences = null;
    this.ready = null;
  }

  async loadUser(id) {
    this.ready = new Promise(async (resolve) => {
      this.user = await this._fetchUser(id);

      // BUG: not awaited — _loadPreferences runs concurrently with ready resolving
      this._loadPreferences(id);

      resolve();
    });
  }

  async _fetchUser(id) {
    return users[id] || null;
  }

  async _loadPreferences(id) {
    this.preferences = await this._fetchPreferences(id);
  }

  async _fetchPreferences(id) {
    return preferences[id] || { theme: 'light', locale: 'en-US' };
  }

  getDisplayName() {
    if (!this.user) return 'Anonymous';
    const locale = this.preferences?.locale || 'en-US';
    return `${this.user.name} (${locale})`;
  }
}

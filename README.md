# FlakeMonster Test Project

A sample project with **intentionally flaky async code** for testing and demonstrating [FlakeMonster](https://github.com/growthboot/FlakeMonster).

All 12 tests pass under normal execution. Under FlakeMonster delay injection, hidden race conditions surface — tests that depended on "everything completing instantly" start failing.

## The Bugs

Each source module contains a realistic async race condition:

| Module | Bug | Pattern |
|--------|-----|---------|
| `user-service.js` | `_loadPreferences()` called without `await` inside `loadUser()` | Premature ready signal |
| `cache.js` | `warmUp()` fires `_populateKey()` without `await` | Unawaited fire-and-forget |
| `event-bus.js` | `init()` emits `'ready'` before listeners can register | Emit before listen |
| `task-queue.js` | `start()` fires `_processLoop()` without `await` | Deferred binding gap |

These are the same categories of bugs that FlakeMonster found in a real-world Playwright test suite (126 tests, 19 spec files). See the [FSCode case study](https://github.com/growthboot/FlakeMonster-Business).

## Try It

```bash
# Install
npm install

# Run tests normally — all 12 pass
npm test

# Run through FlakeMonster — race conditions surface
npx flake-monster test --cmd "node --test test/*.test.js" "src/**/*.js"
```

## GitHub Action

This repo includes a workflow (`.github/workflows/flake-check.yml`) that runs FlakeMonster on every PR using [FlakeMonster Action](https://github.com/growthboot/FlakeMonster-Action).

## License

MIT

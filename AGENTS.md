# Repository instructions

## Scope

Keep the local analyzer deterministic, private, and dependency-light. Do not add network calls, telemetry, log uploads, or LLM requests to the default analysis path.

## Before changing code

1. Read `docs/MVP-0.1.0.md` and keep the change inside the current scope.
2. Add or update a small log fixture when introducing a detection rule.
3. Prefer a specific pattern over a broad match that creates false positives.

## Verification

Run:

```bash
npm run check
npm test
npm pack --dry-run
```

## Compatibility

Treat the JSON report as a public interface. Keep `schemaVersion` and avoid breaking fields before a planned major release.

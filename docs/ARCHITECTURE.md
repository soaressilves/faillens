# Architecture

## Design goals

- Run locally with zero runtime dependencies.
- Produce deterministic output suitable for humans and automation.
- Keep input parsing separate from presentation.
- Never perform network requests in the core analyzer.
- Make every heuristic independently testable.

## Data flow

```text
file or stdin
    ↓
line normalization
    ↓
noise filtering
    ↓
signal classification and ranking
    ↓
primary failure + context + fingerprint
    ↓
text, Markdown, or JSON formatter
```

## Modules

- `src/patterns.js`: ordered detection and noise rules.
- `src/analyzer.js`: normalization, classification, ranking, and fingerprints.
- `src/formatter.js`: output formats without detection logic.
- `src/cli.js`: argument parsing and file/stdin handling.
- `bin/faillens.js`: executable entry point.

## Compatibility policy

The JSON output contains `schemaVersion`. Additive fields may be introduced in a minor version. Renaming or removing fields requires a major version.

## Future boundaries

GitHub Actions, hosted history, optional AI explanations, and dashboards must consume the core result. They must not add network behavior to the local analyzer implicitly.

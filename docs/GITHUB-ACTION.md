# GitHub Action

FailLens can analyze a saved CI log inside a GitHub Actions job. It runs locally on the runner, writes a compact job summary, and does not upload the log.

## Complete example

```yaml
name: Tests

on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7

      - uses: actions/setup-node@v6
        with:
          node-version: 22
          cache: npm

      - run: npm ci

      - name: Run tests and capture the log
        id: tests
        shell: bash
        run: npm test > test-output.log 2>&1

      - name: Analyze the test log
        id: faillens
        if: failure() && steps.tests.outcome == 'failure'
        uses: soaressilves/faillens@v0.2.0
        with:
          log-file: test-output.log
          context: "2"

      - name: Show detected category
        if: failure() && steps.faillens.outcome == 'success'
        env:
          FAILLENS_CATEGORY: ${{ steps.faillens.outputs.category }}
        run: echo "FailLens category: $FAILLENS_CATEGORY"
```

The explicit `failure()` condition lets FailLens run after the test command fails without masking that failure. Checking `steps.tests.outcome` prevents the Action from trying to read a missing log when an earlier step failed instead.

## Inputs

| Input | Required | Default | Description |
| --- | --- | --- | --- |
| `log-file` | Yes | - | Log path, absolute or relative to `GITHUB_WORKSPACE`. |
| `context` | No | `2` | Lines shown before and after the detected failure, from `0` to `20`. |
| `fail-on-detection` | No | `false` | Return exit code `1` when a relevant failure is detected. |

## Outputs

| Output | Description |
| --- | --- |
| `status` | `failure` when a relevant signal is detected, otherwise `unknown`. |
| `category` | Detected category, such as `test`, `compiler`, or `dependency`. |
| `confidence` | Detection confidence. |
| `fingerprint` | Stable fingerprint for grouping similar failures. |
| `line` | One-based source log line containing the detected failure. |

Outputs other than `status` are empty when the analysis is inconclusive.

## Enforcing a detected failure

Use `fail-on-detection` when the log comes from a step or external source that did not already fail the current job:

```yaml
- name: Analyze the build log
  uses: soaressilves/faillens@v0.2.0
  with:
    log-file: build.log
    fail-on-detection: "true"
```

Leave it at the default value, `false`, to report findings without changing the job result.

## Privacy and security

The Action has zero runtime dependencies and does not perform network requests. The report contains selected lines from the input log, so review logs for secrets before exposing job summaries in a public repository.

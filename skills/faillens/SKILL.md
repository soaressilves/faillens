---
name: faillens
description: Analyze CI, build, test, compiler, and command logs with the FailLens CLI to find the most actionable failure, reduce noise, extract nearby evidence, and group similar failures by fingerprint. Use when investigating a failed GitHub Actions job, a long terminal log, an exit-code wrapper error, a broken test or build, or when a user asks for the root cause of a log file before making a code change.
---

# FailLens

Use FailLens as the deterministic first pass over a failure log. Treat its result as a prioritized lead and confirm it against the repository before claiming a root cause.

## Analyze

1. Identify the log source. Prefer a local file or captured command output.
2. Check whether the log may contain credentials, tokens, private URLs, email addresses, or customer data. Keep the analysis local and redact sensitive content before quoting it.
3. From the FailLens repository, produce JSON:

```bash
node ./bin/faillens.js path/to/build.log --format json --context 3
```

Use an installed executable when available:

```bash
faillens path/to/build.log --format json --context 3
```

Analyze a command through stdin only when rerunning it is safe:

```bash
command-that-fails 2>&1 | faillens - --format json --context 3
```

Do not rerun deployment, migration, payment, deletion, or other state-changing commands merely to obtain a log.

## Interpret

- Read `primary.text`, `primary.category`, `primary.confidence`, and the surrounding `context`.
- Use `signals` to detect whether an earlier wrapper or a later specific error changes the diagnosis.
- Use `primary.fingerprint` only to group similar messages; do not treat matching fingerprints as proof that two incidents have the same cause.
- If `status` is `unknown`, say the analysis was inconclusive. Inspect the original log around failure boundaries instead of inventing a cause.

## Confirm

1. Locate the referenced file, test, dependency, or command in the repository.
2. Check the smallest relevant source or configuration diff.
3. Run the narrowest safe test or check that can reproduce the signal.
4. Separate evidence from inference in the conclusion.
5. Propose or implement a fix only when the user's request authorizes a change.

## Report

State:

1. The likely failure and its log line.
2. The evidence that supports it.
3. Whether it was reproduced or only inferred.
4. The next smallest verification or fix.

For a Pull Request comment, generate Markdown without exposing the entire log:

```bash
faillens path/to/build.log --format markdown --output faillens-report.md
```

Never publish a raw private log, and never upload log content to an AI or external service without explicit authorization.

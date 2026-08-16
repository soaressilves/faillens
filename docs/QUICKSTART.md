# FailLens quick start

FailLens finds the first relevant failure in noisy CI logs. Processing stays local: no account, API key, or log upload is required.

## Run the project

Use Node.js 20 or newer:

```powershell
npm test
npm run verify:package
node .\bin\faillens.js .\examples\github-actions-failure.log
node .\bin\faillens.js .\examples\typescript-failure.log --format json
```

Analyze another command through stdin in PowerShell:

```powershell
npm test 2>&1 | node .\bin\faillens.js -
```

## Interpret a result

- **Category:** likely failure type, such as test, compiler, or dependency.
- **Confidence:** strength of the matched pattern; it is not absolute certainty.
- **Fingerprint:** stable identifier for grouping similar failures.
- **Context:** nearby lines that help with investigation.

FailLens tells you where to start. Confirm the diagnosis by rerunning the narrowest relevant test or command.

The automated corpus currently includes sanitized examples from Jest, Pytest, TypeScript, Maven/Java, Rust, Go, .NET, Docker, npm, Node.js out-of-memory failures, ESLint, and GitHub Actions wrapper messages.

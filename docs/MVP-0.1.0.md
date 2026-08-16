# MVP 0.1.0

## Promise

Given a CI log, identify the most actionable early failure and return a compact report in one command.

## Included

- File and stdin input.
- ANSI, timestamp, and basic GitHub Actions cleanup.
- Test, compiler, dependency, runtime, command, and generic error patterns.
- Wrapper-error demotion.
- Configurable context lines.
- Text, Markdown, and JSON output.
- Stable failure fingerprint.
- Optional failure exit code.
- Node.js API and Agent Skill.

## Not included

- Remote API, database, dashboard, user accounts, or billing.
- Automatic log upload.
- GitHub App or GitHub Action packaging.
- LLM calls or generated fixes.
- Historical grouping or flaky-test detection.

## Release gate

- [x] Main path works from file and stdin.
- [x] Machine-readable JSON is versioned.
- [x] No runtime dependencies or network calls.
- [x] Automated tests cover core and CLI behavior.
- [ ] Test against a larger public fixture corpus.
- [ ] Validate installation from the packed npm artifact.
- [x] Publish the public GitHub repository.
- [ ] Record a short terminal demonstration.

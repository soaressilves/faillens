# FailLens

Find the first relevant failure in noisy CI logs — locally, deterministically, and without uploading your data.

> Project status: early MVP (`0.1.0`). The package has not been published to npm yet.

## Why FailLens?

CI logs often contain thousands of status lines, warnings, downloads, stack frames, and a final generic `exit code 1`. FailLens removes common noise, ranks actionable signals, and points to the most specific failure it can identify.

- No account or API key.
- No network requests or log uploads.
- Zero runtime dependencies.
- Text, Markdown, and stable JSON output.
- Works as a CLI and as an importable Node.js module.
- Includes an Agent Skill for coding agents.

## Try it locally

Requirements: Node.js 20 or newer.

```bash
git clone https://github.com/soaressilves/faillens.git
cd faillens
npm test
node ./bin/faillens.js ./examples/github-actions-failure.log
```

Expected result:

```text
FailLens
Status: FALHA ENCONTRADA
Categoria: test
Confiança: high

Causa provável — linha 5
AssertionError: expected status 200 but received 401
```

Analyze a command through stdin:

```bash
npm test 2>&1 | node ./bin/faillens.js -
```

Generate Markdown for a Pull Request comment:

```bash
node ./bin/faillens.js build.log --format markdown --output faillens-report.md
```

Generate machine-readable JSON:

```bash
node ./bin/faillens.js build.log --format json
```

Return exit code `1` when a failure is detected:

```bash
node ./bin/faillens.js build.log --fail-on-detection
```

Run `node ./bin/faillens.js --help` for every option.

## How the MVP works

1. Remove ANSI color sequences, timestamps, and CI annotations.
2. Ignore known low-value lines such as cache and download messages.
3. Detect test, compiler, dependency, runtime, command, and generic errors.
4. Prefer specific signals over wrapper messages such as `exit code 1`.
5. Return the relevant line, nearby context, confidence, and a stable fingerprint.

FailLens uses deterministic rules in `0.1.0`; it does not call an LLM. See [Architecture](./docs/ARCHITECTURE.md) and [MVP scope](./docs/MVP-0.1.0.md).

## Use from JavaScript

```js
import { analyzeLog } from "@soaressilves/faillens";

const result = analyzeLog(logText, { context: 3 });
console.log(result.primary);
```

## Agent Skill

The reusable skill lives at [`skills/faillens/SKILL.md`](./skills/faillens/SKILL.md). It tells compatible coding agents how to run FailLens, preserve privacy, interpret the report, and verify a suspected root cause.

## Limitations

- The current rules focus on common English CI messages.
- A detected line is a lead, not proof of the root cause.
- Multi-job log correlation and flaky-test history are not part of the local MVP.
- Logs can contain secrets; review them before sharing reports publicly.

## Contributing and security

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a Pull Request. Report security problems privately according to [SECURITY.md](./SECURITY.md).

## License

[MIT](./LICENSE) © 2026 Paulo Soares Silves.

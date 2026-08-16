# Contributing to FailLens

Thank you for helping make CI failures easier to understand.

## Before starting

- Search existing issues and Pull Requests.
- Open an issue before a large change or new integration.
- Keep changes focused on one problem.
- Never include private production logs, credentials, or personal data in fixtures.

Small pattern fixes and documentation improvements can go directly to a Pull Request.

## Local workflow

```bash
git switch main
git pull --ff-only
git switch -c fix/short-description
npm run check
npm test
```

Use a sanitized fixture in `examples/` or an inline string in `test/`. Then create a clear commit:

```bash
git add path/to/changed-files
git diff --staged
git commit -m "fix(analyzer): detect a specific failure pattern"
git push -u origin fix/short-description
```

## Pull Request checklist

- [ ] The change has one clear purpose.
- [ ] Tests reproduce the previous failure or protect the new behavior.
- [ ] `npm run check` and `npm test` pass.
- [ ] Documentation and examples were updated when behavior changed.
- [ ] Fixtures contain no secrets or identifying information.
- [ ] JSON output remains compatible or the breaking change is documented.

## Detection-rule guidelines

1. Prefer specific patterns with high confidence.
2. Add broad generic patterns only at a lower score.
3. Demote wrapper errors that merely repeat an exit status.
4. Test at least one true positive and one likely false positive.
5. Preserve the original useful text in the report.

By contributing, you agree that your contribution is licensed under the MIT License.

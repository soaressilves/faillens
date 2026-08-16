# Changelog

All notable changes to this project will be documented here. The format follows Keep a Changelog and versions follow Semantic Versioning.

## [Unreleased]

No changes yet.

## [0.2.0] - 2026-08-15

### Added

- Dependency-free GitHub Action running on Node.js 24.
- GitHub job summaries with the detected failure and nearby context.
- Action outputs for status, category, confidence, fingerprint, and line number.
- Optional `fail-on-detection` enforcement for CI workflows.
- Local Action tests and a self-testing GitHub Actions workflow.

### Changed

- Package verification now confirms that the GitHub Action files are included in the npm artifact.

## [0.1.0] - 2026-08-15

### Added

- Local CLI accepting a log file or stdin.
- Noise cleanup and ranked failure detection.
- Text, Markdown, and versioned JSON reports.
- Context lines and stable failure fingerprints.
- Optional non-zero exit code on detection.
- Automated tests, examples, community files, and Agent Skill.
- Sanitized regression corpus for Pytest, Maven, Rust, Go, .NET, Docker, npm, Node.js, and ESLint logs.
- Clean-room verification that packs, installs, and runs the npm artifact.

### Changed

- More specific compiler, dependency, lint, and exit-wrapper detection.

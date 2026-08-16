# Changelog

All notable changes to this project will be documented here. The format follows Keep a Changelog and versions follow Semantic Versioning.

## [Unreleased]

### Added

- Sanitized regression corpus for Pytest, Maven, Rust, Go, .NET, Docker, npm, Node.js, and ESLint logs.
- Clean-room verification that packs, installs, and runs the npm artifact.

### Changed

- More specific compiler, dependency, lint, and exit-wrapper detection.

### Planned

- Package a GitHub Action after the local CLI proves useful.

## [0.1.0] - 2026-08-15

### Added

- Local CLI accepting a log file or stdin.
- Noise cleanup and ranked failure detection.
- Text, Markdown, and versioned JSON reports.
- Context lines and stable failure fingerprints.
- Optional non-zero exit code on detection.
- Automated tests, examples, community files, and Agent Skill.

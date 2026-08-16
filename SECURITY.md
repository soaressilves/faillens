# Security Policy

## Supported versions

Until the first stable release, only the latest released `0.x` version receives security fixes.

## Report a vulnerability

Do not open a public issue containing an exploit, private log, credential, or personal information.

Use GitHub's private vulnerability reporting for this repository. If that feature is unavailable, contact the maintainer privately through the email displayed on the GitHub profile `soaressilves`.

Include the affected version, reproduction steps, impact, and a minimal sanitized example. You should receive an acknowledgement within seven days.

## Data handling

The core FailLens analyzer runs locally and performs no network requests. Integrations added in the future must document exactly which data leaves the machine and require explicit configuration.

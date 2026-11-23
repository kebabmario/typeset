# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html). The version in `package.json` is `0.1.0`; no release has been tagged yet.

## [Unreleased]

### Added

- MIT license.
- Project documentation: README, ARCHITECTURE, DESIGN, DEVELOPMENT, CONTRIBUTING and this changelog.
- README logo files in `docs/assets/`.

## [0.1.0] - Unreleased

Initial implementation.

### Added

- Editorial preview with kicker, heading, subtitle, body and a live spec line, editable in place or from the Text tab.
- Independent heading and body controls for family, weight, size, line height, letter spacing, alignment and case.
- Searchable font picker with category filters, keyboard navigation and names rendered in their own faces.
- Curated catalog of 120 Google Fonts families, with optional full-library support through a server-side `GOOGLE_FONTS_API_KEY`.
- On-demand font loading with an 8-second timeout, error state and category fallback stacks.
- 22 curated presets and a filterable presets gallery.
- Saved pairings in `localStorage` with load, delete and inline undo.
- Shareable URLs that encode the current pairing in `?t=`, kept in sync with the address bar.
- CSS and JSON export, with copy to clipboard and JSON download.
- Session persistence for the pairing and sample text.
- Responsive layout with a desktop control rail and a phone and tablet bottom sheet.
- Wordmark, app icon, SVG favicon and Apple touch icon.
- Logic self-check script (`npm run check:logic`).

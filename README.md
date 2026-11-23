<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/wordmark-dark.svg">
  <img src="docs/assets/wordmark-light.svg" alt="typeset" width="320">
</picture>

<p><strong>A typography exploration and font pairing playground.</strong></p>

<p>
  <img src="https://img.shields.io/badge/Next.js-16.4-000000?logo=nextdotjs&logoColor=white" alt="Next.js 16.4">
  <img src="https://img.shields.io/badge/React-19.3-149eca?logo=react&logoColor=white" alt="React 19.3">
  <img src="https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white" alt="TypeScript strict">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.3-38bdf8?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4.3">
  <img src="https://img.shields.io/badge/license-MIT-1d1d1f" alt="MIT license">
</p>

<p>
  <a href="#getting-started">Getting started</a> ·
  <a href="ARCHITECTURE.md">Architecture</a> ·
  <a href="DESIGN.md">Design</a> ·
  <a href="DEVELOPMENT.md">Development</a> ·
  <a href="CONTRIBUTING.md">Contributing</a> ·
  <a href="CHANGELOG.md">Changelog</a>
</p>

</div>

---

## What TYPESET does

TYPESET lets designers and developers pair a heading typeface with a body typeface from Google Fonts and see the result as a real editorial page. Tune weight, size, line height, letter spacing, alignment and case for each role, rewrite the sample text in place, then save the pairing, share it as a link, or export it as CSS or JSON.

It runs entirely in the browser. There is no account, backend database or tracking. Saved pairings live in `localStorage`.

## Key features

- **Live editorial preview.** A kicker, heading, subtitle and body paragraphs that update on every change. Click any text to edit it ([`Preview.tsx`](src/components/Preview.tsx), [`Editable.tsx`](src/components/Editable.tsx)).
- **Independent heading and body controls.** Family, weight, size, line height, letter spacing, alignment and text transform ([`StylePanel.tsx`](src/components/StylePanel.tsx)). The weight slider only stops at weights the chosen family ships.
- **Searchable font picker.** Search by name, filter by Sans, Serif, Display or Mono, keyboard navigation, and every family name drawn in its own face ([`FontPicker.tsx`](src/components/FontPicker.tsx)).
- **22 curated presets.** Each preset is a deliberate heading/body pairing with tuned metrics and a one-line rationale, also browsable in a filterable gallery ([`presets.ts`](src/lib/typography/presets.ts), [`PresetGallery.tsx`](src/components/PresetGallery.tsx)).
- **On-demand Google Fonts loading.** One family and weight at a time, with an 8-second timeout, a visible error state and category-appropriate system fallbacks ([`fontLoader.ts`](src/lib/fontLoader.ts)).
- **Saved pairings.** Name, save, load and delete with inline undo, persisted to `localStorage` and validated on read ([`useSavedCombinations.ts`](src/hooks/useSavedCombinations.ts)).
- **Shareable URLs.** The address bar always encodes the current pairing in `?t=`, so copying the URL shares exactly what you see ([`share.ts`](src/lib/typography/share.ts)).
- **CSS and JSON export.** CSS custom properties, element rules and a Google Fonts `@import`, or a JSON file you can download ([`export.ts`](src/lib/typography/export.ts)).
- **Responsive layout.** A sticky control rail on desktop and a bottom sheet with a tab bar on tablet and phone.

## Screenshots

> Screenshots have not been added to the repository yet.

| View | Image |
| --- | --- |
| Desktop playground | _Placeholder: `docs/assets/screenshot-desktop.png`_ |
| Font picker | _Placeholder: `docs/assets/screenshot-picker.png`_ |
| Presets gallery | _Placeholder: `docs/assets/screenshot-gallery.png`_ |
| Mobile controls sheet | _Placeholder: `docs/assets/screenshot-mobile.png`_ |

## Technology stack

| Layer | Choice |
| --- | --- |
| Framework | [Next.js](https://nextjs.org) 16.4 (App Router, Cache Components, Turbopack) |
| UI | React 19.3 |
| Language | TypeScript 5, `strict: true` |
| Styling | Tailwind CSS 4.3 via `@tailwindcss/turbopack`, design tokens in [`globals.css`](src/app/globals.css) |
| Icons | [Lucide](https://lucide.dev) (`lucide-react`) |
| Interface font | Instrument Sans via `next/font/google` |
| Preview fonts | Google Fonts CSS2 API, loaded at runtime |
| Linting | ESLint 9 with `eslint-config-next` (Core Web Vitals and TypeScript presets) |

## Getting started

### Prerequisites

- Node.js 20.9 or newer (the minimum for Next.js 16). Development used Node 24.
- npm

### Installation

```bash
git clone https://github.com/kebabmario/typeset.git
cd typeset
npm install
```

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). If port 3000 is taken, Next.js picks the next free port and prints it.

### Optional: full Google Fonts library

TYPESET needs no configuration. It ships a curated catalog of 120 families. To browse the whole Google Fonts library, add a server-side API key:

```bash
cp .env.example .env.local
# set GOOGLE_FONTS_API_KEY in .env.local
```

The key is only read in [`src/app/api/fonts/route.ts`](src/app/api/fonts/route.ts) and never reaches the browser. See [DEVELOPMENT.md](DEVELOPMENT.md#environment-variables).

## Development commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run `tsc --noEmit` |
| `npm run check:logic` | Run the assertion checks in [`scripts/selfcheck.ts`](scripts/selfcheck.ts) through `tsx` (fetched by `npx` on first run) |

## Build and production

```bash
npm run lint && npm run typecheck && npm run check:logic
npm run build
npm run start
```

The build prerenders `/` as a static shell. The interactive playground renders in the browser because it restores state from the URL and `localStorage`. `/api/fonts`, `/icon.svg` and `/apple-icon` are also prerendered; the font catalog revalidates daily. Set `GOOGLE_FONTS_API_KEY` in the hosting environment if you want the full library in production.

## Project structure

```
src/
├── app/
│   ├── api/fonts/route.ts     Server-side font catalog (curated or Google Fonts API)
│   ├── apple-icon.tsx         180×180 PNG touch icon via ImageResponse
│   ├── globals.css            Design tokens, range input, dialog transitions, motion rules
│   ├── icon.svg               Favicon
│   ├── layout.tsx             Root layout, interface font, metadata
│   └── page.tsx               Suspense boundary around the browser-only playground
├── components/
│   ├── Playground.tsx         Top-level state and layout
│   ├── Preview.tsx            Editorial specimen
│   ├── StylePanel.tsx         Heading/body controls
│   ├── FontPicker.tsx         Searchable font dialog
│   ├── PresetBar.tsx          Scrolling preset row
│   ├── PresetGallery.tsx      Preset gallery dialog
│   ├── SaveDialog.tsx, SavedDrawer.tsx, ExportDialog.tsx, AboutDialog.tsx
│   ├── TextPanel.tsx, Editable.tsx, Nav.tsx
│   ├── Logo.tsx, logo-paths.ts
│   └── ui/                    Dialog, Slider, Segmented, Toast primitives
├── hooks/                     useFontCatalog, useFontStatus, useSavedCombinations
└── lib/
    ├── typography/            Types, catalog, presets, validation, share codec, export
    ├── fontLoader.ts          Runtime font loading and glyph-subset samples
    ├── storage.ts             Safe localStorage helpers
    └── clipboard.ts           Clipboard with fallback
scripts/selfcheck.ts           Logic assertions
docs/assets/                   README logo files
```

A file-by-file walkthrough is in [ARCHITECTURE.md](ARCHITECTURE.md).

## How the typography engine works

TYPESET has no color-generation engine. Its core is a small typography engine in [`src/lib/typography/`](src/lib/typography/), kept separate from React:

1. **A pairing is a plain object.** `TypeConfig` holds a `heading` and a `body` `TypeStyle`: family, category, weight, size (px), line height, letter spacing (em), alignment and transform ([`types.ts`](src/lib/typography/types.ts)).
2. **Every untrusted input is sanitized.** `sanitizeConfig` and `sanitizeStyle` clamp numbers to per-role limits (`LIMITS`), snap them to step, restrict family names to a safe pattern, and fall back field by field ([`config.ts`](src/lib/typography/config.ts)). URLs, `localStorage` and saved pairings all pass through it.
3. **Fonts are fetched only when used.** `loadFont(family, weight)` injects one CSS2 stylesheet, waits on `document.fonts.load`, and resolves `true` or `false` ([`fontLoader.ts`](src/lib/fontLoader.ts)). The preview fades text while a face loads and uses `fontStack()` fallbacks if it fails.
4. **Derived styles stay consistent.** The subtitle uses the heading family at the weight nearest 400 (`nearestWeight`) and a size derived from both roles. The heading scales down with container query units on narrow screens.
5. **Output is generated from the same object.** `encodeConfig` writes the share link, `toCss` and `toJson` produce the exports.

```ts
import { toCss } from "@/lib/typography/export";
import { PRESETS } from "@/lib/typography/presets";

toCss(PRESETS[0].config);
// @import url("https://fonts.googleapis.com/css2?family=Fraunces:wght@600&family=Newsreader&display=swap");
// :root { --font-heading: "Fraunces", serif; --font-body: "Newsreader", serif; ... }
```

## Browser compatibility

TYPESET targets current evergreen browsers. It relies on:

| Feature | Used for | Without it |
| --- | --- | --- |
| `<dialog>` and `showModal()` | All dialogs and the saved drawer | Required |
| CSS container query units (`cqi`) | Scaling the preview heading | Heading stays at its set size |
| `@starting-style`, `transition-behavior: allow-discrete` | Dialog entry and exit transitions | Dialogs open without animation |
| `contentEditable="plaintext-only"` | In-place text editing | Paste is still stripped to plain text by a handler in `Editable.tsx` |
| `text-wrap: balance / pretty` | Heading and paragraph rag | Normal wrapping |
| Clipboard API | Copy link and copy CSS/JSON | Falls back to `document.execCommand("copy")` |

It was developed and tested in Chromium. Safari and Firefox have not been formally tested. See [DEVELOPMENT.md](DEVELOPMENT.md#known-gaps).

## License

Released under the [MIT License](LICENSE).

The wordmark and app icon are built from outlines of [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque), licensed under the SIL Open Font License. Preview fonts are served by Google Fonts under their respective licenses.

# TYPESET

A typography exploration and font pairing playground. Pair a heading and body face from Google Fonts, tune weight, size, line height, letter spacing, alignment and case, edit the sample text in place, then save, share or export the result.

## Run

```bash
npm install
npm run dev
```

Checks:

```bash
npm run lint && npm run typecheck && npm run check:logic && npm run build
```

## Fonts and the optional API key

TYPESET works with no configuration. It ships a curated catalog of about 120 Google Fonts families (`src/lib/typography/catalog.ts`) whose weights are verified against the Google Fonts CSS2 API.

To browse the full library, set a Google Fonts Developer API key on the server:

```bash
cp .env.example .env.local
# then fill in GOOGLE_FONTS_API_KEY
```

The key is read only in `src/app/api/fonts/route.ts`, never sent to the browser. The catalog response is cached for a day on the server and in `localStorage` on the client. If the key is missing or the request fails, the route falls back to the curated list.

Fonts load on demand, one family and weight at a time. Pickers and preset labels fetch only the glyphs of each font's name. A face that fails or times out (8 s) shows a notice and renders in a system fallback stack for its category.

## How state works

- **URL:** the current pairing is always encoded in `?t=` (base64url JSON), so the address bar is a share link. Decoded values are validated and clamped (`sanitizeConfig`).
- **localStorage:** the last session (pairing and sample text) and saved pairings. Corrupt or invalid entries are dropped field by field. Storage failures never throw.
- Load priority: shared link, then last session, then the Editorial preset.

## Layout

```
src/lib/typography/   types, catalog, presets, validation, share codec, CSS/JSON export
src/lib/              font loader, storage, clipboard
src/hooks/            catalog, font status, saved pairings
src/components/       Playground, Preview, StylePanel, FontPicker, dialogs, ui primitives
src/app/api/fonts/    server-side Google Fonts catalog
scripts/selfcheck.ts  assertion checks for share round-trips, sanitizing and preset weights
```

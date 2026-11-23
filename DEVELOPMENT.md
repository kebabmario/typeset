# Development

Reference for working on TYPESET locally. For the system design see [ARCHITECTURE.md](ARCHITECTURE.md); for contribution rules see [CONTRIBUTING.md](CONTRIBUTING.md).

## Local workflow

```bash
npm install
npm run dev
```

1. Open the URL printed by `next dev` (normally [http://localhost:3000](http://localhost:3000)).
2. Edit files under `src/`. Fast Refresh keeps playground state where it can.
3. Before committing, run the validation steps below.

The playground persists its state, so a reload restores your last pairing. To start clean, remove the `?t=` parameter and clear the site's `localStorage` (see [Troubleshooting](#troubleshooting)).

## Scripts

Defined in [`package.json`](package.json):

| Script | Command | Notes |
| --- | --- | --- |
| `dev` | `next dev` | Development server with Turbopack |
| `build` | `next build` | Production build; also type-checks |
| `start` | `next start` | Serves `.next/` after `build` |
| `lint` | `eslint` | Uses [`eslint.config.mjs`](eslint.config.mjs) (`core-web-vitals` and `typescript` presets) |
| `typecheck` | `tsc --noEmit` | Checks `src/` and `scripts/` |
| `check:logic` | `npx --yes tsx scripts/selfcheck.ts` | `tsx` is not a dependency; `npx` downloads it on first run, which needs network access |

### What `check:logic` covers

[`scripts/selfcheck.ts`](scripts/selfcheck.ts) uses `node:assert/strict` and prints `selfcheck ok` on success. It verifies that:

- Every preset survives `encodeConfig` → `decodeConfig` unchanged.
- `decodeConfig` rejects `null`, non-base64url input and unknown versions.
- `sanitizeConfig` rejects an injection attempt in `family`, clamps oversized and negative sizes, and falls back on invalid weights, alignment and non-numeric values.
- Every preset's family exists in `CURATED_FONTS` with that weight and category.
- `toCss` emits the expected `--font-heading` declaration.

## Important files

| Path | Why it matters |
| --- | --- |
| [`src/components/Playground.tsx`](src/components/Playground.tsx) | Page state, initial-state priority, URL and session persistence |
| [`src/lib/typography/config.ts`](src/lib/typography/config.ts) | Limits and all validation; change limits here |
| [`src/lib/typography/presets.ts`](src/lib/typography/presets.ts) | Preset definitions; the first entry is the default |
| [`src/lib/typography/catalog.ts`](src/lib/typography/catalog.ts) | Curated families and their exact weights |
| [`src/lib/fontLoader.ts`](src/lib/fontLoader.ts) | Runtime font loading, timeout, sample subsets |
| [`src/app/api/fonts/route.ts`](src/app/api/fonts/route.ts) | Server catalog and optional API key |
| [`src/app/globals.css`](src/app/globals.css) | Design tokens and global component CSS |
| [`src/components/logo-paths.ts`](src/components/logo-paths.ts) | Generated logo path data |
| [`next.config.ts`](next.config.ts) | `cacheComponents`, `partialPrefetching`, Tailwind loader |
| [`AGENTS.md`](AGENTS.md) | Written by `next dev`; notes that this Next.js version differs from older docs |

Next.js 16 ships its own documentation in `node_modules/next/dist/docs/`. Prefer it over older online material when an API behaves unexpectedly.

### Adding a preset

1. Add an entry to `PRESETS` in [`presets.ts`](src/lib/typography/presets.ts) using the `style()` helper.
2. Use families from `CURATED_FONTS` with a weight they list and the same category. `check:logic` fails otherwise.
3. Keep values inside `LIMITS`.

### Adding a curated font

Add `[family, weights]` to the right `group()` in [`catalog.ts`](src/lib/typography/catalog.ts). List only weights the CSS2 API actually serves; one wrong weight makes the whole stylesheet request fail. You can confirm a list by opening:

```
https://fonts.googleapis.com/css2?family=Family+Name:wght@400;700&display=swap
```

A `200` response means every listed weight exists.

## Environment variables

| Variable | Required | Read in | Effect |
| --- | --- | --- | --- |
| `GOOGLE_FONTS_API_KEY` | No | [`src/app/api/fonts/route.ts`](src/app/api/fonts/route.ts) | When set, `/api/fonts` returns the full Google Fonts library sorted by popularity. When unset or failing, it returns the curated catalog |

```bash
cp .env.example .env.local
```

Notes:

- The variable has no `NEXT_PUBLIC_` prefix, so it is never bundled for the browser.
- `.env*` files are git-ignored except `.env.example`.
- The catalog is cached with `cacheLife("days")` on the server and for 24 hours in the browser (`typeset:catalog:v1`). After changing the key, restart the dev server and clear that `localStorage` entry to see the new catalog immediately.

## Build and validation

Run these before opening a pull request:

```bash
npm run lint
npm run typecheck
npm run check:logic
npm run build
```

A successful build lists these routes, all prerendered:

```
┌ ○ /
├ ○ /_not-found
├ ○ /api/fonts           1d      1w
├ ○ /apple-icon
└ ○ /icon.svg
```

There is no automated UI test suite. Verify interactive changes in a browser at desktop and phone widths (see [CONTRIBUTING.md](CONTRIBUTING.md#testing)).

## Troubleshooting

**The page always opens on an old pairing.** The `?t=` parameter wins over everything. Open `/` without it. If the pairing persists, clear `typeset:session:v1` in DevTools → Application → Local Storage.

**A font shows "Couldn't load. Showing a system fallback."** The CSS2 request failed, the family has no face at that weight, or loading took longer than 8 seconds. Check the Network panel for the `fonts.googleapis.com` request. Failed loads are not cached: switch to another font and back, or reload, to retry.

**Saved pairings vanish after closing the tab.** The browser is blocking `localStorage` (for example some private modes). The Saved drawer shows a warning in this case.

**The full Google Fonts library does not appear after adding a key.** Restart `npm run dev`, then delete `typeset:catalog:v1` from `localStorage`. When the key is active, the font picker description reads "The full Google Fonts library, most popular first."

**`npm run check:logic` fails with a network error.** It needs to download `tsx` through `npx` the first time.

**Port 3000 is in use.** `next dev` moves to the next free port and prints it.

**Dev-only "N" badge in the corner.** That is the Next.js development indicator. It does not appear in production builds.

## Known gaps

- No automated component or end-to-end tests; only `scripts/selfcheck.ts`.
- Tested in Chromium only. Safari and Firefox behavior has not been verified.
- Light theme only.
- The `accent-soft` color token is defined but unused.
- JSON export has no matching import feature.
- No Open Graph image.

# Architecture

TYPESET is a single-route Next.js App Router application. All typography state lives in the browser. The only server code is a cached route that returns the font catalog.

- [Application structure](#application-structure)
- [Rendering model](#rendering-model)
- [Component organization](#component-organization)
- [State management](#state-management)
- [Typography engine](#typography-engine)
- [Font loading](#font-loading)
- [Local storage](#local-storage)
- [Sharing and export](#sharing-and-export)
- [Data flow](#data-flow)
- [Design decisions](#design-decisions)

## Application structure

```
src/app/                     Routes and metadata files
src/components/              React components (all client components except Nav and Logo)
src/components/ui/           Generic primitives with no typography knowledge
src/hooks/                   Client hooks for catalog, font status, saved pairings
src/lib/typography/          Framework-free typography logic
src/lib/                     Browser utilities: font loading, storage, clipboard
scripts/selfcheck.ts         Assertion checks for the typography logic
```

The dependency direction is one way: `components` → `hooks` → `lib`. Nothing in `src/lib/typography/` imports React, which is why `scripts/selfcheck.ts` can run it directly under Node.

### Routes

| Path | File | Notes |
| --- | --- | --- |
| `/` | [`src/app/page.tsx`](src/app/page.tsx) | Static shell plus the browser-only playground |
| `/api/fonts` | [`src/app/api/fonts/route.ts`](src/app/api/fonts/route.ts) | `GET` returns `{ source, fonts }`, cached with `"use cache"` and `cacheLife("days")` |
| `/icon.svg` | [`src/app/icon.svg`](src/app/icon.svg) | Favicon |
| `/apple-icon` | [`src/app/apple-icon.tsx`](src/app/apple-icon.tsx) | 180×180 PNG generated with `ImageResponse` from `MARK` in `logo-paths.ts` |

[`next.config.ts`](next.config.ts) enables `cacheComponents` and `partialPrefetching`, and wires Tailwind through the `@tailwindcss/turbopack` CSS loader.

## Rendering model

The playground reads `window.location` and `localStorage` before its first render, so its server HTML could never match its first client render. Instead of rendering defaults and correcting them in an effect, it opts out of server rendering with React 19.3's `browser()` API:

```tsx
// src/components/Playground.tsx
export function Playground() {
  use(browser("The playground restores state from the URL and localStorage."));
  const [initial] = useState(initialState); // reads URL + localStorage synchronously
  ...
}
```

```tsx
// src/app/page.tsx
<ToastProvider>
  <Suspense fallback={<Shell />}>
    <Playground />
  </Suspense>
</ToastProvider>
```

During prerendering `use(browser())` suspends, so the built HTML contains `Shell`: a static `Nav` and a blank preview sheet. In the browser `browser()` returns `undefined` and the playground renders with its real state on the first pass. This removes any chance of a hydration mismatch and avoids a flash of the default preset.

`Nav` and `Logo` have no `"use client"` directive. They render on the server inside `Shell` and are reused by `Playground` with handlers attached.

## Component organization

### Shell and layout

| Component | Responsibility |
| --- | --- |
| [`Playground`](src/components/Playground.tsx) | Owns all page state, wires dialogs, renders the toolbar, preview and control rail or sheet |
| [`Nav`](src/components/Nav.tsx) | Wordmark, Playground, Saved (with count) and About buttons. Buttons are disabled when no handler is passed (the server shell) |
| [`Logo`](src/components/Logo.tsx) | `Wordmark` and `LogoMark` SVGs built from path data in `logo-paths.ts` |

### Preview

| Component | Responsibility |
| --- | --- |
| [`Preview`](src/components/Preview.tsx) | Applies `TypeConfig` to the kicker, heading, subtitle and body; prints the spec line footer |
| [`Editable`](src/components/Editable.tsx) | Uncontrolled plain-text `contentEditable` that syncs from props only when the value changes elsewhere |

### Controls

| Component | Responsibility |
| --- | --- |
| [`StylePanel`](src/components/StylePanel.tsx) | Font button with load status, weight slider over available weights, size, line height and letter spacing sliders, collapsible alignment and case |
| [`TextPanel`](src/components/TextPanel.tsx) | Textareas for the four text fields and "Restore sample text" |
| [`PresetBar`](src/components/PresetBar.tsx) | Gallery button and horizontally scrolling preset buttons, each set in its heading face. Exports `presetLabel()` |
| `TabList`, `ToolbarButton` | Local helpers inside `Playground.tsx` |

### Dialogs

All dialogs are built on [`ui/Dialog`](src/components/ui/Dialog.tsx). Only one is open at a time, selected by the `dialog` state in `Playground`.

| Component | `dialog` value | Purpose |
| --- | --- | --- |
| [`FontPicker`](src/components/FontPicker.tsx) | `"picker"` | Search and choose a family for `pickerRole` |
| [`PresetGallery`](src/components/PresetGallery.tsx) | `"gallery"` | Grid of all presets, filterable by heading category |
| [`SaveDialog`](src/components/SaveDialog.tsx) | `"save"` | Name and save the current pairing |
| [`SavedDrawer`](src/components/SavedDrawer.tsx) | `"saved"` | List, load and delete saved pairings, inline undo |
| [`ExportDialog`](src/components/ExportDialog.tsx) | `"export"` | CSS or JSON output, copy and download |
| [`AboutDialog`](src/components/AboutDialog.tsx) | `"about"` | Logo lockup and short product description |

### Primitives (`src/components/ui/`)

| Component | Notes |
| --- | --- |
| `Dialog` | Native `<dialog>` with `showModal()`. Closes on Escape, backdrop click and the close button. Focuses the first `[data-autofocus]` element after opening. `variant="drawer"` docks it to the right edge |
| `Slider` | Range input plus a typable numeric field that commits on Enter or blur and clamps to `min`/`max`/`step` |
| `Segmented` | `role="radiogroup"` with roving `tabIndex` and arrow key selection |
| `Toast` | `ToastProvider` context and a `useToast()` hook. One message at a time, optional action button, `role="status"` live region |

## State management

There is no state library. `Playground` holds the page state in `useState` and passes values and callbacks down.

| State | Type | Persisted |
| --- | --- | --- |
| `config` | `TypeConfig` | URL (`?t=`) and `localStorage` session |
| `text` | `SampleText` | `localStorage` session |
| `tab` | `"heading" \| "body" \| "text"` | No |
| `pickerRole` | `Role` | No |
| `dialog` | `DialogName` | No |
| `sheetOpen` | `boolean` (mobile controls sheet) | No |

Derived values are computed during render, not stored:

- `activePreset`: the preset whose config deep-equals `config` (`configsEqual`), memoized with `useMemo`.
- `pairingName`: the preset name, or "`<heading>` and `<body>`" for custom pairings.
- `subtitleWeight`: `nearestWeight(headingFont.weights, 400)`.

Updates go through two helpers in `Playground.tsx`:

```ts
const updateStyle = (role: Role, patch: Partial<TypeStyle>) =>
  setConfig((c) => ({ ...c, [role]: { ...c[role], ...patch } }));

const chooseFamily = (role: Role, font: FontFamily) =>
  updateStyle(role, {
    family: font.family,
    category: font.category,
    weight: nearestWeight(font.weights, config[role].weight),
  });
```

Hooks own state that has its own lifecycle:

| Hook | Owns |
| --- | --- |
| [`useFontCatalog`](src/hooks/useFontCatalog.ts) | The font list, its source (`"google"` or `"curated"`) and a `byFamily` map |
| [`useFontStatus`](src/hooks/useFontStatus.ts) | A `loading` / `ready` / `error` status per `family:weight` key |
| [`useSavedCombinations`](src/hooks/useSavedCombinations.ts) | The saved list, `save`, `remove`, `restore`, and a `persistFailed` flag |

`useFontStatus` keys results by `family:weight` and defaults missing keys to `"loading"`, so a change of font never shows the previous font's status and no state is reset inside an effect.

## Typography engine

[`src/lib/typography/`](src/lib/typography/) contains all domain logic.

| File | Contents |
| --- | --- |
| [`types.ts`](src/lib/typography/types.ts) | `FontCategory`, `FontFamily`, `TypeStyle`, `TypeConfig`, `SampleText`, `SavedCombination`, `Preset`, and the `ALIGNMENTS` / `TRANSFORMS` / `FONT_CATEGORIES` tuples |
| [`catalog.ts`](src/lib/typography/catalog.ts) | `CURATED_FONTS`: 120 families with exact weight lists |
| [`config.ts`](src/lib/typography/config.ts) | `LIMITS`, `WEIGHT_NAMES`, `FALLBACK_STACKS`, `GENERIC_FAMILY`, `CATEGORY_LABELS`, `DEFAULT_TEXT`, and `isValidFamily`, `sanitizeStyle`, `sanitizeConfig`, `sanitizeText`, `fontStack`, `nearestWeight`, `weightLabel`, `configsEqual` |
| [`presets.ts`](src/lib/typography/presets.ts) | `PRESETS` (22 entries) and `DEFAULT_CONFIG` (the first preset, Editorial) |
| [`fontUrl.ts`](src/lib/typography/fontUrl.ts) | `familyUrl` for runtime loading and `stylesheetUrl` for export |
| [`share.ts`](src/lib/typography/share.ts) | `SHARE_PARAM`, `encodeConfig`, `decodeConfig`, `shareUrl` |
| [`export.ts`](src/lib/typography/export.ts) | `toCss`, `toJson` |

### Limits

```ts
// src/lib/typography/config.ts
heading: size 24–160 px (step 1), lineHeight 0.8–1.6 (0.01), letterSpacing −0.1–0.2 em (0.005)
body:    size 12–28 px (step 0.5), lineHeight 1.1–2.2 (0.01), letterSpacing −0.05–0.15 em (0.005)
```

### Validation

`sanitizeStyle(input, role, fallback)` accepts `unknown` and returns a valid `TypeStyle`:

- Numbers must be finite. They are clamped to `LIMITS[role]` and rounded to the step.
- Weights must be integers from 100 to 900 and are rounded to the nearest hundred.
- `family` must match `/^[A-Za-z0-9][A-Za-z0-9 \-]{0,63}$/`. This keeps names safe to place inside a CSS string and a Google Fonts URL.
- `category`, `align` and `transform` must be members of their tuples.
- Any invalid field falls back to the corresponding field of `fallback`; the rest are kept.

`sanitizeConfig` returns `null` if the input is not an object with both `heading` and `body`.

## Font loading

[`src/lib/fontLoader.ts`](src/lib/fontLoader.ts) has two loaders.

**`loadFont(family, weight): Promise<boolean>`** loads a face for real use:

1. Injects `<link rel="stylesheet" data-font-href=…>` for `familyUrl(family, [weight])`, reusing an existing link.
2. Calls `document.fonts.load(\`${weight} 16px "${family}"\`)`.
3. Resolves `true` if at least one face matched, `false` on stylesheet error, no match, or the 8 s `TIMEOUT_MS`.
4. Memoizes per `family:weight`. Failures are evicted so a later attempt retries.

Only valid weights are ever requested. The CSS2 API rejects the whole stylesheet if any requested weight does not exist, so `CURATED_FONTS` lists exact weights and the UI only offers those.

**`loadFontSample(family, weight, text)`** loads just the glyphs needed for a label (font picker rows, preset buttons, gallery tiles, saved items) using the CSS2 `text=` parameter. The returned CSS is fetched, its `font-family` is rewritten to `sampleFamily(family, text)` (the family name plus a hash of the text), and it is injected as a `<style>`. The alias matters: a subset registered under the real family name could shadow the full face. Components render samples with `sampleStack(style, text)`, which lists the alias, then the real family, then the system fallback.

`FontPicker` rows call `loadFontSample` only when they scroll into view (`IntersectionObserver`), and the list itself grows 60 rows at a time.

### Catalog source

`useFontCatalog` starts with a cached catalog less than 24 hours old if one exists. Otherwise it starts with `CURATED_FONTS` and fetches `/api/fonts` once. The route returns the curated list unless `GOOGLE_FONTS_API_KEY` is set, in which case it maps the Google Fonts Developer API response (`handwriting` becomes `display`, italic variants are dropped). Any failure falls back to the curated list.

## Local storage

All access goes through [`src/lib/storage.ts`](src/lib/storage.ts), whose `readJson` and `writeJson` catch every exception (disabled storage, private mode, quota, malformed JSON). `writeJson` returns `false` on failure.

| Key | Written by | Shape | Read with |
| --- | --- | --- | --- |
| `typeset:session:v1` | `Playground` effect on every `config` or `text` change | `{ config, text }` | `sanitizeConfig`, `sanitizeText` |
| `typeset:saved:v1` | `useSavedCombinations.commit` | `SavedCombination[]`, newest first, max 100 | `readSaved()` drops invalid entries individually |
| `typeset:catalog:v1` | `useFontCatalog` after a successful fetch | `{ at, source, fonts }` | `isFontList` check and 24 h TTL |

If saving pairings fails, `persistFailed` becomes `true` and `SavedDrawer` shows a warning that pairings will be lost when the tab closes.

## Sharing and export

### Share links

`encodeConfig` packs each style into a positional tuple and base64url-encodes it:

```ts
// [family, category, weight, size, lineHeight, letterSpacing, align, transform]
{ v: 1, h: ["Fraunces", "serif", 600, 68, 1.04, -0.02, "left", "none"],
        b: ["Newsreader", "serif", 400, 19, 1.62, 0, "left", "none"] }
// → ?t=eyJ2IjoxLCJoIjpbIkZyYXVuY2VzIiwic2VyaWYi…
```

`decodeConfig` rejects values over 1000 characters, characters outside the base64url alphabet, unparsable JSON and any `v` other than `1`, then runs the result through `sanitizeConfig`. `Playground` keeps the address bar current with `history.replaceState`, debounced by 250 ms. Sample text is not part of the link.

### Export

`toCss(config)` returns a Google Fonts `@import` for both families, `:root` custom properties (`--font-heading`, `--font-body`, `--{role}-weight`, `-size`, `-line-height`, `-letter-spacing`), and rules for `h1, h2, h3` and `body`. `text-align` and `text-transform` are emitted only when they differ from `left` and `none`.

`toJson(config, name)` returns `{ "$schema": "typeset/v1", name, heading, body }`. `ExportDialog` offers it for copying and as a downloaded `.json` file named from the pairing. The app does not currently import JSON.

## Data flow

```
              ┌───────────── URL ?t= ─────────────┐
              │                                    │ replaceState (250 ms debounce)
 initialState() ◄── localStorage session            │
      │                                             │
      ▼                                             │
 Playground state: config, text ───────────────────►┤
      │   ▲                                         │ writeJson(session)
      │   │ updateStyle / chooseFamily / setText    │
      │   │                                         │
      │   ├── StylePanel, TextPanel, Editable       │
      │   ├── PresetBar, PresetGallery (setConfig)  │
      │   └── SavedDrawer (loadCombination)         │
      │
      ├──► useFontStatus ─► loadFont ─► <link> + document.fonts.load
      │         └─ status ─► Preview (fade, fallback) and StylePanel (Loading / error)
      │
      ├──► Preview (renders)
      ├──► ExportDialog (toCss / toJson)
      └──► share button (shareUrl → copyText → toast)
```

## Design decisions

| Decision | Reason |
| --- | --- |
| Browser-only playground via `use(browser())` | State comes from the URL and `localStorage`; rendering defaults on the server would cause a mismatch or a visible swap |
| No backend beyond `/api/fonts` | The brief excludes accounts and databases; the only secret, the optional API key, stays on the server |
| Curated catalog with exact weights | Works with no key, and wrong weights would make the CSS2 request fail entirely |
| One stylesheet per family and weight | Loads only what the preview shows; no bulk font downloads |
| Glyph-subset samples under an alias family | Lets lists show every name in its own face cheaply without shadowing full faces |
| Sanitize at every trust boundary | URL, storage and saved data are all user-controllable; invalid fields degrade individually instead of rejecting the whole value |
| Address bar always holds the pairing | Sharing needs no extra step, and reload restores the exact pairing |
| Native `<dialog>` | Focus trapping, Escape handling, inert background and top-layer stacking come from the browser |
| Inline undo in the saved drawer | A modal dialog makes everything outside it inert, so a toast's Undo button would be unreachable |
| Uncontrolled `contentEditable` | Re-rendering an editable element on every keystroke resets the caret |
| Logo as path data | The wordmark never depends on a web font loading and works in `ImageResponse` |

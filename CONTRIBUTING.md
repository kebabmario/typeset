# Contributing

Thanks for helping improve TYPESET. This guide covers how the project is set up and what a good change looks like.

## Development environment

Requirements: Node.js 20.9 or newer and npm.

```bash
git clone https://github.com/kebabmario/typeset.git
cd typeset
npm install
npm run dev
```

No environment variables are needed. To work on the full-catalog path, set `GOOGLE_FONTS_API_KEY` as described in [DEVELOPMENT.md](DEVELOPMENT.md#environment-variables). Never commit a key.

## Branches

Branch from `main` and use a short, lowercase, hyphenated name with a type prefix:

| Prefix | Use | Example |
| --- | --- | --- |
| `feat/` | New user-facing functionality | `feat/json-import` |
| `fix/` | Bug fixes | `fix/picker-scroll-reset` |
| `docs/` | Documentation only | `docs/architecture-fonts` |
| `refactor/` | Internal change with no behavior change | `refactor/slider-props` |
| `chore/` | Tooling, dependencies, config | `chore/bump-next` |

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org):

```
<type>(<optional scope>): <imperative summary, max ~72 chars>

<optional body: what changed and why>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`. Useful scopes match the code layout: `preview`, `controls`, `picker`, `presets`, `saved`, `export`, `share`, `fonts`, `api`, `design`.

```
feat(presets): add Grotesk preset
fix(fonts): retry a family after a timed-out load
docs: document share link format
```

Keep each commit to one logical change.

## Code style

- **Formatting:** follow the existing style: two-space indentation, double quotes, semicolons, trailing commas in multi-line literals. ESLint is the only enforced tool (`npm run lint`); there is no Prettier config.
- **Components:** function components, one main component per file, named exports. Mark files `"use client"` only when they use state, effects or browser APIs.
- **Keep logic out of components.** Typography rules, validation, encoding and export belong in `src/lib/typography/` as pure functions. Browser utilities belong in `src/lib/`. Stateful logic with its own lifecycle belongs in a hook in `src/hooks/`.
- **Styling:** Tailwind utilities with the theme tokens from [`globals.css`](src/app/globals.css) (`bg-paper`, `text-ink-2`, `border-line`, `text-accent`). Do not hard-code new colors; add a token if one is missing. Follow [DESIGN.md](DESIGN.md) for radii, spacing and motion.
- **Comments:** explain why, not what. Short JSDoc on exported functions where the behavior is not obvious.
- **Dependencies:** the runtime dependencies are `next`, `react`, `react-dom` and `lucide-react`. Discuss any new dependency in the pull request first.

## TypeScript

- `strict` is on. Do not weaken compiler options.
- No `any`. Use `unknown` for untrusted data and narrow it.
- Validate anything that crosses a trust boundary (URL, `localStorage`, `fetch` responses) with the sanitizers in [`config.ts`](src/lib/typography/config.ts) or an equivalent type guard, like `isFontList` in [`useFontCatalog.ts`](src/hooks/useFontCatalog.ts).
- Derive union types from `as const` tuples (`FONT_CATEGORIES`, `ALIGNMENTS`, `TRANSFORMS`) so runtime checks and types stay in sync.
- Use the `@/` import alias for anything outside the current folder.
- Wrap browser storage in `readJson` / `writeJson` from [`storage.ts`](src/lib/storage.ts); never call `localStorage` directly.

## Testing

Every pull request must pass:

```bash
npm run lint
npm run typecheck
npm run check:logic
npm run build
```

When you change logic in `src/lib/typography/`, add assertions to [`scripts/selfcheck.ts`](scripts/selfcheck.ts).

There is no automated UI test suite, so check interactive changes by hand:

- Desktop (about 1440px) and phone (375px) widths, with no horizontal scrolling.
- Keyboard only: Tab order, visible focus, Escape closes dialogs.
- Reload and confirm state restores from the URL and `localStorage`.
- For font changes, a family that fails to load (for example an invalid family in a `?t=` link) should show the error state.
- No errors in the browser console.

## Pull requests

- Keep each PR focused on one change, and link the issue if there is one.
- Describe what changed, why, and how you tested it. Include before and after screenshots for visual changes.
- Update the docs when behavior, scripts, files or tokens change: README, [ARCHITECTURE.md](ARCHITECTURE.md), [DESIGN.md](DESIGN.md), [DEVELOPMENT.md](DEVELOPMENT.md).
- Add an entry under `[Unreleased]` in [CHANGELOG.md](CHANGELOG.md).
- Do not include unrelated formatting changes, lockfile churn or local files such as `.claude/` or `.env.local`.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).

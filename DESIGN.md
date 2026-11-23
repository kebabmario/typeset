# Design system

TYPESET's interface is deliberately quiet so the typography in the preview carries the page. This document describes the system as implemented in [`src/app/globals.css`](src/app/globals.css) and the component class names.

## Philosophy

- **Type is the hero.** The preview sheet is the largest element on screen. The interface around it uses one small sans-serif, neutral greys and almost no decoration.
- **Spend boldness once.** The preset row and font lists render every name in its own typeface. That specimen effect is the one expressive element; everything else stays restrained.
- **Structure only where it informs.** Hairline borders separate the preview footer, the alignment section and dialog footers. There are no decorative cards, gradients or glass effects.
- **Calm motion.** Transitions answer user actions (opening a dialog, toggling a control, saving). The only unprompted motion is the logo caret blinking twice on load.
- **Plain language.** Buttons say what happens ("Save", "Copy link", "Restore sample text"), and the toast repeats the same verb ("Saved …", "Link copied").

## Brand

| Asset | Source | Description |
| --- | --- | --- |
| Wordmark | `Wordmark` in [`Logo.tsx`](src/components/Logo.tsx) | Lowercase "typeset" outlined from Bricolage Grotesque Bold (opsz 96), tracked −28 units, followed by a text caret in `accent` |
| Mark | `LogoMark` in [`Logo.tsx`](src/components/Logo.tsx), [`icon.svg`](src/app/icon.svg) | The wordmark's "t" and a `#4c9bff` caret on a `#1d1d1f` square with 15/64 corner radius |
| Apple touch icon | [`apple-icon.tsx`](src/app/apple-icon.tsx) | The mark full-bleed at 180×180; iOS applies its own mask |

The caret represents live, editable type. The lighter `#4c9bff` is used on the dark mark because `#0066cc` has too little contrast on near-black. Path data lives in [`logo-paths.ts`](src/components/logo-paths.ts).

## Typography

### Interface

- **Typeface:** Instrument Sans, loaded with `next/font/google` as `--font-ui` and exposed as Tailwind's `font-sans`. Fallback: `ui-sans-serif, system-ui, -apple-system, sans-serif`.
- **Features:** `font-feature-settings: "ss01", "cv11"` and `text-rendering: optimizeLegibility` on `body`.
- **Scale:** small and consistent. Pixel values are set explicitly with Tailwind arbitrary values.

| Size | Use |
| --- | --- |
| 11px | Saved count badge |
| 12px | Secondary metadata: categories, spec line, gallery notes |
| 13px | Default control text: labels, buttons, tabs, toasts, notes |
| 14px | Inputs, dialog body copy, empty states |
| 15px | Dialog titles (`font-semibold`, `tracking-[-0.01em]`) |
| 17px | Preset buttons (in each preset's heading face) |
| 20–34px | Font samples: picker rows 20px, font button 22px, saved items 22px, gallery tiles 34px |

- Numeric values use `tabular-nums` so sliders do not jitter.
- Labels are sentence case. There are no all-caps eyebrows.

### Preview

The preview renders user-chosen fonts through `fontStack()`, which appends a category fallback from `FALLBACK_STACKS`.

| Element | Typeface | Size and spacing |
| --- | --- | --- |
| Kicker | Body family and weight | `max(12px, body × 0.8)`, line height 1.4, `ink-3` |
| Heading (`h1`) | Heading style | `min(size px, size/720 × 100 cqi)`, `text-wrap: balance` |
| Subtitle | Heading family at the weight nearest 400 | `max(body × 1.3, min(heading × 0.38, body × 1.9))`, line height 1.34, half the heading tracking, max width 34em |
| Body | Body style | Exact settings, max width 34em (about 65–75 characters), `text-wrap: pretty`, hyphenation when justified |
| Spec footer | Interface font, 12px | "Fraunces Semibold, 68/1.04, −0.02em" |

## Color

All colors are Tailwind theme tokens defined in `@theme`, used as `bg-paper`, `text-ink-2`, `border-line` and so on. The interface is light-only (`color-scheme: light`).

| Token | Value | Use |
| --- | --- | --- |
| `paper` | `#f5f5f3` | Page background, nav, mobile sheet, inputs at rest |
| `sheet` | `#ffffff` | Preview sheet, dialogs, font button, active segment |
| `ink` | `#1d1d1f` | Primary text, primary buttons, active pills |
| `ink-2` | `#48484c` | Secondary text and labels |
| `ink-3` | `#6e6e73` | Tertiary text, icons, placeholders |
| `line` | `#e2e2de` | Hairline borders |
| `line-strong` | `#cfcfca` | Hover borders, slider track, slider thumb border |
| `hover` | `#ececea` | Hover fills, segmented and tab track |
| `accent` | `#0066cc` | Focus rings, focused input borders, selected check, wordmark caret |
| `accent-soft` | `#e6effa` | Defined, not currently used |
| `danger` | `#c2341b` | Font load errors, delete hover, storage warning |

Other values: text selection `#cfe1f7`, dialog backdrop `rgb(29 29 31 / 0.18)`, storage warning background `#fdf1ee`.

The background is a neutral, slightly warm off-white, not cream, so preview fonts are judged against near-white paper. Body copy on `paper` and `sheet` uses `ink` or `ink-2`, which pass WCAG AA comfortably. `ink-3` (about 4.9:1 on white) is reserved for supporting text.

## Spacing

Spacing uses the Tailwind 4 scale (0.25rem steps).

| Context | Values |
| --- | --- |
| Page gutters | `px-4` phone, `sm:px-8`, `lg:px-10`; content max width 1440px |
| Nav | Height `h-14` (56px), sticky |
| Preview sheet padding | `px-6 pt-10` phone, `sm:px-12 sm:pt-16`, `xl:px-20 xl:pt-20` |
| Preview to rail gap | `lg:gap-10`, rail width 320px (`xl`: 340px) |
| Control groups | `gap-6` between sections, `gap-5` between sliders, `gap-1.5` label to control |
| Dialogs | `px-6`, header `pt-5 pb-4`, footer `py-4` |
| Preview rhythm | Subtitle `mt-[0.9em]`, body `mt-[2.4em]`, so spacing scales with the type |

## Component styling

| Component | Style |
| --- | --- |
| Primary button | `bg-ink text-white`, `rounded-full`, `h-9`, hover `bg-black`, `active:scale-[0.98]` |
| Quiet button | Text only, `hover:bg-hover`, `rounded-full` |
| Toolbar buttons | Icon-only 36px circles below `xl`, icon plus label from `xl` |
| Pills (presets, categories) | `rounded-full`; active is `bg-ink text-white` |
| Segmented control and tabs | `bg-hover p-0.5 rounded-lg` track; active segment `bg-sheet` with a 1px shadow and 0.5px ring |
| Inputs | `rounded-lg border-line bg-paper`; focus turns the border `accent` and the background `sheet` |
| Sliders | Custom `.range`: 2px track filled with `ink` up to `--fill`, 14px white thumb with a `line-strong` border, scales to 1.15 while dragging |
| Font button | `rounded-xl border-line bg-sheet`, family name in its own face at 22px, chevron nudges right on hover |
| Preview sheet | `rounded-[18px] border-line bg-sheet`, no shadow |
| Toast | `bg-ink` pill, white 13px text, check icon, optional action button |

Shadows are used sparingly: dialogs (`0 24px 64px -24px rgb(0 0 0 / 0.25)`), the mobile sheet, toasts, active segments and hover states of the font button and gallery tiles.

## Border radii

Radius grows with the size of the surface.

| Radius | Use |
| --- | --- |
| `rounded-md` (6px) | Slider value fields, segments inside a track |
| `rounded-lg` (8px) | Inputs, segmented tracks, list rows in the picker |
| `rounded-xl` (12px) | Font button, saved items, gallery tiles, About logo panel |
| 14px | Dialogs (`dialog.sheet`); top corners only on phone bottom sheets |
| `rounded-2xl` (16px) | Mobile controls sheet |
| 18px | Preview sheet |
| `rounded-full` | Buttons, pills, badges, toasts, slider thumb, logo caret |

## Motion

| Interaction | Motion |
| --- | --- |
| Dialog open and close | Fade plus 8px rise and 0.99 scale, 200–240ms, `--ease-out-soft` (`cubic-bezier(0.22, 1, 0.36, 1)`), via `@starting-style` |
| Drawer | Slides in 24px from the right |
| Phone dialogs | Slide up 24px from the bottom edge |
| Backdrop | Fades to 18% ink |
| Mobile controls sheet | `transform` and `visibility`, 300ms, `--ease-out-soft` |
| Font loading | Preview text fades to 35% opacity while its face loads; font button name to 50% |
| Toast | `toast-in`: 8px rise and fade, 260ms |
| Buttons | Color transitions; primary buttons press to `scale(0.98)`, toolbar buttons to `0.97` |
| Logo caret | Blinks twice, 1.6s, starting 0.4s after load, then rests |

Font size, spacing and line height changes apply instantly. Animating them would lag behind the slider.

`prefers-reduced-motion: reduce` shortens every transition and animation to 0.01ms, including dialogs and backdrops. The caret blink and the loading spinner only run under `prefers-reduced-motion: no-preference` (`motion-safe:`).

## Responsive behavior

Desktop is the reference layout; smaller screens get a different arrangement, not a scaled copy.

| Width | Layout |
| --- | --- |
| ≥ 1280px (`xl`) | Preview plus 340px sticky rail; toolbar buttons show labels |
| 1024–1279px (`lg`) | Preview plus 320px rail; icon-only toolbar buttons |
| 640–1023px | Single column. Fixed bottom tab bar (Heading, Body, Text) opens a centered controls sheet, max 560px wide |
| < 640px | Same, with a full-width sheet and dialogs that become bottom sheets |

Phone and tablet details:

- The controls sheet is capped at 46% of the viewport height. While it is open, the page gains bottom padding so the whole preview can scroll above it.
- The closed sheet is `invisible`, which removes it from the tab order and accessibility tree.
- The preset row scrolls horizontally with a fading right edge.
- The heading scales with container width (`cqi`) so large settings fit. Body text keeps its real size so readability can be judged.
- Pages were checked for horizontal overflow at 375px, 768px and 1440px.

## Accessibility

- **Semantics:** `header`/`nav`/`main`/`aside`/`article`/`footer` landmarks, a single `h1` in the preview, `role="tablist"`/`tab`/`tabpanel` for control tabs, `role="radiogroup"` for segmented controls, `role="listbox"` with `aria-activedescendant` in the font picker.
- **Keyboard:** everything is reachable by Tab. Arrow keys move through segmented controls and font results, Enter selects a font, Escape closes dialogs and leaves editable text. Single-line editable fields blur on Enter.
- **Focus:** a 2px `accent` outline with 2px offset on `:focus-visible`, declared in `@layer base` so components can replace it (inputs show an accent border instead). Native dialogs trap focus and return it to the trigger.
- **Labels:** icon-only buttons have `aria-label`s; sliders pair a visible `<label>` with a labelled numeric field; the weight slider exposes `aria-valuetext` such as "Semibold 600"; editable preview elements are `role="textbox"` with names.
- **Status:** toasts and the font count announce through `aria-live="polite"`; the preset note updates politely; font load errors are shown as text, not only color.
- **Motion:** reduced-motion preferences are respected as described above.
- **Contrast:** primary and secondary text tokens meet WCAG AA on both background tokens.

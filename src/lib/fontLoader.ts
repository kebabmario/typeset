import { fontStack } from "./typography/config";
import { familyUrl } from "./typography/fontUrl";
import type { FontCategory } from "./typography/types";

const TIMEOUT_MS = 8000;
const loads = new Map<string, Promise<boolean>>();

function injectStylesheet(href: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLLinkElement>(`link[data-font-href="${CSS.escape(href)}"]`);
    if (existing) return resolve();
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.fontHref = href;
    link.onload = () => resolve();
    link.onerror = () => {
      link.remove();
      reject(new Error(`Stylesheet failed: ${href}`));
    };
    document.head.appendChild(link);
  });
}

const withTimeout = <T,>(p: Promise<T>, ms: number) =>
  Promise.race([
    p,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Font load timed out")), ms)),
  ]);

/**
 * Loads one family at one weight from Google Fonts. Resolves true when the face is usable,
 * false on network failure, unknown family, or timeout. Results are memoised per session,
 * but failures are evicted so a later attempt can retry.
 */
export function loadFont(family: string, weight: number): Promise<boolean> {
  const key = `${family}:${weight}`;
  const cached = loads.get(key);
  if (cached) return cached;

  const attempt = withTimeout(
    injectStylesheet(familyUrl(family, [weight])).then(() =>
      document.fonts.load(`${weight} 16px "${family}"`),
    ),
    TIMEOUT_MS,
  )
    .then((faces) => faces.length > 0)
    .catch(() => false)
    .then((ok) => {
      if (!ok) loads.delete(key);
      return ok;
    });

  loads.set(key, attempt);
  return attempt;
}

const sampleLoads = new Set<string>();

const hash = (text: string) => {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
};

/**
 * Alias under which a glyph subset registers. Unique per family and text, so subsets never
 * shadow the full face or each other.
 */
export const sampleFamily = (family: string, text: string) => `${family} S${hash(text)}`;

/**
 * Loads just the glyphs needed to draw a short string (a font's own name) for pickers and lists.
 * The CSS is rewritten to an alias family; render with `"<alias>", "<family>"` to use it.
 */
export function loadFontSample(family: string, weight = 400, text = family): void {
  const href = familyUrl(family, [weight], text);
  if (sampleLoads.has(href)) return;
  sampleLoads.add(href);
  fetch(href)
    .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
    .then((css) => {
      const style = document.createElement("style");
      style.textContent = css.replace(/font-family:\s*'[^']*'/g, `font-family: '${sampleFamily(family, text)}'`);
      document.head.appendChild(style);
    })
    .catch(() => sampleLoads.delete(href));
}

/** Font stack that prefers the name-only subset, then the full family, then the system fallback. */
export const sampleStack = (s: { family: string; category: FontCategory }, text: string = s.family) =>
  `"${sampleFamily(s.family, text)}", ${fontStack(s)}`;

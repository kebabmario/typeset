import {
  ALIGNMENTS,
  FONT_CATEGORIES,
  TRANSFORMS,
  type FontCategory,
  type Role,
  type SampleText,
  type TypeConfig,
  type TypeStyle,
} from "./types";

export interface Limit {
  min: number;
  max: number;
  step: number;
}

export const LIMITS: Record<Role, Record<"size" | "lineHeight" | "letterSpacing", Limit>> = {
  heading: {
    size: { min: 24, max: 160, step: 1 },
    lineHeight: { min: 0.8, max: 1.6, step: 0.01 },
    letterSpacing: { min: -0.1, max: 0.2, step: 0.005 },
  },
  body: {
    size: { min: 12, max: 28, step: 0.5 },
    lineHeight: { min: 1.1, max: 2.2, step: 0.01 },
    letterSpacing: { min: -0.05, max: 0.15, step: 0.005 },
  },
};

export const WEIGHT_NAMES: Record<number, string> = {
  100: "Thin",
  200: "ExtraLight",
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "Semibold",
  700: "Bold",
  800: "ExtraBold",
  900: "Black",
};

export const FALLBACK_STACKS: Record<FontCategory, string> = {
  "sans-serif": 'ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
  serif: 'ui-serif, Georgia, "Times New Roman", serif',
  display: 'ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif',
  monospace: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
};

/** Generic family used in exported CSS. */
export const GENERIC_FAMILY: Record<FontCategory, string> = {
  "sans-serif": "sans-serif",
  serif: "serif",
  display: "sans-serif",
  monospace: "monospace",
};

export const CATEGORY_LABELS: Record<FontCategory, string> = {
  "sans-serif": "Sans",
  serif: "Serif",
  display: "Display",
  monospace: "Mono",
};

export const DEFAULT_TEXT: SampleText = {
  kicker: "Notes on type, autumn edition",
  heading: "The shape of a letter decides how a sentence feels.",
  subtitle:
    "A field guide to choosing typefaces that work together, and to knowing why they do.",
  body:
    "Good pairings rarely come from two fonts that look alike. They come from contrast with a shared logic: a sharp display face set against a patient text face, or a geometric sans tempered by a warm, readable serif. The heading earns attention; the body keeps it.\n\nSet the body first. Find a size and line height you could read for ten minutes without strain, then let the heading grow from it. Tighten large type a little, loosen small caps a little, and trust your eye over the numbers.",
};

/** Family names that are safe to place in a CSS string and a Google Fonts URL. */
const FAMILY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 \-]{0,63}$/;

export const isValidFamily = (value: unknown): value is string =>
  typeof value === "string" && FAMILY_PATTERN.test(value);

const clamp = (n: number, { min, max }: Limit) => Math.min(max, Math.max(min, n));
const roundTo = (n: number, step: number) => Math.round(n / step) * step;
const tidy = (n: number) => Number(n.toFixed(3));

const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;

const num = (value: unknown, limit: Limit, fallback: number) =>
  typeof value === "number" && Number.isFinite(value)
    ? tidy(roundTo(clamp(value, limit), limit.step))
    : fallback;

/** Coerces untrusted input (URL, storage, imports) into a valid style, falling back field by field. */
export function sanitizeStyle(input: unknown, role: Role, fallback: TypeStyle): TypeStyle {
  if (!input || typeof input !== "object") return fallback;
  const s = input as Record<string, unknown>;
  const limits = LIMITS[role];
  const weight =
    typeof s.weight === "number" && Number.isInteger(s.weight) && s.weight >= 100 && s.weight <= 900
      ? Math.round(s.weight / 100) * 100
      : fallback.weight;
  return {
    family: isValidFamily(s.family) ? s.family : fallback.family,
    category: pick(s.category, FONT_CATEGORIES, fallback.category),
    weight,
    size: num(s.size, limits.size, fallback.size),
    lineHeight: num(s.lineHeight, limits.lineHeight, fallback.lineHeight),
    letterSpacing: num(s.letterSpacing, limits.letterSpacing, fallback.letterSpacing),
    align: pick(s.align, ALIGNMENTS, fallback.align),
    transform: pick(s.transform, TRANSFORMS, fallback.transform),
  };
}

export function sanitizeConfig(input: unknown, fallback: TypeConfig): TypeConfig | null {
  if (!input || typeof input !== "object") return null;
  const c = input as Record<string, unknown>;
  if (!c.heading || !c.body) return null;
  return {
    heading: sanitizeStyle(c.heading, "heading", fallback.heading),
    body: sanitizeStyle(c.body, "body", fallback.body),
  };
}

export function sanitizeText(input: unknown): SampleText {
  if (!input || typeof input !== "object") return DEFAULT_TEXT;
  const t = input as Record<string, unknown>;
  const field = (key: keyof SampleText, max: number) =>
    typeof t[key] === "string" ? (t[key] as string).slice(0, max) : DEFAULT_TEXT[key];
  return {
    kicker: field("kicker", 120),
    heading: field("heading", 300),
    subtitle: field("subtitle", 400),
    body: field("body", 4000),
  };
}

export const fontStack = (style: Pick<TypeStyle, "family" | "category">) =>
  `"${style.family}", ${FALLBACK_STACKS[style.category]}`;

/** Closest available weight to the target, preferring the lighter one on ties. */
export function nearestWeight(weights: number[], target: number): number {
  if (weights.length === 0) return target;
  return weights.reduce((best, w) =>
    Math.abs(w - target) < Math.abs(best - target) ? w : best,
  );
}

export const weightLabel = (w: number) => `${WEIGHT_NAMES[w] ?? "Weight"} ${w}`;

export const configsEqual = (a: TypeConfig, b: TypeConfig) =>
  JSON.stringify(a) === JSON.stringify(b);

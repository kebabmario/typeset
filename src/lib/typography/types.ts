export const FONT_CATEGORIES = ["sans-serif", "serif", "display", "monospace"] as const;
export type FontCategory = (typeof FONT_CATEGORIES)[number];

export interface FontFamily {
  family: string;
  category: FontCategory;
  /** Available upright weights, ascending. */
  weights: number[];
}

export const ALIGNMENTS = ["left", "center", "right", "justify"] as const;
export type TextAlign = (typeof ALIGNMENTS)[number];

export const TRANSFORMS = ["none", "uppercase", "lowercase", "capitalize"] as const;
export type TextTransform = (typeof TRANSFORMS)[number];

export type Role = "heading" | "body";

export interface TypeStyle {
  family: string;
  category: FontCategory;
  weight: number;
  /** px */
  size: number;
  /** unitless multiplier */
  lineHeight: number;
  /** em */
  letterSpacing: number;
  align: TextAlign;
  transform: TextTransform;
}

export interface TypeConfig {
  heading: TypeStyle;
  body: TypeStyle;
}

export interface SampleText {
  kicker: string;
  heading: string;
  subtitle: string;
  body: string;
}

export interface SavedCombination {
  id: string;
  name: string;
  createdAt: number;
  config: TypeConfig;
}

export interface Preset {
  id: string;
  name: string;
  note: string;
  config: TypeConfig;
}

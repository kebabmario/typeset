import type { FontCategory, Preset, TypeStyle } from "./types";

const style = (
  family: string,
  category: FontCategory,
  weight: number,
  size: number,
  lineHeight: number,
  letterSpacing: number,
  transform: TypeStyle["transform"] = "none",
): TypeStyle => ({ family, category, weight, size, lineHeight, letterSpacing, align: "left", transform });

export const PRESETS: Preset[] = [
  {
    id: "editorial",
    name: "Editorial",
    note: "A soft, high-contrast display serif over a serif drawn for long reads on screen.",
    config: {
      heading: style("Fraunces", "serif", 600, 68, 1.04, -0.02),
      body: style("Newsreader", "serif", 400, 19, 1.62, 0),
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    note: "One superfamily. Inter Tight for headlines, Inter for text, separated only by weight and tracking.",
    config: {
      heading: style("Inter Tight", "sans-serif", 500, 60, 1.04, -0.035),
      body: style("Inter", "sans-serif", 400, 17, 1.6, -0.005),
    },
  },
  {
    id: "modern",
    name: "Modern",
    note: "Bricolage brings quirky optical sizing; Figtree keeps the body calm and even.",
    config: {
      heading: style("Bricolage Grotesque", "sans-serif", 700, 64, 1.0, -0.03),
      body: style("Figtree", "sans-serif", 400, 17, 1.62, 0),
    },
  },
  {
    id: "classic",
    name: "Classic",
    note: "Two Garamond revivals: Cormorant's sharp display cut leading EB Garamond's sturdier text.",
    config: {
      heading: style("Cormorant Garamond", "serif", 600, 72, 1.05, -0.01),
      body: style("EB Garamond", "serif", 400, 20, 1.6, 0),
    },
  },
  {
    id: "technical",
    name: "Technical",
    note: "The Plex family shares its skeleton across sans and mono, so documentation reads as one voice.",
    config: {
      heading: style("IBM Plex Sans", "sans-serif", 600, 52, 1.1, -0.02),
      body: style("IBM Plex Mono", "monospace", 400, 15, 1.72, 0),
    },
  },
  {
    id: "bold",
    name: "Bold",
    note: "Condensed capitals for impact, with a wide, open grotesque underneath to balance the width.",
    config: {
      heading: style("Anton", "display", 400, 96, 0.96, 0.005, "uppercase"),
      body: style("Work Sans", "sans-serif", 400, 17, 1.62, 0),
    },
  },
  {
    id: "literary",
    name: "Literary",
    note: "Instrument Serif's condensed elegance paired with its matching sans companion.",
    config: {
      heading: style("Instrument Serif", "serif", 400, 80, 1.0, -0.015),
      body: style("Instrument Sans", "sans-serif", 400, 17, 1.6, 0),
    },
  },
  {
    id: "humanist",
    name: "Humanist",
    note: "DM Serif Display and DM Sans were designed together, sharing proportions and x-height.",
    config: {
      heading: style("DM Serif Display", "serif", 400, 64, 1.06, -0.01),
      body: style("DM Sans", "sans-serif", 400, 17, 1.62, 0),
    },
  },
  {
    id: "magazine",
    name: "Magazine",
    note: "Playfair's heavy cut has the drama of a cover line; Lato stays out of its way.",
    config: {
      heading: style("Playfair Display", "serif", 800, 72, 1.02, -0.02),
      body: style("Lato", "sans-serif", 400, 17, 1.65, 0),
    },
  },
  {
    id: "newspaper",
    name: "Newspaper",
    note: "Caslon headlines over Franklin text: the American newsroom pairing, one revival each.",
    config: {
      heading: style("Libre Caslon Text", "serif", 700, 56, 1.1, -0.01),
      body: style("Libre Franklin", "sans-serif", 400, 16, 1.62, 0),
    },
  },
  {
    id: "swiss",
    name: "Swiss",
    note: "One neo-grotesque, tight and heavy on top, open and regular below. Hierarchy by weight alone.",
    config: {
      heading: style("Hanken Grotesk", "sans-serif", 700, 64, 1.0, -0.035),
      body: style("Hanken Grotesk", "sans-serif", 400, 17, 1.55, 0),
    },
  },
  {
    id: "geometric",
    name: "Geometric",
    note: "Outfit's circles and straight lines, softened by Karla's slightly quirky grotesque text.",
    config: {
      heading: style("Outfit", "sans-serif", 600, 60, 1.05, -0.02),
      body: style("Karla", "sans-serif", 400, 17, 1.65, 0),
    },
  },
  {
    id: "luxury",
    name: "Luxury",
    note: "Hairline Didone contrast with light, widely tracked Montserrat. Give it room to breathe.",
    config: {
      heading: style("Bodoni Moda", "serif", 500, 76, 1.02, -0.01),
      body: style("Montserrat", "sans-serif", 300, 15, 1.8, 0.02),
    },
  },
  {
    id: "startup",
    name: "Startup",
    note: "Plus Jakarta's friendly geometry at two weights. Confident headlines, easy product copy.",
    config: {
      heading: style("Plus Jakarta Sans", "sans-serif", 700, 58, 1.05, -0.03),
      body: style("Plus Jakarta Sans", "sans-serif", 400, 17, 1.6, 0),
    },
  },
  {
    id: "bookish",
    name: "Bookish",
    note: "Literata was drawn for e-books. A single family, set generously for long reading.",
    config: {
      heading: style("Literata", "serif", 600, 56, 1.1, -0.01),
      body: style("Literata", "serif", 400, 19, 1.7, 0),
    },
  },
  {
    id: "scholarly",
    name: "Scholarly",
    note: "Spectral's sharp, screen-first serif with Source Sans for notes and captions.",
    config: {
      heading: style("Spectral", "serif", 600, 58, 1.08, -0.01),
      body: style("Source Sans 3", "sans-serif", 400, 18, 1.65, 0),
    },
  },
  {
    id: "code",
    name: "Code",
    note: "A monospaced headline signals developer tools; Inter keeps the explanation readable.",
    config: {
      heading: style("JetBrains Mono", "monospace", 700, 48, 1.1, -0.03),
      body: style("Inter", "sans-serif", 400, 16, 1.6, 0),
    },
  },
  {
    id: "playful",
    name: "Playful",
    note: "Fredoka's rounded terminals feel warm and approachable over a soft Nunito Sans.",
    config: {
      heading: style("Fredoka", "display", 600, 64, 1.05, -0.01),
      body: style("Nunito Sans", "sans-serif", 400, 17, 1.65, 0),
    },
  },
  {
    id: "brutalist",
    name: "Brutalist",
    note: "Blunt black capitals against a typewriter mono. Raw on purpose.",
    config: {
      heading: style("Archivo Black", "display", 400, 80, 0.95, -0.03, "uppercase"),
      body: style("Space Mono", "monospace", 400, 15, 1.6, 0),
    },
  },
  {
    id: "elegant",
    name: "Elegant",
    note: "Cormorant's calligraphic serifs with Raleway's thin, airy text for a quiet, refined page.",
    config: {
      heading: style("Cormorant", "serif", 500, 80, 1.0, 0),
      body: style("Raleway", "sans-serif", 400, 16, 1.75, 0.01),
    },
  },
  {
    id: "poster",
    name: "Poster",
    note: "Bebas Neue is built to be huge. Barlow shares its straight-sided DNA at reading size.",
    config: {
      heading: style("Bebas Neue", "display", 400, 112, 0.92, 0.01),
      body: style("Barlow", "sans-serif", 400, 17, 1.6, 0),
    },
  },
  {
    id: "gallery",
    name: "Gallery",
    note: "Syne's wide, stretched letters for an art-world voice, grounded by neutral Manrope.",
    config: {
      heading: style("Syne", "display", 700, 64, 1.0, -0.02),
      body: style("Manrope", "sans-serif", 400, 16, 1.65, 0),
    },
  },
];

export const DEFAULT_CONFIG = PRESETS[0].config;

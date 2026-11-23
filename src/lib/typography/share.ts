import { sanitizeConfig } from "./config";
import { DEFAULT_CONFIG } from "./presets";
import type { TypeConfig, TypeStyle } from "./types";

export const SHARE_PARAM = "t";

// Compact tuple order keeps share links short.
type Packed = [string, string, number, number, number, number, string, string];

const pack = (s: TypeStyle): Packed => [
  s.family,
  s.category,
  s.weight,
  s.size,
  s.lineHeight,
  s.letterSpacing,
  s.align,
  s.transform,
];

const unpack = (p: unknown) => {
  if (!Array.isArray(p)) return null;
  const [family, category, weight, size, lineHeight, letterSpacing, align, transform] = p;
  return { family, category, weight, size, lineHeight, letterSpacing, align, transform };
};

const toBase64Url = (text: string) => {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const fromBase64Url = (value: string) => {
  const b64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
};

export function encodeConfig(config: TypeConfig): string {
  return toBase64Url(JSON.stringify({ v: 1, h: pack(config.heading), b: pack(config.body) }));
}

/** Returns null for anything that is not a well-formed v1 payload. */
export function decodeConfig(value: string | null): TypeConfig | null {
  if (!value || value.length > 1000 || !/^[A-Za-z0-9_-]+$/.test(value)) return null;
  try {
    const data: unknown = JSON.parse(fromBase64Url(value));
    if (!data || typeof data !== "object" || (data as { v?: unknown }).v !== 1) return null;
    const { h, b } = data as { h: unknown; b: unknown };
    return sanitizeConfig({ heading: unpack(h), body: unpack(b) }, DEFAULT_CONFIG);
  } catch {
    return null;
  }
}

export function shareUrl(config: TypeConfig, base: string): string {
  const url = new URL(base);
  url.search = "";
  url.hash = "";
  url.searchParams.set(SHARE_PARAM, encodeConfig(config));
  return url.toString();
}

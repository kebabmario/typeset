"use client";

import { useEffect, useMemo, useState } from "react";
import { CURATED_FONTS } from "@/lib/typography/catalog";
import { readJson, STORAGE_KEYS, writeJson } from "@/lib/storage";
import type { FontFamily } from "@/lib/typography/types";

const TTL_MS = 24 * 60 * 60 * 1000;

interface Cached {
  at: number;
  source: "google" | "curated";
  fonts: FontFamily[];
}

const isFontList = (v: unknown): v is FontFamily[] =>
  Array.isArray(v) &&
  v.every(
    (f) =>
      f &&
      typeof f.family === "string" &&
      typeof f.category === "string" &&
      Array.isArray(f.weights) &&
      f.weights.every((w: unknown) => typeof w === "number"),
  );

function readCache(): Cached | null {
  const c = readJson(STORAGE_KEYS.catalog) as Partial<Cached> | null;
  if (!c || typeof c.at !== "number" || !isFontList(c.fonts)) return null;
  if (Date.now() - c.at > TTL_MS) return null;
  return c as Cached;
}

/** Curated list immediately, upgraded to the full Google catalog when the server has an API key. */
export function useFontCatalog() {
  const [state, setState] = useState(() => {
    const cached = readCache();
    return cached
      ? { fonts: cached.fonts, source: cached.source, fresh: true }
      : { fonts: CURATED_FONTS, source: "curated" as const, fresh: false };
  });

  useEffect(() => {
    if (state.fresh) return;
    const controller = new AbortController();
    fetch("/api/fonts", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data: { source?: unknown; fonts?: unknown }) => {
        if (!isFontList(data.fonts) || data.fonts.length === 0) return;
        const source = data.source === "google" ? "google" : "curated";
        writeJson(STORAGE_KEYS.catalog, { at: Date.now(), source, fonts: data.fonts });
        setState({ fonts: data.fonts, source, fresh: true });
      })
      .catch(() => {
        /* Keep the bundled list. */
      });
    return () => controller.abort();
  }, [state.fresh]);

  const byFamily = useMemo(() => {
    const map = new Map<string, FontFamily>();
    for (const f of CURATED_FONTS) map.set(f.family, f);
    for (const f of state.fonts) map.set(f.family, f);
    return map;
  }, [state.fonts]);

  return { fonts: state.fonts, source: state.source, byFamily };
}

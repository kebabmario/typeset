"use client";

import { useCallback, useState } from "react";
import { sanitizeConfig } from "@/lib/typography/config";
import { DEFAULT_CONFIG } from "@/lib/typography/presets";
import { readJson, STORAGE_KEYS, writeJson } from "@/lib/storage";
import type { SavedCombination, TypeConfig } from "@/lib/typography/types";

const MAX_SAVED = 100;

/** Drops any stored entry that no longer validates instead of failing the whole list. */
function readSaved(): SavedCombination[] {
  const raw = readJson(STORAGE_KEYS.saved);
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item): SavedCombination[] => {
    if (!item || typeof item !== "object") return [];
    const { id, name, createdAt, config } = item as Record<string, unknown>;
    const clean = sanitizeConfig(config, DEFAULT_CONFIG);
    if (typeof id !== "string" || typeof name !== "string" || !clean) return [];
    return [{ id, name: name.slice(0, 80), createdAt: Number(createdAt) || 0, config: clean }];
  });
}

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;

export function useSavedCombinations() {
  const [saved, setSaved] = useState<SavedCombination[]>(readSaved);
  const [persistFailed, setPersistFailed] = useState(false);

  const commit = useCallback((next: SavedCombination[]) => {
    setSaved(next);
    setPersistFailed(!writeJson(STORAGE_KEYS.saved, next));
  }, []);

  const save = useCallback(
    (name: string, config: TypeConfig) => {
      const entry: SavedCombination = {
        id: newId(),
        name: name.trim().slice(0, 80) || "Untitled pairing",
        createdAt: Date.now(),
        config,
      };
      commit([entry, ...saved].slice(0, MAX_SAVED));
      return entry;
    },
    [saved, commit],
  );

  const remove = useCallback(
    (id: string) => {
      const index = saved.findIndex((s) => s.id === id);
      if (index === -1) return null;
      const removed = saved[index];
      commit(saved.filter((s) => s.id !== id));
      return { removed, index };
    },
    [saved, commit],
  );

  const restore = useCallback(
    (entry: SavedCombination, index: number) => {
      const next = saved.filter((s) => s.id !== entry.id);
      next.splice(Math.min(index, next.length), 0, entry);
      commit(next);
    },
    [saved, commit],
  );

  return { saved, save, remove, restore, persistFailed };
}

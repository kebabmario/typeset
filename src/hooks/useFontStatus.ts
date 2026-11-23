"use client";

import { useEffect, useState } from "react";
import { loadFont } from "@/lib/fontLoader";

export type FontStatus = "loading" | "ready" | "error";

/** Loads each family/weight pair and reports its status, keyed so changes never show stale results. */
export function useFontStatus(requests: { family: string; weight: number }[]) {
  const [statuses, setStatuses] = useState<Record<string, FontStatus>>({});
  const keys = requests.map((r) => `${r.family}:${r.weight}`);
  const signature = keys.join("|");

  useEffect(() => {
    let active = true;
    for (const key of signature.split("|")) {
      const i = key.lastIndexOf(":");
      const family = key.slice(0, i);
      const weight = Number(key.slice(i + 1));
      loadFont(family, weight).then((ok) => {
        if (active) setStatuses((s) => ({ ...s, [key]: ok ? "ready" : "error" }));
      });
    }
    return () => {
      active = false;
    };
  }, [signature]);

  return keys.map((k) => statuses[k] ?? "loading");
}

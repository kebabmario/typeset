"use client";

import { useEffect, useState } from "react";
import { presetLabel } from "./PresetBar";
import { Dialog } from "./ui/Dialog";
import { loadFontSample, sampleStack } from "@/lib/fontLoader";
import { CATEGORY_LABELS } from "@/lib/typography/config";
import { PRESETS } from "@/lib/typography/presets";
import { FONT_CATEGORIES, type FontCategory, type Preset } from "@/lib/typography/types";

interface PresetGalleryProps {
  open: boolean;
  onClose: () => void;
  activeId: string | null;
  onSelect: (preset: Preset) => void;
}

const BODY_SAMPLE = "Set the body first, then let the heading grow from it.";
type Filter = FontCategory | "all";

/** Filters by the heading's category, which sets the tone of a pairing. */
const usedCategories = FONT_CATEGORIES.filter((c) => PRESETS.some((p) => p.config.heading.category === c));

export function PresetGallery({ open, onClose, activeId, onSelect }: PresetGalleryProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const shown = PRESETS.filter((p) => filter === "all" || p.config.heading.category === filter);

  useEffect(() => {
    if (!open) return;
    for (const p of PRESETS) {
      const { heading: h, body: b } = p.config;
      loadFontSample(h.family, h.weight, presetLabel(p));
      loadFontSample(b.family, b.weight, BODY_SAMPLE);
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Presets"
      description="Curated pairings with tuned size, spacing and rhythm. Pick one, then make it yours."
      width={880}
    >
      <div className="no-scrollbar -mx-6 mb-4 flex gap-1 overflow-x-auto px-6" role="group" aria-label="Heading style">
        {(["all", ...usedCategories] as const).map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={filter === c}
            onClick={() => setFilter(c)}
            className={`h-7 shrink-0 rounded-full px-3 text-[13px] transition-colors ${
              filter === c ? "bg-ink text-white" : "text-ink-2 hover:bg-hover"
            }`}
          >
            {c === "all" ? "All" : `${CATEGORY_LABELS[c]} headings`}
          </button>
        ))}
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {shown.map((p) => {
          const { heading: h, body: b } = p.config;
          const active = p.id === activeId;
          return (
            <li key={p.id}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => {
                  onSelect(p);
                  onClose();
                }}
                className={`group flex h-full w-full flex-col rounded-xl border p-5 text-left transition-[border-color,background-color,box-shadow] ${
                  active
                    ? "border-ink bg-sheet"
                    : "border-line bg-sheet hover:border-line-strong hover:shadow-[0_2px_8px_-4px_rgb(0_0_0/0.12)]"
                }`}
              >
                <span
                  className="block truncate text-[34px] leading-[1.1] text-ink"
                  style={{
                    fontFamily: sampleStack(h, presetLabel(p)),
                    fontWeight: h.weight,
                    textTransform: h.transform,
                    letterSpacing: `${Math.min(h.letterSpacing, 0)}em`,
                  }}
                >
                  {p.name}
                </span>
                <span
                  className="mt-2 line-clamp-2 text-[15px] leading-[1.5] text-ink-2"
                  style={{ fontFamily: sampleStack(b, BODY_SAMPLE), fontWeight: b.weight }}
                >
                  {BODY_SAMPLE}
                </span>
                <span className="mt-4 border-t border-line pt-3 text-[12px] leading-5 text-ink-3">
                  {h.family} and {b.family}
                </span>
                <span className="mt-1 text-[12px] leading-5 text-ink-3">{p.note}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </Dialog>
  );
}

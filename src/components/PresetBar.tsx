"use client";

import { LayoutGrid } from "lucide-react";
import { useEffect, useRef } from "react";
import { loadFontSample, sampleStack } from "@/lib/fontLoader";
import { PRESETS } from "@/lib/typography/presets";
import type { Preset } from "@/lib/typography/types";

interface PresetBarProps {
  activeId: string | null;
  onSelect: (preset: Preset) => void;
  onOpenGallery: () => void;
}

/** The glyphs actually drawn for a preset name, so the subset request matches what renders. */
export const presetLabel = (p: Preset) =>
  p.config.heading.transform === "uppercase" ? p.name.toUpperCase() : p.name;

/** Each preset name is set in its own heading face, so the list doubles as a specimen. */
export function PresetBar({ activeId, onSelect, onOpenGallery }: PresetBarProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    for (const p of PRESETS) loadFontSample(p.config.heading.family, p.config.heading.weight, presetLabel(p));
  }, []);

  // Bring the active preset into view, e.g. after picking it from the gallery.
  useEffect(() => {
    if (!activeId) return;
    listRef.current
      ?.querySelector(`[data-preset="${activeId}"]`)
      ?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [activeId]);

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onOpenGallery}
        aria-label={`All ${PRESETS.length} presets`}
        className="flex h-10 shrink-0 items-center gap-2 rounded-full pr-3 pl-2.5 text-[13px] text-ink-2 transition-colors hover:bg-hover hover:text-ink sm:pr-4"
      >
        <LayoutGrid size={16} strokeWidth={1.75} aria-hidden />
        <span className="max-sm:sr-only">All {PRESETS.length}</span>
      </button>
      <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-line" />
      <div
        ref={listRef}
        role="group"
        aria-label="Presets"
        className="no-scrollbar flex min-w-0 flex-1 gap-1 overflow-x-auto pr-6 [mask-image:linear-gradient(to_right,black_calc(100%-28px),transparent)]"
      >
        {PRESETS.map((p) => {
          const active = p.id === activeId;
          const h = p.config.heading;
          return (
            <button
              key={p.id}
              data-preset={p.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(p)}
              className={`h-10 shrink-0 rounded-full px-4 text-[17px] transition-colors duration-200 ${
                active ? "bg-ink text-white" : "text-ink-2 hover:bg-hover hover:text-ink"
              }`}
              style={{
                fontFamily: sampleStack(h, presetLabel(p)),
                fontWeight: h.weight,
                textTransform: h.transform,
                letterSpacing: h.transform === "uppercase" ? "0.02em" : undefined,
              }}
            >
              {p.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

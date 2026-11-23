"use client";

import { RotateCcw } from "lucide-react";
import { useId } from "react";
import type { SampleText } from "@/lib/typography/types";

interface TextPanelProps {
  text: SampleText;
  onChange: (patch: Partial<SampleText>) => void;
  onReset: () => void;
  isDefault: boolean;
}

const FIELDS: { key: keyof SampleText; label: string; rows: number }[] = [
  { key: "kicker", label: "Kicker", rows: 1 },
  { key: "heading", label: "Heading", rows: 2 },
  { key: "subtitle", label: "Subtitle", rows: 3 },
  { key: "body", label: "Body", rows: 9 },
];

export function TextPanel({ text, onChange, onReset, isDefault }: TextPanelProps) {
  const id = useId();
  return (
    <div className="grid gap-5">
      <p className="text-[13px] leading-5 text-ink-3">
        Edit here, or click any text in the preview and type.
      </p>
      {FIELDS.map((f) => (
        <div key={f.key} className="grid gap-1.5">
          <label htmlFor={`${id}-${f.key}`} className="text-[13px] text-ink-2">
            {f.label}
          </label>
          <textarea
            id={`${id}-${f.key}`}
            rows={f.rows}
            value={text[f.key]}
            onChange={(e) => onChange({ [f.key]: e.target.value })}
            className="resize-y rounded-lg border border-line bg-sheet px-3 py-2 text-[14px] leading-[1.5] outline-none transition-colors focus:border-accent focus-visible:outline-none"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={onReset}
        disabled={isDefault}
        className="flex h-9 items-center justify-center gap-2 rounded-full text-[13px] text-ink-2 transition-colors hover:bg-hover hover:text-ink disabled:pointer-events-none disabled:opacity-40"
      >
        <RotateCcw size={14} strokeWidth={1.75} aria-hidden /> Restore sample text
      </button>
    </div>
  );
}

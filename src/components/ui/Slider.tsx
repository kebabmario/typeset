"use client";

import { useId, useState } from "react";

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  unit?: string;
  /** Multiplier between stored and typed value, e.g. 1000 to edit em in thousandths. */
  inputScale?: number;
}

const decimals = (step: number) => (step.toString().split(".")[1] ?? "").length;

/** Range input with a typable numeric field. The field commits on Enter or blur. */
export function Slider({ label, value, min, max, step, onChange, unit, inputScale = 1 }: SliderProps) {
  const id = useId();
  const shown = Number((value * inputScale).toFixed(Math.max(0, decimals(step * inputScale))));
  const [draft, setDraft] = useState<string | null>(null);
  const fill = ((value - min) / (max - min)) * 100;

  const commit = () => {
    if (draft === null) return;
    const parsed = Number.parseFloat(draft);
    setDraft(null);
    if (!Number.isFinite(parsed)) return;
    const next = Math.min(max, Math.max(min, Math.round(parsed / inputScale / step) * step));
    onChange(Number(next.toFixed(decimals(step))));
  };

  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-[13px] text-ink-2">
          {label}
        </label>
        <span className="flex items-center gap-1 text-[13px] tabular-nums text-ink">
          <input
            type="text"
            inputMode="decimal"
            aria-label={`${label} value${unit ? ` in ${unit}` : ""}`}
            value={draft ?? String(shown)}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") setDraft(null);
            }}
            className="w-14 rounded-md bg-transparent px-1.5 py-0.5 text-right outline-none transition-colors hover:bg-hover focus:bg-hover focus-visible:outline-2 focus-visible:outline-accent"
          />
          {unit && <span className="w-5 text-ink-3">{unit}</span>}
        </span>
      </div>
      <input
        id={id}
        type="range"
        className="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--fill": `${fill}%` } as React.CSSProperties}
      />
    </div>
  );
}

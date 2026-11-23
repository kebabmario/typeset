"use client";

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ChevronDown,
  ChevronRight,
  LoaderCircle,
  TriangleAlert,
} from "lucide-react";
import { useId, useState } from "react";
import { Segmented } from "./ui/Segmented";
import { Slider } from "./ui/Slider";
import type { FontStatus } from "@/hooks/useFontStatus";
import { CATEGORY_LABELS, LIMITS, fontStack, weightLabel } from "@/lib/typography/config";
import type { FontFamily, Role, TextAlign, TextTransform, TypeStyle } from "@/lib/typography/types";

interface StylePanelProps {
  role: Role;
  style: TypeStyle;
  font: FontFamily | undefined;
  status: FontStatus;
  onChange: (patch: Partial<TypeStyle>) => void;
  onOpenPicker: () => void;
}

const ALIGN_OPTIONS: { value: TextAlign; label: string; icon: React.ReactNode }[] = [
  { value: "left", label: "Align left", icon: <AlignLeft size={15} strokeWidth={1.75} /> },
  { value: "center", label: "Align center", icon: <AlignCenter size={15} strokeWidth={1.75} /> },
  { value: "right", label: "Align right", icon: <AlignRight size={15} strokeWidth={1.75} /> },
  { value: "justify", label: "Justify", icon: <AlignJustify size={15} strokeWidth={1.75} /> },
];

const CASE_OPTIONS: { value: TextTransform; label: string }[] = [
  { value: "none", label: "As typed" },
  { value: "uppercase", label: "AB" },
  { value: "lowercase", label: "ab" },
  { value: "capitalize", label: "Ab" },
];

export function StylePanel({ role, style, font, status, onChange, onOpenPicker }: StylePanelProps) {
  const limits = LIMITS[role];
  const weights = font?.weights ?? [style.weight];
  const [advancedOpen, setAdvancedOpen] = useState(style.align !== "left" || style.transform !== "none");
  const advancedId = useId();

  return (
    <div className="grid gap-6">
      <button
        type="button"
        onClick={onOpenPicker}
        aria-label={`${role === "heading" ? "Heading" : "Body"} font: ${style.family}. Change font`}
        className="group flex w-full items-center justify-between gap-3 rounded-xl border border-line bg-sheet px-4 py-3 text-left transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-[0_1px_3px_rgb(0_0_0/0.05)]"
      >
        <span className="min-w-0">
          <span
            className="block truncate text-[22px] leading-8 text-ink transition-opacity duration-300"
            style={{ fontFamily: fontStack(style), fontWeight: style.weight, opacity: status === "loading" ? 0.5 : 1 }}
          >
            {style.family}
          </span>
          <span className="flex items-center gap-1.5 text-[12px] text-ink-3">
            {status === "loading" && (
              <>
                <LoaderCircle size={12} className="motion-safe:animate-spin" aria-hidden /> Loading
              </>
            )}
            {status === "error" && (
              <span className="flex items-center gap-1 text-danger">
                <TriangleAlert size={12} aria-hidden /> Couldn’t load. Showing a system fallback.
              </span>
            )}
            {status === "ready" && <>{CATEGORY_LABELS[style.category]}</>}
          </span>
        </span>
        <ChevronRight
          size={16}
          strokeWidth={1.75}
          className="shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </button>

      <div className="grid gap-5">
        {weights.length > 1 ? (
          <WeightSlider weights={weights} value={style.weight} onChange={(weight) => onChange({ weight })} />
        ) : (
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-ink-2">Weight</span>
            <span className="text-ink">{weightLabel(weights[0])}, the only weight</span>
          </div>
        )}
        <Slider
          label="Size"
          unit="px"
          {...limits.size}
          value={style.size}
          onChange={(size) => onChange({ size })}
        />
        <Slider
          label="Line height"
          {...limits.lineHeight}
          value={style.lineHeight}
          onChange={(lineHeight) => onChange({ lineHeight })}
        />
        <Slider
          label="Letter spacing"
          unit="em"
          {...limits.letterSpacing}
          value={style.letterSpacing}
          onChange={(letterSpacing) => onChange({ letterSpacing })}
        />
      </div>

      <div className="border-t border-line pt-4">
        <button
          type="button"
          aria-expanded={advancedOpen}
          aria-controls={advancedId}
          onClick={() => setAdvancedOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded-md text-[13px] text-ink-2 transition-colors hover:text-ink"
        >
          Alignment and case
          <ChevronDown
            size={15}
            strokeWidth={1.75}
            className={`transition-transform duration-200 ${advancedOpen ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
        <div
          id={advancedId}
          hidden={!advancedOpen}
          className="mt-4 grid gap-4"
        >
          <div className="grid gap-1.5">
            <span className="text-[12px] text-ink-3">Alignment</span>
            <Segmented
              label="Text alignment"
              iconOnly
              value={style.align}
              options={ALIGN_OPTIONS}
              onChange={(align) => onChange({ align })}
            />
          </div>
          <div className="grid gap-1.5">
            <span className="text-[12px] text-ink-3">Case</span>
            <Segmented
              label="Text case"
              value={style.transform}
              options={CASE_OPTIONS}
              onChange={(transform) => onChange({ transform })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function WeightSlider({ weights, value, onChange }: { weights: number[]; value: number; onChange: (w: number) => void }) {
  const id = useId();
  const index = Math.max(0, weights.indexOf(value));
  const fill = (index / (weights.length - 1)) * 100;
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between text-[13px]">
        <label htmlFor={id} className="text-ink-2">
          Weight
        </label>
        <span className="px-1.5 tabular-nums text-ink">{weightLabel(weights[index])}</span>
      </div>
      <input
        id={id}
        type="range"
        className="range"
        min={0}
        max={weights.length - 1}
        step={1}
        value={index}
        aria-valuetext={weightLabel(weights[index])}
        onChange={(e) => onChange(weights[Number(e.target.value)])}
        style={{ "--fill": `${fill}%` } as React.CSSProperties}
      />
    </div>
  );
}

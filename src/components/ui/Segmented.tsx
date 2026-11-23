"use client";

import { useRef, type ReactNode } from "react";

interface Option<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface SegmentedProps<T extends string> {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  iconOnly?: boolean;
}

/** Radio group drawn as a segmented control. Arrow keys move and select, per the ARIA radio pattern. */
export function Segmented<T extends string>({ label, value, options, onChange, iconOnly }: SegmentedProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (delta: number) => {
    const i = options.findIndex((o) => o.value === value);
    const next = (i + delta + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex rounded-lg bg-hover p-0.5"
      onKeyDown={(e) => {
        const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (delta) {
          e.preventDefault();
          move(delta);
        }
      }}
    >
      {options.map((o, i) => {
        const checked = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={iconOnly ? o.label : undefined}
            title={iconOnly ? o.label : undefined}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(o.value)}
            className={`flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md text-[13px] transition-[background-color,color,box-shadow] duration-150 ${
              checked
                ? "bg-sheet text-ink shadow-[0_1px_2px_rgb(0_0_0/0.08),0_0_0_0.5px_rgb(0_0_0/0.06)]"
                : "text-ink-3 hover:text-ink"
            }`}
          >
            {o.icon}
            {!iconOnly && o.label}
          </button>
        );
      })}
    </div>
  );
}

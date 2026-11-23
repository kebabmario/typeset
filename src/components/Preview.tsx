"use client";

import { Editable } from "./Editable";
import type { FontStatus } from "@/hooks/useFontStatus";
import { WEIGHT_NAMES, fontStack } from "@/lib/typography/config";
import type { SampleText, TypeConfig, TypeStyle } from "@/lib/typography/types";

interface PreviewProps {
  config: TypeConfig;
  subtitleWeight: number;
  text: SampleText;
  onTextChange: (patch: Partial<SampleText>) => void;
  status: { heading: FontStatus; subtitle: FontStatus; body: FontStatus };
}

/** Width at which the heading renders at its true size; narrower sheets scale it down. */
const REFERENCE_WIDTH = 720;

const fade = (s: FontStatus) => ({ opacity: s === "loading" ? 0.35 : 1 });

const specLine = (s: TypeStyle) => {
  const tracking = s.letterSpacing === 0 ? "" : `, ${s.letterSpacing > 0 ? "+" : "−"}${Math.abs(s.letterSpacing)}em`;
  return `${s.family} ${WEIGHT_NAMES[s.weight] ?? s.weight}, ${s.size}/${s.lineHeight}${tracking}`;
};

export function Preview({ config, subtitleWeight, text, onTextChange, status }: PreviewProps) {
  const { heading: h, body: b } = config;
  const subtitleSize = Math.round(Math.max(b.size * 1.3, Math.min(h.size * 0.38, b.size * 1.9)));

  return (
    <article
      aria-label="Typography preview"
      className="@container rounded-[18px] border border-line bg-sheet px-6 pt-10 pb-8 sm:px-12 sm:pt-16 sm:pb-10 xl:px-20 xl:pt-20"
    >
      <Editable
        as="p"
        label="Kicker text"
        placeholder="Kicker"
        value={text.kicker}
        onChange={(kicker) => onTextChange({ kicker })}
        className="mb-6 w-fit text-ink-3"
        style={{
          fontFamily: fontStack(b),
          fontWeight: b.weight,
          fontSize: Math.max(12, b.size * 0.8),
          letterSpacing: "0.01em",
          lineHeight: 1.4,
          textAlign: b.align === "justify" ? "left" : b.align,
          marginInline: b.align === "center" ? "auto" : b.align === "right" ? "auto 0" : undefined,
          ...fade(status.body),
        }}
      />
      <Editable
        as="h1"
        label="Heading text"
        placeholder="Heading"
        value={text.heading}
        onChange={(heading) => onTextChange({ heading })}
        className="text-ink"
        style={{
          fontFamily: fontStack(h),
          fontWeight: h.weight,
          fontSize: `min(${h.size}px, ${((h.size / REFERENCE_WIDTH) * 100).toFixed(2)}cqi)`,
          lineHeight: h.lineHeight,
          letterSpacing: `${h.letterSpacing}em`,
          textAlign: h.align,
          textTransform: h.transform,
          textWrap: "balance",
          ...fade(status.heading),
        }}
      />
      <Editable
        as="p"
        label="Subtitle text"
        placeholder="Subtitle"
        value={text.subtitle}
        onChange={(subtitle) => onTextChange({ subtitle })}
        className="mt-[0.9em] max-w-[34em] text-ink-2"
        style={{
          fontFamily: fontStack(h),
          fontWeight: subtitleWeight,
          fontSize: `min(${subtitleSize}px, ${((subtitleSize / REFERENCE_WIDTH) * 140).toFixed(2)}cqi)`,
          lineHeight: 1.34,
          letterSpacing: `${Number((h.letterSpacing / 2).toFixed(3))}em`,
          textAlign: h.align,
          marginInline: h.align === "center" ? "auto" : h.align === "right" ? "auto 0" : undefined,
          textWrap: "pretty",
          ...fade(status.subtitle),
        }}
      />
      <Editable
        as="div"
        multiline
        label="Body text"
        placeholder="Body text"
        value={text.body}
        onChange={(body) => onTextChange({ body })}
        className="mt-[2.4em] max-w-[34em] whitespace-pre-line text-ink"
        style={{
          fontFamily: fontStack(b),
          fontWeight: b.weight,
          fontSize: b.size,
          lineHeight: b.lineHeight,
          letterSpacing: `${b.letterSpacing}em`,
          textAlign: b.align,
          textTransform: b.transform,
          marginInline: b.align === "center" ? "auto" : b.align === "right" ? "auto 0" : undefined,
          hyphens: b.align === "justify" ? "auto" : "manual",
          textWrap: "pretty",
          ...fade(status.body),
        }}
      />

      <footer className="mt-14 grid gap-1 border-t border-line pt-4 text-[12px] leading-5 text-ink-3 sm:mt-20 sm:grid-cols-2 sm:gap-6">
        <p>
          <span className="text-ink-2">Heading</span> {specLine(h)}
        </p>
        <p>
          <span className="text-ink-2">Body</span> {specLine(b)}
        </p>
      </footer>
    </article>
  );
}

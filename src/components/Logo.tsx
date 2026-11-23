import { MARK, WORDMARK } from "./logo-paths";

/** "typeset" with a text caret: the product is live, editable type. Letters follow currentColor. */
export function Wordmark({ className, blink = false }: { className?: string; blink?: boolean }) {
  const c = WORDMARK.caret;
  return (
    <svg viewBox={WORDMARK.viewBox} className={className} role="img" aria-label="TYPESET">
      <path d={WORDMARK.letters} fill="currentColor" />
      <rect
        x={c.x}
        y={c.y}
        width={c.w}
        height={c.h}
        rx={c.w / 2}
        className={`fill-accent ${blink ? "caret-blink" : ""}`}
      />
    </svg>
  );
}

/** App icon: the wordmark's t beside the same caret, on a type-sort square. */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  const c = MARK.caret;
  return (
    <svg viewBox="0 0 64 64" className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <rect width="64" height="64" rx="15" fill="#1d1d1f" />
      <path d={MARK.t} transform={MARK.tTransform} fill="#fff" />
      <rect x={c.x} y={c.y} width={c.w} height={c.h} rx={c.w / 2} fill="#4c9bff" />
    </svg>
  );
}

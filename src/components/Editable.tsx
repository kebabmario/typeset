"use client";

import { useEffect, useRef, type CSSProperties, type ElementType } from "react";

interface EditableProps {
  as: ElementType;
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
  multiline?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Plain-text contentEditable that stays uncontrolled while typing (so the caret never jumps)
 * and only syncs from props when the value changes elsewhere, e.g. the Text tab or a reset.
 */
export function Editable({ as: Tag, value, onChange, label, placeholder, multiline, className, style }: EditableProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && el.innerText !== value) el.innerText = value;
  }, [value]);

  return (
    <Tag
      ref={ref}
      role="textbox"
      aria-label={label}
      aria-multiline={multiline || undefined}
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      spellCheck={false}
      data-placeholder={placeholder}
      className={`editable ${className ?? ""}`}
      style={style}
      onInput={(e: React.FormEvent<HTMLElement>) => {
        // innerText of an emptied element can be "\n"; treat it as empty so the placeholder shows.
        const text = e.currentTarget.innerText;
        onChange(text === "\n" ? "" : text);
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (!multiline && e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
        if (e.key === "Escape") e.currentTarget.blur();
      }}
      onPaste={(e: React.ClipboardEvent<HTMLElement>) => {
        // Firefox < 136 lacks plaintext-only; strip formatting manually.
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain");
        document.execCommand("insertText", false, multiline ? text : text.replace(/\s*\n\s*/g, " "));
      }}
    />
  );
}

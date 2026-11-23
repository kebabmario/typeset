"use client";

import { Check, Search } from "lucide-react";
import { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from "react";
import { Dialog } from "./ui/Dialog";
import { loadFontSample, sampleStack } from "@/lib/fontLoader";
import { CATEGORY_LABELS } from "@/lib/typography/config";
import { FONT_CATEGORIES, type FontCategory, type FontFamily } from "@/lib/typography/types";

interface FontPickerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  fonts: FontFamily[];
  value: string;
  onSelect: (font: FontFamily) => void;
  source: "google" | "curated";
}

const PAGE = 60;
type Filter = FontCategory | "all";

export function FontPicker(props: FontPickerProps) {
  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      title={props.title}
      description={
        props.source === "google"
          ? "The full Google Fonts library, most popular first."
          : "A curated selection from Google Fonts."
      }
      width={480}
    >
      {/* Remount on each open so search and scroll start fresh. */}
      {props.open && <PickerBody {...props} />}
    </Dialog>
  );
}

function PickerBody({ fonts, value, onSelect, onClose }: FontPickerProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [limit, setLimit] = useState(PAGE);
  const [active, setActive] = useState(0);
  const deferredQuery = useDeferredValue(query);
  const listId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const sentinelRef = useRef<HTMLLIElement>(null);

  const results = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    const list = fonts.filter(
      (f) => (filter === "all" || f.category === filter) && (!q || f.family.toLowerCase().includes(q)),
    );
    if (!q) return list;
    // Prefix matches first, so "pla" finds Playfair before Display families.
    return list.sort(
      (a, b) =>
        Number(!a.family.toLowerCase().startsWith(q)) - Number(!b.family.toLowerCase().startsWith(q)),
    );
  }, [fonts, filter, deferredQuery]);

  const visible = results.slice(0, limit);
  const activeIndex = Math.min(active, Math.max(0, visible.length - 1));

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setLimit((l) => l + PAGE),
      { root: listRef.current, rootMargin: "200px" },
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [visible.length, results.length]);

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const choose = (font: FontFamily) => {
    onSelect(font);
    onClose();
  };

  const resetPosition = () => {
    setActive(0);
    setLimit(PAGE);
    listRef.current?.scrollTo({ top: 0 });
  };

  return (
    <div className="grid gap-3">
      <div className="relative">
        <Search
          size={15}
          strokeWidth={1.75}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-3"
          aria-hidden
        />
        <input
          data-autofocus
          type="search"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={visible[activeIndex] ? `${listId}-${activeIndex}` : undefined}
          aria-label="Search fonts"
          placeholder="Search fonts"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            resetPosition();
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive(Math.min(activeIndex + 1, visible.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive(Math.max(activeIndex - 1, 0));
            } else if (e.key === "Enter" && visible[activeIndex]) {
              e.preventDefault();
              choose(visible[activeIndex]);
            }
          }}
          className="h-10 w-full rounded-lg border border-line bg-paper pr-3 pl-9 text-[14px] outline-none transition-colors placeholder:text-ink-3 focus:border-accent focus:bg-sheet focus-visible:outline-none"
        />
      </div>

      <div className="no-scrollbar -mx-6 flex gap-1 overflow-x-auto px-6" role="group" aria-label="Category">
        {(["all", ...FONT_CATEGORIES] as const).map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={filter === c}
            onClick={() => {
              setFilter(c);
              resetPosition();
            }}
            className={`h-7 shrink-0 rounded-full px-3 text-[13px] transition-colors ${
              filter === c ? "bg-ink text-white" : "text-ink-2 hover:bg-hover"
            }`}
          >
            {c === "all" ? "All" : CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      <ul
        id={listId}
        ref={listRef}
        role="listbox"
        aria-label="Fonts"
        className="-mx-3 h-[min(420px,52dvh)] overflow-y-auto overscroll-contain"
      >
        {visible.map((font, i) => (
          <FontRow
            key={font.family}
            id={`${listId}-${i}`}
            index={i}
            font={font}
            selected={font.family === value}
            active={i === activeIndex}
            onHover={() => setActive(i)}
            onChoose={() => choose(font)}
          />
        ))}
        {visible.length < results.length && <li ref={sentinelRef} aria-hidden className="h-8" />}
        {results.length === 0 && (
          <li className="px-3 py-10 text-center text-[13px] text-ink-3">
            No fonts match “{deferredQuery}”. Try a shorter name or another category.
          </li>
        )}
      </ul>
      <p className="text-[12px] text-ink-3" aria-live="polite">
        {results.length} {results.length === 1 ? "family" : "families"}
      </p>
    </div>
  );
}

interface FontRowProps {
  id: string;
  index: number;
  font: FontFamily;
  selected: boolean;
  active: boolean;
  onHover: () => void;
  onChoose: () => void;
}

function FontRow({ id, index, font, selected, active, onHover, onChoose }: FontRowProps) {
  const ref = useRef<HTMLLIElement>(null);

  // Fetch only the glyphs of the name, and only once the row scrolls into view.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const weight = font.weights.includes(400) ? 400 : font.weights[0];
        loadFontSample(font.family, weight);
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [font]);

  return (
    <li
      ref={ref}
      id={id}
      data-index={index}
      role="option"
      aria-selected={selected}
      onMouseMove={onHover}
      onClick={onChoose}
      className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors ${
        active ? "bg-hover" : ""
      }`}
    >
      <span className="min-w-0">
        <span
          className="block truncate text-[20px] leading-7 text-ink"
          style={{ fontFamily: sampleStack(font) }}
        >
          {font.family}
        </span>
        <span className="block text-[12px] text-ink-3">
          {CATEGORY_LABELS[font.category]}, {font.weights.length}{" "}
          {font.weights.length === 1 ? "weight" : "weights"}
        </span>
      </span>
      {selected && <Check size={16} strokeWidth={2} className="shrink-0 text-accent" aria-hidden />}
    </li>
  );
}

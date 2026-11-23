"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog } from "./ui/Dialog";
import { loadFontSample, sampleStack } from "@/lib/fontLoader";
import type { SavedCombination } from "@/lib/typography/types";

interface SavedDrawerProps {
  open: boolean;
  onClose: () => void;
  saved: SavedCombination[];
  onLoad: (entry: SavedCombination) => void;
  onDelete: (entry: SavedCombination) => { removed: SavedCombination; index: number } | null;
  onRestore: (entry: SavedCombination, index: number) => void;
  persistFailed: boolean;
}

const dateFormat = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });

export function SavedDrawer({ open, onClose, saved, onLoad, onDelete, onRestore, persistFailed }: SavedDrawerProps) {
  // Undo lives inside the drawer: a modal dialog makes everything outside it inert, toasts included.
  const [undo, setUndo] = useState<{ removed: SavedCombination; index: number } | null>(null);
  const close = () => {
    setUndo(null);
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    for (const s of saved) loadFontSample(s.config.heading.family, s.config.heading.weight, s.name);
  }, [open, saved]);

  return (
    <Dialog
      open={open}
      onClose={close}
      variant="drawer"
      title="Saved"
      description="Pairings are stored in this browser only."
    >
      {persistFailed && (
        <p className="mb-4 rounded-lg bg-[#fdf1ee] px-3 py-2 text-[13px] text-danger">
          This browser blocked storage, so saved pairings will be lost when you close the tab.
        </p>
      )}
      {undo && (
        <div role="status" className="mb-3 flex items-center justify-between gap-3 rounded-lg bg-paper py-1.5 pr-1.5 pl-3 text-[13px] text-ink-2">
          <span className="min-w-0 truncate">Deleted {undo.removed.name}</span>
          <button
            type="button"
            onClick={() => {
              onRestore(undo.removed, undo.index);
              setUndo(null);
            }}
            className="h-7 shrink-0 rounded-full px-3 font-medium text-ink transition-colors hover:bg-hover"
          >
            Undo
          </button>
        </div>
      )}
      {saved.length === 0 && !undo ? (
        <div className="py-16 text-center">
          <p className="text-[14px] text-ink">Nothing saved yet</p>
          <p className="mx-auto mt-1 max-w-[30ch] text-[13px] leading-5 text-ink-3">
            Choose Save in the toolbar to keep a pairing you like. It will appear here.
          </p>
        </div>
      ) : saved.length === 0 ? null : (
        <ul className="-mx-3 grid gap-1">
          {saved.map((s) => (
            <li key={s.id} className="group relative flex items-center rounded-xl transition-colors hover:bg-hover">
              <button
                type="button"
                onClick={() => onLoad(s)}
                className="min-w-0 flex-1 rounded-xl px-3 py-3 text-left"
                aria-label={`Load ${s.name}: ${s.config.heading.family} with ${s.config.body.family}`}
              >
                <span
                  className="block truncate text-[22px] leading-8 text-ink"
                  style={{
                    fontFamily: sampleStack(s.config.heading, s.name),
                    fontWeight: s.config.heading.weight,
                  }}
                >
                  {s.name}
                </span>
                <span className="mt-0.5 block truncate text-[12px] text-ink-3">
                  {s.config.heading.family} and {s.config.body.family}, {dateFormat.format(s.createdAt)}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setUndo(onDelete(s))}
                aria-label={`Delete ${s.name}`}
                className="mr-2 grid size-8 shrink-0 place-items-center rounded-full text-ink-3 opacity-100 transition-[opacity,color,background-color] hover:bg-sheet hover:text-danger focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <Trash2 size={15} strokeWidth={1.75} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Dialog>
  );
}

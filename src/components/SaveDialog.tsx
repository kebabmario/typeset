"use client";

import { useId, useState } from "react";
import { Dialog } from "./ui/Dialog";

interface SaveDialogProps {
  open: boolean;
  onClose: () => void;
  suggestedName: string;
  onSave: (name: string) => void;
}

export function SaveDialog({ open, onClose, suggestedName, onSave }: SaveDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title="Save pairing" width={420}>
      {open && <SaveForm suggestedName={suggestedName} onSave={onSave} onCancel={onClose} />}
    </Dialog>
  );
}

function SaveForm({ suggestedName, onSave, onCancel }: { suggestedName: string; onSave: (n: string) => void; onCancel: () => void }) {
  const [name, setName] = useState(suggestedName);
  const id = useId();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(name);
      }}
      className="grid gap-5"
    >
      <div className="grid gap-1.5">
        <label htmlFor={id} className="text-[13px] text-ink-2">
          Name
        </label>
        <input
          id={id}
          data-autofocus
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={(e) => e.currentTarget.select()}
          className="h-10 rounded-lg border border-line bg-paper px-3 text-[14px] outline-none transition-colors focus:border-accent focus:bg-sheet focus-visible:outline-none"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="h-9 rounded-full px-4 text-[13px] text-ink-2 transition-colors hover:bg-hover">
          Cancel
        </button>
        <button
          type="submit"
          className="h-9 rounded-full bg-ink px-5 text-[13px] font-medium text-white transition-[background-color,transform] hover:bg-black active:scale-[0.98]"
        >
          Save
        </button>
      </div>
    </form>
  );
}

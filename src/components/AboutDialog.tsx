"use client";

import { LogoMark, Wordmark } from "./Logo";
import { Dialog } from "./ui/Dialog";

interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AboutDialog({ open, onClose }: AboutDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title="About TYPESET" width={480}>
      <div className="mb-6 flex items-center gap-4 rounded-xl bg-paper p-5">
        <LogoMark className="size-14 shrink-0" />
        <Wordmark className="h-8 w-auto text-ink" />
      </div>
      <div className="grid gap-4 text-[14px] leading-6 text-ink-2">
        <p>
          TYPESET is a playground for pairing typefaces. Choose a heading and a body font, tune their
          size, weight, spacing and rhythm, and see the result as a real page.
        </p>
        <p>
          Click any text in the preview to rewrite it. Your current pairing stays in the address bar,
          so copying the link shares exactly what you see.
        </p>
        <p>
          Start from one of the curated presets, browse them all side by side in the gallery, or
          build your own and save it for later. Export gives you ready-to-paste CSS or JSON.
        </p>
        <p className="text-[13px] text-ink-3">
          Nothing leaves your browser. Saved pairings live in local storage on this device.
        </p>
      </div>
    </Dialog>
  );
}

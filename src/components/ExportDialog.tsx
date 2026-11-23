"use client";

import { Check, Copy, Download } from "lucide-react";
import { useMemo, useState } from "react";
import { Dialog } from "./ui/Dialog";
import { Segmented } from "./ui/Segmented";
import { copyText } from "@/lib/clipboard";
import { toCss, toJson } from "@/lib/typography/export";
import type { TypeConfig } from "@/lib/typography/types";

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  config: TypeConfig;
  name: string;
}

type Format = "css" | "json";

export function ExportDialog({ open, onClose, config, name }: ExportDialogProps) {
  const [format, setFormat] = useState<Format>("css");
  const [copied, setCopied] = useState<Format | null>(null);
  const output = useMemo(() => (format === "css" ? toCss(config) : toJson(config, name)), [format, config, name]);

  const copy = async () => {
    if (await copyText(output)) {
      setCopied(format);
      setTimeout(() => setCopied(null), 1600);
    }
  };

  const download = () => {
    const blob = new Blob([toJson(config, name)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "typeset"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Export"
      description="Drop the CSS into your stylesheet, or keep the JSON to load the pairing elsewhere."
      width={600}
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={download}
            className="flex h-9 items-center gap-2 rounded-full px-4 text-[13px] text-ink-2 transition-colors hover:bg-hover hover:text-ink"
          >
            <Download size={15} strokeWidth={1.75} aria-hidden /> Download JSON
          </button>
          <button
            type="button"
            onClick={copy}
            className="flex h-9 min-w-[124px] items-center justify-center gap-2 rounded-full bg-ink px-5 text-[13px] font-medium text-white transition-[background-color,transform] hover:bg-black active:scale-[0.98]"
          >
            {copied === format ? <Check size={15} strokeWidth={2} aria-hidden /> : <Copy size={15} strokeWidth={1.75} aria-hidden />}
            {copied === format ? "Copied" : `Copy ${format.toUpperCase()}`}
          </button>
        </div>
      }
    >
      <div className="grid gap-4">
        <div className="w-44">
          <Segmented
            label="Export format"
            value={format}
            options={[
              { value: "css", label: "CSS" },
              { value: "json", label: "JSON" },
            ]}
            onChange={setFormat}
          />
        </div>
        <pre
          tabIndex={0}
          aria-label={`${format.toUpperCase()} output`}
          className="max-h-[48dvh] overflow-auto rounded-xl bg-paper p-4 font-mono text-[12.5px] leading-[1.7] text-ink-2"
        >
          <code>{output}</code>
        </pre>
      </div>
    </Dialog>
  );
}

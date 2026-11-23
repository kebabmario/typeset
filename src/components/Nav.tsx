import { Info } from "lucide-react";
import { Wordmark } from "./Logo";

interface NavProps {
  savedCount?: number;
  savedOpen?: boolean;
  onPlayground?: () => void;
  onSaved?: () => void;
  onAbout?: () => void;
}

const link =
  "relative flex h-8 items-center rounded-full px-3 text-[13px] transition-colors hover:text-ink disabled:pointer-events-none";

/** Rendered on the server as a static shell, then interactive once the playground mounts. */
export function Nav({ savedCount = 0, savedOpen = false, onPlayground, onSaved, onAbout }: NavProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper">
      <nav
        aria-label="Main"
        className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-4 sm:px-8 lg:px-10"
      >
        <Wordmark className="h-[22px] w-auto text-ink" blink={Boolean(onPlayground)} />
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPlayground}
            disabled={!onPlayground}
            aria-current={savedOpen ? undefined : "page"}
            className={`${link} ${savedOpen ? "text-ink-3" : "text-ink"}`}
          >
            Playground
          </button>
          <button
            type="button"
            onClick={onSaved}
            disabled={!onSaved}
            aria-current={savedOpen ? "page" : undefined}
            className={`${link} gap-1.5 ${savedOpen ? "text-ink" : "text-ink-3"}`}
          >
            Saved
            {savedCount > 0 && (
              <span className="min-w-[18px] rounded-full bg-hover px-1.5 text-center text-[11px] leading-[18px] tabular-nums text-ink-2">
                {savedCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={onAbout}
            disabled={!onAbout}
            aria-label="About TYPESET"
            className="ml-1 grid size-8 place-items-center rounded-full text-ink-3 transition-colors hover:bg-hover hover:text-ink"
          >
            <Info size={16} strokeWidth={1.75} />
          </button>
        </div>
      </nav>
    </header>
  );
}

"use client";

import { Check } from "lucide-react";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

interface ToastMessage {
  id: number;
  text: string;
  action?: { label: string; run: () => void };
}

type Notify = (text: string, action?: ToastMessage["action"]) => void;

const ToastContext = createContext<Notify>(() => {});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const notify = useCallback<Notify>((text, action) => {
    clearTimeout(timer.current);
    setToast({ id: Date.now(), text, action });
    timer.current = setTimeout(() => setToast(null), action ? 6000 : 2400);
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 max-lg:bottom-24"
      >
        {toast && (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-3 rounded-full bg-ink py-2 pr-2 pl-4 text-[13px] text-white shadow-[0_8px_24px_-8px_rgb(0_0_0/0.35)] motion-safe:animate-[toast-in_260ms_var(--ease-out-soft)]"
          >
            <Check size={14} strokeWidth={2} aria-hidden />
            <span className={toast.action ? "" : "pr-2"}>{toast.text}</span>
            {toast.action && (
              <button
                type="button"
                className="rounded-full bg-white/15 px-3 py-1 font-medium transition-colors hover:bg-white/25"
                onClick={() => {
                  toast.action?.run();
                  setToast(null);
                }}
              >
                {toast.action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

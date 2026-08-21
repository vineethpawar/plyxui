/**
 * Headless toast queue. The hook + provider; rendering is up to the
 * consumer (or @plyxui/comps Toast once that lands).
 *
 *   <ToastProvider>
 *     <App />
 *   </ToastProvider>
 *
 *   const { toast } = useToast();
 *   toast({ title: "Saved", variant: "success" });
 *   toast({ title: "Message archived", action: { label: "Undo", onClick: restore } });
 *
 * Toasts auto-dismiss after 4s; a toast carrying an `action` sticks around
 * until dismissed — an Undo the user can't reach isn't an Undo. Timers are
 * pausable (`pause`/`resume`/`pauseAll`/`resumeAll`) so renderers can hold
 * the queue while the pointer is over it or the tab is hidden.
 *
 * No dependencies on DOM or RN. Consumers render the queue however
 * fits their platform.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ToastVariant = "default" | "success" | "warning" | "error";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  /**
   * Auto-dismiss after this many ms. 0 = sticky. Default 4000 — except
   * toasts with an `action`, which default to sticky.
   */
  duration?: number;
  /** Renders a button on the toast (Undo, Retry…). Makes the toast sticky by default. */
  action?: ToastAction;
}

export interface ToastContextValue {
  toasts: ToastItem[];
  toast: (input: Omit<ToastItem, "id">) => string;
  dismiss: (id: string) => void;
  clear: () => void;
  /** Freeze one toast's auto-dismiss timer. No-op if already paused or sticky. */
  pause: (id: string) => void;
  /** Restart a paused timer with whatever time it had left. */
  resume: (id: string) => void;
  /** Freeze every timer — for hover-over-the-stack or a hidden tab. */
  pauseAll: () => void;
  /** Unfreeze every paused timer. */
  resumeAll: () => void;
}

// Pin the context to globalThis. When Snackager pre-bundles each plyxui
// package, it can end up with multiple copies of @plyxui/hooks (one
// inlined into @plyxui/comps, one in the consumer). Without this, the
// Toaster's useToast() sees a different context than the consumer's
// ToastProvider, and the hook throws.
const GLOBAL_KEY = "__plyxui_toast_context_v1__";
type Global = typeof globalThis & { [GLOBAL_KEY]?: React.Context<ToastContextValue | null> };
const g = globalThis as Global;
const ToastContext: React.Context<ToastContextValue | null> =
  g[GLOBAL_KEY] ?? (g[GLOBAL_KEY] = createContext<ToastContextValue | null>(null));

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

interface TimerRec {
  /** null while paused. */
  handle: ReturnType<typeof setTimeout> | null;
  remaining: number;
  startedAt: number;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, TimerRec>>(new Map());

  const dismiss = useCallback((id: string) => {
    const rec = timers.current.get(id);
    if (rec) {
      if (rec.handle !== null) clearTimeout(rec.handle);
      timers.current.delete(id);
    }
    setToasts((ts) => ts.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (input: Omit<ToastItem, "id">) => {
      const id = uid();
      const duration = input.duration ?? (input.action ? 0 : 4000);
      const next: ToastItem = { variant: "default", ...input, id, duration };
      setToasts((ts) => [...ts, next]);
      if (duration > 0) {
        const handle = setTimeout(() => dismiss(id), duration);
        timers.current.set(id, { handle, remaining: duration, startedAt: Date.now() });
      }
      return id;
    },
    [dismiss],
  );

  const pause = useCallback((id: string) => {
    const rec = timers.current.get(id);
    if (!rec || rec.handle === null) return;
    clearTimeout(rec.handle);
    rec.handle = null;
    rec.remaining = Math.max(0, rec.remaining - (Date.now() - rec.startedAt));
  }, []);

  const resume = useCallback(
    (id: string) => {
      const rec = timers.current.get(id);
      if (!rec || rec.handle !== null) return;
      rec.startedAt = Date.now();
      rec.handle = setTimeout(() => dismiss(id), rec.remaining);
    },
    [dismiss],
  );

  const pauseAll = useCallback(() => {
    for (const id of timers.current.keys()) pause(id);
  }, [pause]);

  const resumeAll = useCallback(() => {
    for (const id of timers.current.keys()) resume(id);
  }, [resume]);

  const clear = useCallback(() => {
    for (const rec of timers.current.values()) {
      if (rec.handle !== null) clearTimeout(rec.handle);
    }
    timers.current.clear();
    setToasts([]);
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({ toasts, toast, dismiss, clear, pause, resume, pauseAll, resumeAll }),
    [toasts, toast, dismiss, clear, pause, resume, pauseAll, resumeAll],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside <ToastProvider />");
  }
  return ctx;
}

---
"@plyxui/core": minor
"@plyxui/hooks": minor
"@plyxui/primitives": minor
"@plyxui/comps": minor
"@plyxui/forms": minor
---

E0 systems — the components that make the library feel alive:

- **Presence** — mount/unmount transition primitive. Children stay in the tree while the exit animation runs, then unmount (`onExitComplete`). WAAPI on the motion tokens on web, Animated.timing on native; reduced motion collapses to a fast fade. Dialog, Popover, and the Toaster are built on it.
- **Skeleton** — shimmer placeholder (`text` / `rect` / `circle`, multi-line text). Gradient sweep over containerFill on web, opacity pulse on native; static fill under reduced motion.
- **AnimatedNumber** — count-up/down digits for score moments. rAF + ease-out over `motion.celebrate`, tabular-nums so layout doesn't wobble; snaps under reduced motion.
- **Dialog** — the composed modal: one theme `scrim` color (new token), Presence scale 0.98 + fade, focus trap + focus restore, body scroll lock, Escape/backdrop dismiss, `Dialog.Title` / `Dialog.Description` / `Dialog.Actions`, and `tone="danger"` recoloring the primary action.
- **Popover** — one floating-panel primitive to replace ad-hoc absolute panels. No portal, no positioning engine — positions inside a wrapping relative container; outside-mousedown + Escape close. Native renders inline (documented divergence, Tooltip-style).
- **Toaster, Sonner-grade** — stacked-collapsed pile, newest on top, three peeking behind with scale/translate offsets, expands on hover. Hover and hidden tabs pause the timers; `action: { label, onClick }` renders a button and makes the toast stick until dismissed (Undo pattern). Existing `toast()` calls work unchanged; the queue grew `pause` / `resume` / `pauseAll` / `resumeAll`.
- **Focus rings** — Input, Textarea, and forms Select draw a two-part ring on focus (page-fill gap + primaryOrange) transitioned on `motion.controlHover`. Inline styles can't express `:focus-visible`, so the ring shows on every focus for now.

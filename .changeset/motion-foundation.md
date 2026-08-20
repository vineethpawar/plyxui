---
"@plyxui/core": minor
"@plyxui/hooks": minor
---

Motion foundation:

- **Motion tokens** — `duration`, `easing`, and semantic `motion` pairs in `@plyxui/core/tokens`, plus a `transition()` helper for building CSS transition strings. `easing.standard` is the easeOutQuint the existing primitives already hardcode, so migrating them is visually a no-op.
- **useReducedMotion** — respects the OS reduce-motion setting; `prefers-reduced-motion` on web (SSR-safe, defaults false), AccessibilityInfo on native.

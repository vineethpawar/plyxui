/**
 * Motion tokens. Durations (ms), easing curves, and semantic duration+easing
 * pairs so every component animates from one shared vocabulary instead of
 * sprinkling magic numbers through transition strings.
 *
 *   duration.fast                               // 120
 *   easing.standard                             // "cubic-bezier(0.23, 1, 0.32, 1)"
 *   transition("opacity", motion.overlayEnter)  // "opacity 240ms cubic-bezier(0.16, 1, 0.3, 1)"
 */

export const duration = {
  instant: 50,
  fast: 120,
  base: 180,
  gentle: 240,
  slow: 320,
  /** Score count-ups and celebratory feedback. Long on purpose. */
  celebrate: 500,
} as const;

export type DurationKey = keyof typeof duration;

/**
 * Easing curves. `standard` is the easeOutQuint already hardcoded across the
 * existing primitives (Card, Progress, Switch, Segmented, Collapsible), so
 * migrating them onto these tokens is visually a no-op.
 */
export const easing = {
  /** Fast start, long settle. Default for hovers and most entrances. */
  out: "cubic-bezier(0.16, 1, 0.3, 1)",
  /** easeOutQuint — the curve the existing primitives already use. */
  standard: "cubic-bezier(0.23, 1, 0.32, 1)",
  /** Symmetric. For exits and anything that travels across the screen. */
  inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  linear: "linear",
} as const;

export type EasingKey = keyof typeof easing;

/**
 * A duration+easing pair. What the semantic `motion` aliases resolve to and
 * what `transition()` consumes.
 */
export interface MotionSpec {
  duration: number;
  easing: string;
}

/**
 * Semantic aliases. Components reach for the intent (`motion.expand`) rather
 * than re-deciding a duration and curve per callsite.
 */
export const motion = {
  controlHover: { duration: duration.fast, easing: easing.out },
  controlActive: { duration: duration.instant, easing: easing.out },
  overlayEnter: { duration: duration.gentle, easing: easing.out },
  overlayExit: { duration: duration.base, easing: easing.inOut },
  expand: { duration: duration.base, easing: easing.standard },
  celebrate: { duration: duration.celebrate, easing: easing.out },
} as const;

export type MotionKey = keyof typeof motion;

/**
 * Build a CSS transition value from a motion spec. Pure string building —
 * no DOM, safe to import anywhere (RN callers just won't want it).
 *
 *   transition("transform", motion.expand)
 *   // "transform 180ms cubic-bezier(0.23, 1, 0.32, 1)"
 */
export function transition(prop: string, m: MotionSpec): string {
  return `${prop} ${m.duration}ms ${m.easing}`;
}

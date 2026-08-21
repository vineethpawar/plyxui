/**
 * AnimatedNumber (web). Counts a number up (or down) to its new value —
 * for score reveals, streak counters, and any moment where the change is
 * the point. A number that travels reads as an event; one that snaps
 * reads as a correction.
 *
 *   <AnimatedNumber value={score} />
 *   <AnimatedNumber value={total} format={(n) => `$${n.toFixed(2)}`} />
 *   <AnimatedNumber value={xp} duration={800} />
 *
 * rAF-driven with an ease-out interpolation (default length
 * motion.celebrate, 500ms). Digits render tabular-nums so the layout
 * doesn't wobble mid-count. Reduced motion snaps to the value instantly.
 */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion } from "@plyxui/core";
import { useReducedMotion } from "@plyxui/hooks";

export interface AnimatedNumberProps {
  value: number;
  /** Count duration in ms. Default motion.celebrate (500). */
  duration?: number;
  /** Render the interpolated value. Default rounds to an integer string. */
  format?: (n: number) => string;
  className?: string;
  style?: CSSProperties;
}

function defaultFormat(n: number): string {
  return Math.round(n).toString();
}

// easeOutCubic — fast start, gentle landing on the final digit.
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function AnimatedNumber({
  value,
  duration = motion.celebrate.duration,
  format = defaultFormat,
  className,
  style,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState<number>(value);
  const displayRef = useRef(value);
  displayRef.current = display;
  const reduced = useReducedMotion();

  useEffect(() => {
    if (displayRef.current === value) return;
    if (reduced || duration <= 0) {
      setDisplay(value);
      return;
    }
    const start = displayRef.current;
    const delta = value - start;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - t0) / duration, 1);
      setDisplay(start + delta * easeOut(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduced]);

  return (
    <span className={className} style={{ fontVariantNumeric: "tabular-nums", ...style }}>
      {format(display)}
    </span>
  );
}

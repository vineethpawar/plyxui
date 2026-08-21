/**
 * AnimatedNumber (native). Same count-up/down contract as web — rAF works
 * fine in React Native, so the interpolation logic is identical. Renders
 * an RN Text with fontVariant tabular-nums so digits don't wobble.
 *
 *   <AnimatedNumber value={score} />
 *   <AnimatedNumber value={total} format={(n) => `$${n.toFixed(2)}`} />
 *
 * Reduced motion (AccessibilityInfo) snaps to the value instantly.
 */
import { useEffect, useRef, useState } from "react";
import { Text as RNText, type TextStyle } from "react-native";
import { motion } from "@plyxui/core";
import { useReducedMotion } from "@plyxui/hooks";

export interface AnimatedNumberProps {
  value: number;
  /** Count duration in ms. Default motion.celebrate (500). */
  duration?: number;
  /** Render the interpolated value. Default rounds to an integer string. */
  format?: (n: number) => string;
  style?: TextStyle;
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
    const t0 = Date.now();
    let raf = 0;
    const tick = () => {
      const t = Math.min((Date.now() - t0) / duration, 1);
      setDisplay(start + delta * easeOut(t));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, reduced]);

  return <RNText style={[{ fontVariant: ["tabular-nums"] }, style]}>{format(display)}</RNText>;
}

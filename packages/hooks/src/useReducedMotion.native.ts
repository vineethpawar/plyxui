/**
 * True when the user has enabled Reduce Motion in the OS accessibility
 * settings. Same shape as the web variant so consumers can gate animation
 * without a platform check.
 *
 * Reads AccessibilityInfo.isReduceMotionEnabled once on mount, then follows
 * `reduceMotionChanged`. Defaults false until the initial read resolves.
 *
 *   const reduced = useReducedMotion();
 *   const dur = reduced ? 0 : duration.base;
 */
import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduced(enabled);
    });
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);
  return reduced;
}

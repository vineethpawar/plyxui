/**
 * True when the user has asked the OS to reduce motion. Gate non-essential
 * animation on it — skip the transition, keep the state change.
 *
 * Web build: tracks `(prefers-reduced-motion: reduce)` via useMediaQuery.
 * SSR-safe — false until the media query resolves on the client. The native
 * build (useReducedMotion.native.ts) reads AccessibilityInfo instead.
 *
 *   const reduced = useReducedMotion();
 *   const dur = reduced ? 0 : duration.base;
 */
import { useMediaQuery } from "./useMediaQuery";

export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

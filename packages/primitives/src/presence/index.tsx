/**
 * Presence (web). Mount/unmount transition primitive — keeps children in
 * the tree while they animate out, then actually unmounts. Every overlay
 * in the library used to `if (!open) return null`, which meant nothing
 * ever animated its exit; this is the missing half of that story.
 *
 *   <Presence present={open}>{panel}</Presence>
 *   <Presence present={open} from={{ opacity: 0, scale: 0.98 }}>{panel}</Presence>
 *   <Presence present={show} onExitComplete={() => queue.shift()}>{toast}</Presence>
 *
 * Animates via WAAPI (element.animate) with the motion tokens — enter
 * defaults to motion.overlayEnter, exit to motion.overlayExit; a `duration`
 * or `easing` prop overrides both directions. The wrapper div carries
 * data-state="open|closed" so CSS can hook either state. Reduced motion
 * collapses to a fast opacity-only fade.
 */
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, type MotionSpec } from "@plyxui/core";
import { useReducedMotion } from "@plyxui/hooks";

export interface PresenceFrom {
  opacity?: number;
  translateX?: number;
  translateY?: number;
  scale?: number;
}

export interface PresenceProps {
  /** Logical mounted state. Children stay in the DOM while exiting. */
  present: boolean;
  /** Hidden pose the content enters from and exits to. Default `{ opacity: 0, translateY: 8 }`. */
  from?: PresenceFrom;
  /** Override duration (ms) for both enter and exit. Defaults to the motion tokens. */
  duration?: number;
  /** Override easing (CSS string) for both enter and exit. */
  easing?: string;
  /** Fires after the exit animation finishes and children unmount. */
  onExitComplete?: () => void;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

const DEFAULT_FROM: PresenceFrom = { opacity: 0, translateY: 8 };

function poseToKeyframe(from: PresenceFrom): Keyframe {
  const transforms: string[] = [];
  if (from.translateX !== undefined || from.translateY !== undefined) {
    transforms.push(`translate(${from.translateX ?? 0}px, ${from.translateY ?? 0}px)`);
  }
  if (from.scale !== undefined) transforms.push(`scale(${from.scale})`);
  const kf: Keyframe = {};
  if (from.opacity !== undefined) kf.opacity = from.opacity;
  if (transforms.length > 0) kf.transform = transforms.join(" ");
  return kf;
}

const IDENTITY: Keyframe = { opacity: 1, transform: "translate(0px, 0px) scale(1)" };

export function Presence({
  present,
  from = DEFAULT_FROM,
  duration,
  easing,
  onExitComplete,
  className,
  style,
  children,
}: PresenceProps) {
  const [mounted, setMounted] = useState<boolean>(present);
  const ref = useRef<HTMLDivElement>(null);
  const animRef = useRef<Animation | null>(null);
  const reduced = useReducedMotion();

  // Latest callbacks/poses without re-triggering the effects.
  const latest = useRef({ from, duration, easing, onExitComplete, reduced });
  latest.current = { from, duration, easing, onExitComplete, reduced };

  if (present && !mounted) setMounted(true);

  const resolve = (base: MotionSpec): MotionSpec => {
    const l = latest.current;
    if (l.reduced) return { duration: 50, easing: "linear" };
    return { duration: l.duration ?? base.duration, easing: l.easing ?? base.easing };
  };

  const hiddenPose = (): Keyframe =>
    latest.current.reduced ? { opacity: 0 } : poseToKeyframe(latest.current.from);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!present || !el) return;
    animRef.current?.cancel();
    if (typeof el.animate !== "function") return; // SSR/jsdom: appear instantly
    const spec = resolve(motion.overlayEnter);
    animRef.current = el.animate([hiddenPose(), IDENTITY], {
      duration: spec.duration,
      easing: spec.easing,
      fill: "backwards",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [present]);

  useEffect(() => {
    if (present || !mounted) return;
    const el = ref.current;
    const finish = () => {
      animRef.current = null;
      setMounted(false);
      latest.current.onExitComplete?.();
    };
    if (!el || typeof el.animate !== "function") {
      finish();
      return;
    }
    animRef.current?.cancel();
    const spec = resolve(motion.overlayExit);
    const anim = el.animate([IDENTITY, hiddenPose()], {
      duration: spec.duration,
      easing: spec.easing,
      fill: "forwards",
    });
    animRef.current = anim;
    anim.onfinish = finish;
    return () => {
      anim.onfinish = null;
      anim.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [present, mounted]);

  if (!mounted) return null;

  return (
    <div ref={ref} className={className} style={style} data-state={present ? "open" : "closed"}>
      {children}
    </div>
  );
}

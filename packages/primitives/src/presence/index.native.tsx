/**
 * Presence (native). Mount/unmount transition primitive — same contract
 * as web: children stay mounted while the exit animation runs, then
 * unmount and `onExitComplete` fires.
 *
 *   <Presence present={open}>{panel}</Presence>
 *   <Presence present={open} from={{ opacity: 0, scale: 0.98 }}>{panel}</Presence>
 *
 * Divergence from web: animates with RN Animated.timing, so the `easing`
 * prop (a CSS string on web) is ignored here — native uses Easing.out(cubic),
 * the closest match to the motion tokens' out curves. `duration` is honored.
 * Reduced motion (AccessibilityInfo) collapses to a fast opacity-only fade.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Animated, Easing, type ViewStyle } from "react-native";
import { motion } from "@plyxui/core";
import { useReducedMotion } from "@plyxui/hooks";

export interface PresenceFrom {
  opacity?: number;
  translateX?: number;
  translateY?: number;
  scale?: number;
}

export interface PresenceProps {
  present: boolean;
  /** Hidden pose the content enters from and exits to. Default `{ opacity: 0, translateY: 8 }`. */
  from?: PresenceFrom;
  /** Override duration (ms) for both enter and exit. Defaults to the motion tokens. */
  duration?: number;
  /** Accepted for API parity with web; ignored on native (see header). */
  easing?: string;
  onExitComplete?: () => void;
  style?: ViewStyle;
  children?: ReactNode;
}

const DEFAULT_FROM: PresenceFrom = { opacity: 0, translateY: 8 };

export function Presence({
  present,
  from = DEFAULT_FROM,
  duration,
  onExitComplete,
  style,
  children,
}: PresenceProps) {
  const [mounted, setMounted] = useState<boolean>(present);
  // 0 = hidden pose, 1 = identity. One driver interpolates every property.
  const progress = useRef(new Animated.Value(present ? 1 : 0)).current;
  const reduced = useReducedMotion();

  const latest = useRef({ from, duration, onExitComplete, reduced });
  latest.current = { from, duration, onExitComplete, reduced };

  if (present && !mounted) setMounted(true);

  useEffect(() => {
    const l = latest.current;
    const base = present ? motion.overlayEnter.duration : motion.overlayExit.duration;
    const anim = Animated.timing(progress, {
      toValue: present ? 1 : 0,
      duration: l.reduced ? 50 : (l.duration ?? base),
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    anim.start(({ finished }) => {
      if (finished && !present) {
        setMounted(false);
        latest.current.onExitComplete?.();
      }
    });
    return () => anim.stop();
  }, [present, progress]);

  if (!mounted) return null;

  const pose = latest.current.reduced ? { opacity: 0 } : from;
  const range = (hidden: number, shown: number) =>
    progress.interpolate({ inputRange: [0, 1], outputRange: [hidden, shown] });

  const transform: ViewStyle["transform"] = latest.current.reduced
    ? []
    : [
        ...(pose.translateX !== undefined
          ? [{ translateX: range(pose.translateX, 0) as unknown as number }]
          : []),
        ...(pose.translateY !== undefined
          ? [{ translateY: range(pose.translateY, 0) as unknown as number }]
          : []),
        ...(pose.scale !== undefined ? [{ scale: range(pose.scale, 1) as unknown as number }] : []),
      ];

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: pose.opacity !== undefined ? range(pose.opacity, 1) : 1,
          transform,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

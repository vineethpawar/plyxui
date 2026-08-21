/**
 * Toaster (native). Renders the queue from `useToast()` as a single
 * column — same API as web, minus the stacking physics: hover doesn't
 * exist on touch, so there's no collapsed pile or pause-on-hover here.
 * Enter/exit animate through the Presence primitive; `action` renders
 * as a button and those toasts stick until dismissed (queue behavior,
 * shared with web).
 */
import { useCallback, useEffect, useState } from "react";
import { Pressable, Text as RNText, View, type ViewStyle } from "react-native";
import { useToast, type ToastItem, type ToastVariant } from "@plyxui/hooks";
import { Presence } from "@plyxui/primitives";
import { useTheme } from "@plyxui/styles";
import { radius, spacing } from "@plyxui/core";

export type ToasterPosition = "top" | "bottom";

export interface ToasterProps {
  position?: ToasterPosition;
  offset?: number;
  max?: number;
  accent?: Partial<Record<ToastVariant, string>>;
}

export function Toaster({ position = "bottom", offset = 24, max = 5, accent }: ToasterProps) {
  const { toasts } = useToast();
  const live = toasts.slice(-max);

  // Local render list so dismissed toasts stay mounted through their exit.
  const [rendered, setRendered] = useState<ToastItem[]>(live);
  useEffect(() => {
    setRendered((prev) => {
      const prevIds = new Set(prev.map((t) => t.id));
      const liveById = new Map(live.map((t) => [t.id, t]));
      const kept = prev.map((t) => liveById.get(t.id) ?? t);
      const added = live.filter((t) => !prevIds.has(t.id));
      return [...kept, ...added];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toasts, max]);

  const removeRendered = useCallback((id: string) => {
    setRendered((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const liveIds = new Set(live.map((t) => t.id));

  const containerStyle: ViewStyle = {
    position: "absolute",
    left: spacing[4],
    right: spacing[4],
    flexDirection: position === "bottom" ? "column-reverse" : "column",
    gap: spacing[2],
    ...(position === "bottom" ? { bottom: offset } : { top: offset }),
  };

  return (
    <View pointerEvents="box-none" style={containerStyle}>
      {rendered.map((t) => (
        <Presence
          key={t.id}
          present={liveIds.has(t.id)}
          from={{ opacity: 0, translateY: position === "bottom" ? 16 : -16 }}
          onExitComplete={() => removeRendered(t.id)}
        >
          <ToastCard item={t} accent={accent} />
        </Presence>
      ))}
    </View>
  );
}

function ToastCard({
  item,
  accent,
}: {
  item: ToastItem;
  accent?: Partial<Record<ToastVariant, string>>;
}) {
  const { colors } = useTheme();
  const { dismiss } = useToast();

  const variant = item.variant ?? "default";
  const fallback: Record<ToastVariant, string> = {
    default: colors.primaryOrange,
    success: colors.statusSuccess,
    warning: colors.statusWarning,
    error: colors.statusError,
  };
  const accentColor = accent?.[variant] ?? fallback[variant];

  return (
    <View
      accessibilityRole="alert"
      style={{
        backgroundColor: colors.surfaceFill,
        borderLeftWidth: 3,
        borderLeftColor: accentColor,
        borderRadius: radius.md,
        paddingHorizontal: spacing[4],
        paddingVertical: spacing[3],
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
      }}
    >
      {item.title ? (
        <RNText style={{ color: colors.text, fontSize: 14, fontWeight: "600", paddingRight: spacing[5] }}>
          {item.title}
        </RNText>
      ) : null}
      {item.description ? (
        <RNText style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>
          {item.description}
        </RNText>
      ) : null}
      {item.action ? (
        <Pressable
          onPress={() => {
            item.action?.onClick();
            dismiss(item.id);
          }}
          style={{
            alignSelf: "flex-start",
            marginTop: spacing[2],
            borderWidth: 1,
            borderColor: colors.stroke,
            borderRadius: radius.sm,
            paddingHorizontal: spacing[2],
            paddingVertical: spacing[1],
          }}
        >
          <RNText style={{ color: accentColor, fontSize: 12, fontWeight: "600" }}>
            {item.action.label}
          </RNText>
        </Pressable>
      ) : null}
      <Pressable
        onPress={() => dismiss(item.id)}
        hitSlop={8}
        accessibilityLabel="Dismiss"
        style={{ position: "absolute", top: 6, right: 8, padding: 4 }}
      >
        <RNText style={{ color: colors.textMuted, fontSize: 16, lineHeight: 16 }}>x</RNText>
      </Pressable>
    </View>
  );
}

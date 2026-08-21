/**
 * Popover on native diverges from web the same way Tooltip does: there's
 * no hover, no document, and no absolute positioning against a relative
 * ancestor worth relying on. This version renders the panel INLINE, in
 * flow, directly where the Popover sits in the tree (typically right
 * below the trigger) with a Presence fade — a disclosure, not a floating
 * layer. `anchor` and `placement` are accepted for API parity and
 * ignored. If you need a true floating sheet on native, reach for Dialog
 * or Drawer instead.
 *
 *   <View>
 *     <Button onClick={() => setOpen(!open)}>Filter</Button>
 *     <Popover open={open} onClose={close} anchor={anchorRef}>…</Popover>
 *   </View>
 */
import { type ReactNode, type RefObject } from "react";
import { View, type ViewStyle } from "react-native";
import { useTheme } from "@plyxui/styles";
import { Presence } from "@plyxui/primitives";
import { radius, spacing } from "@plyxui/core";

export type PopoverPlacement = "bottom-start" | "bottom-end" | "top-start" | "top-end";

export interface PopoverProps {
  open: boolean;
  onClose: () => void;
  /** Accepted for API parity with web; unused on native (see header). */
  anchor: RefObject<unknown>;
  /** Accepted for API parity with web; unused on native (see header). */
  placement?: PopoverPlacement;
  style?: ViewStyle;
  children?: ReactNode;
}

export function Popover({ open, style, children }: PopoverProps) {
  const { colors } = useTheme();

  return (
    <Presence present={open} from={{ opacity: 0, translateY: -4 }}>
      <View
        style={[
          {
            minWidth: 180,
            alignSelf: "flex-start",
            backgroundColor: colors.surfaceFill,
            borderWidth: 1,
            borderColor: colors.stroke,
            borderRadius: radius.md,
            padding: spacing[3],
            marginTop: spacing[1],
            shadowColor: "#000",
            shadowOpacity: 0.18,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: 8,
          },
          style,
        ]}
      >
        {children}
      </View>
    </Presence>
  );
}

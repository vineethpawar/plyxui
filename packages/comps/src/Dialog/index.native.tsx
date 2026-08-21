/**
 * Dialog (native). Same contract as web: one theme scrim, Presence-driven
 * scale 0.98 + fade, tone="danger" recolors the primary action. RN Modal
 * is the host; it stays visible until the exit animation completes so
 * closes animate too. Focus trapping and scroll locking are web concerns
 * — RN Modal already owns the screen.
 *
 *   <Dialog open={open} onClose={close} title="Delete project?" tone="danger">
 *     <Dialog.Description>This can't be undone.</Dialog.Description>
 *     <Dialog.Actions>
 *       <Button variant="ghost" onClick={close}>Cancel</Button>
 *       <Button onClick={confirm}>Delete</Button>
 *     </Dialog.Actions>
 *   </Dialog>
 */
import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import {
  Modal as RNModal,
  Pressable,
  Text as RNText,
  View,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useTheme } from "@plyxui/styles";
import { Presence } from "@plyxui/primitives";
import { radius, spacing } from "@plyxui/core";

export type DialogSize = "sm" | "md" | "lg" | "full";
export type DialogTone = "default" | "danger";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  /** Width preset or px. Native caps at the screen minus margins. Default "md". */
  size?: DialogSize | number;
  /** "danger" recolors the primary action in Dialog.Actions. Default "default". */
  tone?: DialogTone;
  dismissOnBackdrop?: boolean;
  children?: ReactNode;
}

const sizePresets: Record<DialogSize, number | string> = {
  sm: 320,
  md: 420,
  lg: 560,
  full: "100%",
};

interface DialogContextValue {
  tone: DialogTone;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export function Dialog({
  open,
  onClose,
  title,
  size = "md",
  tone = "default",
  dismissOnBackdrop = true,
  children,
}: DialogProps) {
  const { colors } = useTheme();
  // Keep the RN Modal mounted through the exit animation.
  const [visible, setVisible] = useState(open);
  useEffect(() => {
    if (open) setVisible(true);
  }, [open]);

  const widthValue = typeof size === "number" ? size : sizePresets[size];

  return (
    <DialogContext.Provider value={{ tone }}>
      <RNModal visible={visible} transparent animationType="none" onRequestClose={onClose}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: spacing[5] }}>
          <Presence
            present={open}
            from={{ opacity: 0 }}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          >
            <Pressable
              onPress={() => dismissOnBackdrop && onClose()}
              accessibilityLabel="Close dialog"
              style={{ flex: 1, backgroundColor: colors.scrim }}
            />
          </Presence>
          <Presence
            present={open}
            from={{ opacity: 0, scale: 0.98 }}
            onExitComplete={() => setVisible(false)}
            style={{ width: widthValue, maxWidth: "100%" }}
          >
            <View
              accessibilityViewIsModal
              style={{
                backgroundColor: colors.surfaceFill,
                borderRadius: radius.lg,
                padding: spacing[4],
                shadowColor: "#000",
                shadowOpacity: 0.3,
                shadowRadius: 24,
                shadowOffset: { width: 0, height: 12 },
                elevation: 12,
              }}
            >
              {title ? (
                <RNText
                  accessibilityRole="header"
                  style={{ color: colors.text, fontSize: 16, fontWeight: "600", marginBottom: spacing[3] }}
                >
                  {title}
                </RNText>
              ) : null}
              {children}
            </View>
          </Presence>
        </View>
      </RNModal>
    </DialogContext.Provider>
  );
}

export interface DialogSectionProps {
  children?: ReactNode;
  style?: ViewStyle & TextStyle;
}

/** Heading inside the body — for dialogs that skip the `title` header. */
function DialogTitle({ children, style }: DialogSectionProps) {
  const { colors } = useTheme();
  return (
    <RNText
      accessibilityRole="header"
      style={[{ color: colors.text, fontSize: 16, fontWeight: "600", marginBottom: spacing[2] }, style]}
    >
      {children}
    </RNText>
  );
}

function DialogDescription({ children, style }: DialogSectionProps) {
  const { colors } = useTheme();
  return (
    <RNText style={[{ color: colors.textMuted, fontSize: 13, lineHeight: 19 }, style]}>
      {children}
    </RNText>
  );
}

/**
 * Action row. Right-aligned; the LAST child is the primary action and
 * inherits the dialog's tone (tone="danger" injects variant="danger").
 */
function DialogActions({ children, style }: DialogSectionProps) {
  const ctx = useContext(DialogContext);
  const items = Children.toArray(children);
  const last = items[items.length - 1];
  if (ctx?.tone === "danger" && isValidElement(last)) {
    items[items.length - 1] = cloneElement(last as ReactElement<{ variant?: string }>, {
      variant: "danger",
    });
  }
  return (
    <View
      style={[
        { flexDirection: "row", justifyContent: "flex-end", gap: spacing[2], marginTop: spacing[4] },
        style,
      ]}
    >
      {items}
    </View>
  );
}

Dialog.Title = DialogTitle;
Dialog.Description = DialogDescription;
Dialog.Actions = DialogActions;

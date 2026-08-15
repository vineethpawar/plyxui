/**
 * Card (web). A bordered surface — the default container for grouped
 * content. Hairline border is the resting elevation (no shadow by
 * default); `interactive` warms the border on hover so clickable cards
 * read as clickable.
 *
 *   <Card>…</Card>
 *   <Card variant="raised" padding="lg" />
 *   <Card interactive onClick={…} />
 */
import { forwardRef, type CSSProperties, type ReactNode } from "react";
import { useTheme } from "@plyxui/styles";
import { radius as radiusScale, spacing } from "@plyxui/core";

export type CardVariant = "outline" | "raised" | "sunken";
export type CardPadding = "none" | "sm" | "md" | "lg";
export type CardRadius = "sm" | "md" | "lg" | "xl";

const padMap: Record<CardPadding, number> = {
  none: 0,
  sm: spacing[3],
  md: spacing[4],
  lg: spacing[6],
};

export interface CardProps {
  variant?: CardVariant;
  padding?: CardPadding;
  radius?: CardRadius;
  /** Warm the border on hover; renders as a button when onClick is set. */
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  "aria-label"?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = "outline", padding = "md", radius = "lg", interactive, onClick, className, style, children, ...aria },
  ref,
) {
  const { colors } = useTheme();

  const bg =
    variant === "raised" ? colors.surfaceFill : variant === "sunken" ? colors.containerFill : colors.surfaceFill;

  const base: CSSProperties = {
    background: bg,
    border: `1px solid ${colors.stroke}`,
    borderRadius: radiusScale[radius],
    padding: padMap[padding],
    cursor: interactive || onClick ? "pointer" : undefined,
    transition: "border-color 0.2s cubic-bezier(0.23,1,0.32,1), transform 0.2s cubic-bezier(0.23,1,0.32,1)",
    ...style,
  };

  const hoverOn = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive && !onClick) return;
    e.currentTarget.style.borderColor = colors.primaryOrange;
  };
  const hoverOff = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive && !onClick) return;
    e.currentTarget.style.borderColor = colors.stroke;
  };

  return (
    <div
      ref={ref}
      className={className}
      style={base}
      onClick={onClick}
      onMouseEnter={hoverOn}
      onMouseLeave={hoverOff}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={aria["aria-label"]}
    >
      {children}
    </div>
  );
});

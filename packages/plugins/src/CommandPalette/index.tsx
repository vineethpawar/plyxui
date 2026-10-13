/**
 * CommandPalette. Cmd+K style fuzzy-search launcher.
 *
 *   <CommandPalette
 *     open={open}
 *     onClose={() => setOpen(false)}
 *     items={[
 *       { id: "home", label: "Go home", group: "Navigate", onSelect: () => navigate("/") },
 *       { id: "settings", label: "Open settings", group: "Navigate", onSelect: () => navigate("/settings") },
 *       { id: "logout", label: "Sign out", group: "Account", onSelect: signOut },
 *     ]}
 *   />
 *
 * Items can also carry a one-line description, a right-aligned hint (the command a GUI action
 * wraps, say), a shortcut chip, a badge for commands with consequences, and an alternate action
 * for Cmd+Enter. Every one is optional; a plain list renders exactly as before.
 *
 * Mid-fidelity matching: substring + lowercase, no fancy fuzzy yet. Good
 * enough for sub-200-item lists; swap in fzf-style scoring once we feel
 * the latency.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useTheme } from "@plyxui/styles";
import { spacing, radius } from "@plyxui/core";
import { Icon, type IconName } from "@plyxui/icons";

export type CommandBadgeTone = "neutral" | "danger";

export interface CommandItem {
  id: string;
  label: string;
  /** Optional logical group (e.g. "Navigate", "Account"). */
  group?: string;
  /** Optional icon name from the @plyxui/icons registry. */
  icon?: IconName | (string & {});
  /** Optional keywords to broaden the substring match. */
  keywords?: string[];
  onSelect: () => void;
  disabled?: boolean;
  /** A second line under the label: what the command does, in a sentence. Searchable. */
  description?: string;
  /** Right-aligned and monospaced: the command a GUI action wraps, or any short reference. Searchable. */
  hint?: string;
  /** A key chip at the far right. Display only: wire the shortcut itself in your app. */
  shortcut?: string;
  /** A short tag after the label, for commands with consequences. `danger` fills it. */
  badge?: { label: string; tone?: CommandBadgeTone };
  /** Runs on Cmd+Enter (Ctrl+Enter) instead of onSelect, when present. */
  onAltSelect?: () => void;
}

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  items: CommandItem[];
  placeholder?: string;
  /** Width in px. Default 560. */
  width?: number;
  /** Replaces the search icon at the start of the input. */
  leading?: ReactNode;
  /** Rendered at the end of the input row: a shortcut chip, a count. */
  trailing?: ReactNode;
  /** Rendered under the list: key hints, a note. */
  footer?: ReactNode;
}

function score(query: string, item: CommandItem): number {
  if (!query) return 1;
  const q = query.toLowerCase();
  const hay = [item.label, ...(item.keywords ?? []), item.hint ?? "", item.description ?? ""].join(" ").toLowerCase();
  if (hay.startsWith(q)) return 3;
  if (hay.includes(q)) return 2;
  return 0;
}

export function CommandPalette({
  open,
  onClose,
  items,
  placeholder = "Type a command…",
  width = 560,
  leading,
  trailing,
  footer,
}: CommandPaletteProps) {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActive(0);
      return;
    }
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  const ranked = useMemo(() => {
    const scored = items
      .map((it) => ({ item: it, s: score(query, it) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s);
    return scored.map((x) => x.item);
  }, [items, query]);

  const run = (it: CommandItem | undefined, alt: boolean) => {
    if (!it || it.disabled) return;
    if (alt && it.onAltSelect) it.onAltSelect();
    else it.onSelect();
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(ranked.length - 1, a + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(0, a - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        run(ranked[active], e.metaKey || e.ctrlKey);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, ranked, active, onClose]);

  // Keep the selection in view as the arrow keys walk a list longer than the panel.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    el?.scrollIntoView?.({ block: "nearest" });
  }, [active, open]);

  if (!open) return null;

  const grouped = new Map<string, CommandItem[]>();
  for (const item of ranked) {
    const g = item.group ?? "";
    if (!grouped.has(g)) grouped.set(g, []);
    grouped.get(g)!.push(item);
  }
  // A shortcut column exists only if some item uses it, so rows without one still line up.
  const shortcutColumn = items.some((it) => it.shortcut);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 200,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "12vh 16px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: width,
          background: colors.surfaceFill,
          border: `1px solid ${colors.stroke}`,
          borderRadius: radius.lg,
          boxShadow: "0 24px 72px rgba(0,0,0,0.35)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "70vh",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", padding: spacing[3], gap: spacing[2], borderBottom: `1px solid ${colors.stroke}` }}>
          {leading ?? <Icon name="search" size={18} color="textMuted" />}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder={placeholder}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              color: colors.text,
              fontSize: 15,
              fontFamily: "inherit",
              padding: 0,
            }}
          />
          {trailing}
        </div>
        <div ref={listRef} style={{ flex: 1, overflowY: "auto", padding: spacing[1] }}>
          {ranked.length === 0 ? (
            <div
              style={{
                padding: spacing[5],
                textAlign: "center",
                fontSize: 13,
                color: colors.textMuted,
              }}
            >
              Nothing matches.
            </div>
          ) : null}
          {Array.from(grouped.entries()).map(([group, list]) => (
            <div key={group || "_"} style={{ marginBottom: spacing[1] }}>
              {group ? (
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: colors.textMuted,
                    padding: `${spacing[2]}px ${spacing[3]}px ${spacing[1]}px`,
                  }}
                >
                  {group}
                </div>
              ) : null}
              {list.map((it) => {
                const idx = ranked.indexOf(it);
                const isActive = idx === active;
                return (
                  <button
                    key={it.id}
                    data-active={isActive}
                    onMouseEnter={() => setActive(idx)}
                    onClick={(e) => run(it, e.metaKey || e.ctrlKey)}
                    disabled={it.disabled}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: spacing[3],
                      padding: `${spacing[2]}px ${spacing[3]}px`,
                      background: isActive ? colors.containerFill : "transparent",
                      border: "none",
                      borderRadius: radius.sm,
                      color: it.disabled ? colors.textMuted : colors.text,
                      fontSize: 14,
                      fontFamily: "inherit",
                      cursor: it.disabled ? "not-allowed" : "pointer",
                      textAlign: "left",
                    }}
                  >
                    {it.description ? (
                      // A two-line row marks the active item with a bar as well as the fill.
                      <span
                        aria-hidden="true"
                        style={{ alignSelf: "stretch", width: 2, flex: "none", borderRadius: 1, background: isActive ? colors.primaryAccent : "transparent" }}
                      />
                    ) : null}
                    {it.icon ? <Icon name={it.icon} size={16} color="textMuted" /> : null}
                    <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: spacing[2] }}>
                        <span>{it.label}</span>
                        {it.badge ? (
                          <span
                            style={{
                              flex: "none",
                              padding: `2px ${spacing[2]}px`,
                              borderRadius: radius.sm,
                              fontSize: 11,
                              lineHeight: 1.45,
                              ...(it.badge.tone === "danger"
                                ? { background: colors.statusError, color: colors.surfaceFill }
                                : { border: `1px solid ${colors.stroke}`, color: colors.textMuted }),
                            }}
                          >
                            {it.badge.label}
                          </span>
                        ) : null}
                      </span>
                      {it.description ? (
                        <span style={{ fontSize: 11, lineHeight: 1.45, color: colors.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {it.description}
                        </span>
                      ) : null}
                    </span>
                    {it.hint ? (
                      <span
                        style={{
                          flex: "none",
                          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                          fontSize: 13,
                          color: colors.textMuted,
                          textAlign: "right",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {it.hint}
                      </span>
                    ) : null}
                    {shortcutColumn ? (
                      it.shortcut ? (
                        <kbd
                          style={{
                            flex: "none",
                            minWidth: 38,
                            padding: `2px ${spacing[2]}px`,
                            border: `1px solid ${colors.stroke}`,
                            borderRadius: radius.sm,
                            fontFamily: "inherit",
                            fontSize: 11,
                            lineHeight: 1.45,
                            color: colors.textMuted,
                            textAlign: "center",
                          }}
                        >
                          {it.shortcut}
                        </kbd>
                      ) : (
                        <span aria-hidden="true" style={{ flex: "none", width: 38 }} />
                      )
                    ) : null}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        {footer ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: spacing[4],
              padding: `${spacing[3]}px ${spacing[4]}px`,
              borderTop: `1px solid ${colors.stroke}`,
              background: colors.primaryFill,
              fontSize: 11,
              lineHeight: 1.45,
              color: colors.textMuted,
            }}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}

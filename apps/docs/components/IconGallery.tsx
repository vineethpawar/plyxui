"use client";

/**
 * IconGallery — the material-icons-style browse page for the registry.
 *
 * Renders every registered icon in a searchable grid; clicking a cell
 * opens a popup with size previews and copyable snippets. Icons draw
 * straight from their IconDef data (same geometry the Icon component
 * renders) so the gallery works without a ThemeProvider in the MDX tree.
 */
import { useEffect, useMemo, useState } from "react";
import { registerIcons, snapshotRegistry, type IconDef, type IconElement } from "@plyxui/icons";
import { seedPack, lucidePack } from "@plyxui/icons/pack";

// Module scope: register once, before first render. Lucide second so its
// geometry wins where the seed pack shares a name.
registerIcons(seedPack as Record<string, IconDef>);
registerIcons(lucidePack as Record<string, IconDef>);

function IconSvg({ def, size, color, strokeWidth = 2 }: { def: IconDef; size: number; color: string; strokeWidth?: number }) {
  const filled = def.filled ?? false;
  return (
    <svg
      width={size}
      height={size}
      viewBox={def.viewBox ?? "0 0 24 24"}
      fill={filled ? color : "none"}
      stroke={filled ? "none" : color}
      strokeWidth={filled ? undefined : strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {def.elements.map((e: IconElement, i: number) => {
        switch (e.kind) {
          case "path":
            return <path key={i} d={e.d} fillRule={e.fillRule} clipRule={e.clipRule} />;
          case "circle":
            return <circle key={i} cx={e.cx} cy={e.cy} r={e.r} />;
          case "rect":
            return <rect key={i} x={e.x} y={e.y} width={e.width} height={e.height} rx={e.rx} />;
          case "line":
            return <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} />;
          case "polyline":
            return <polyline key={i} points={e.points} />;
        }
      })}
    </svg>
  );
}

function CopyRow({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard blocked — the text is selectable */
    }
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--muted)" }}>
        {label}
      </span>
      <button
        onClick={copy}
        title="Copy"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          textAlign: "left",
          fontFamily: "var(--font-mono, ui-monospace, Menlo, monospace)",
          fontSize: 12.5,
          background: "var(--code-bg)",
          border: "1px solid var(--code-stroke)",
          borderRadius: 8,
          padding: "9px 12px",
          color: "var(--text)",
          cursor: "pointer",
          width: "100%",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{code}</span>
        <span style={{ flex: "none", fontSize: 10.5, fontWeight: 800, color: copied ? "var(--green)" : "var(--orange)" }}>
          {copied ? "Copied" : "Copy"}
        </span>
      </button>
    </div>
  );
}

function IconPopup({ name, def, aliases, onClose }: { name: string; def: IconDef; aliases: string[]; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-label={`${name} icon details`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(460px, 100%)",
          background: "var(--surface)",
          border: "1px solid var(--stroke)",
          borderRadius: 16,
          padding: 22,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          boxShadow: "0 24px 64px rgba(0,0,0,0.45)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-mono, ui-monospace, Menlo, monospace)", fontSize: 15, fontWeight: 700 }}>
            {name}
            {aliases.length > 0 ? (
              <span style={{ fontSize: 11.5, fontWeight: 500, color: "var(--muted)", marginLeft: 8 }}>
                also registered as {aliases.join(", ")}
              </span>
            ) : null}
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: "transparent", border: 0, color: "var(--muted)", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 4 }}
          >
            ×
          </button>
        </div>

        {/* Size ramp — the same def at the sizes real UIs use */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 26,
            padding: "18px 12px",
            background: "var(--elev)",
            border: "1px solid var(--stroke-soft)",
            borderRadius: 12,
          }}
        >
          {[16, 20, 24, 32, 48].map((s) => (
            <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <IconSvg def={def} size={s} color="var(--text)" />
              <span style={{ fontSize: 10, color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>{s}</span>
            </div>
          ))}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <IconSvg def={def} size={32} color="var(--orange)" />
            <span style={{ fontSize: 10, color: "var(--muted)" }}>token</span>
          </div>
        </div>

        <CopyRow label="Use it" code={`<Icon name="${name}" />`} />
        <CopyRow label="Sized + themed" code={`<Icon name="${name}" size={24} color="primaryOrange" />`} />
        <CopyRow label="Boot (once per app)" code={`import { registerIcons } from "@plyxui/icons"; import { lucidePack } from "@plyxui/icons/pack"; registerIcons(lucidePack);`} />
      </div>
    </div>
  );
}

export function IconGallery() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  // The seed pack registered a few camelCase names (arrowLeft) that the
  // lucide pack re-ships in kebab-case (arrow-left). Same glyph, two
  // names — collapse to the kebab-case canonical and keep the other
  // spelling as a searchable alias shown in the popup.
  const all = useMemo(() => {
    const byGlyph = new Map<string, { name: string; def: IconDef; aliases: string[] }>();
    for (const { name, def } of snapshotRegistry()) {
      const key = name.replace(/-/g, "").toLowerCase();
      const existing = byGlyph.get(key);
      if (!existing) {
        byGlyph.set(key, { name, def, aliases: [] });
      } else if (name.includes("-") && !existing.name.includes("-")) {
        byGlyph.set(key, { name, def, aliases: [...existing.aliases, existing.name] });
      } else {
        existing.aliases.push(name);
      }
    }
    return [...byGlyph.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, []);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(({ name, aliases }) => name.includes(q) || aliases.some((a) => a.toLowerCase().includes(q)));
  }, [all, query]);

  const selectedEntry = selected ? all.find((i) => i.name === selected) : undefined;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search icons…"
          aria-label="Search icons"
          style={{
            flex: 1,
            font: "inherit",
            fontSize: 14,
            padding: "10px 14px",
            background: "var(--surface)",
            border: "1px solid var(--stroke)",
            borderRadius: 10,
            color: "var(--text)",
            outline: "none",
          }}
        />
        <span style={{ fontSize: 12.5, color: "var(--muted)", fontVariantNumeric: "tabular-nums", flex: "none" }}>
          {shown.length} of {all.length}
        </span>
      </div>

      {shown.length === 0 ? (
        <div style={{ padding: 28, textAlign: "center", color: "var(--muted)", fontSize: 13.5, background: "var(--elev)", borderRadius: 12 }}>
          Nothing named like “{query}”. Registry names are kebab-case, e.g. chevron-right.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
            gap: 10,
          }}
        >
          {shown.map(({ name, def }) => (
            <button
              key={name}
              onClick={() => setSelected(name)}
              title={name}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: "16px 6px 12px",
                background: "var(--surface)",
                border: "1px solid var(--stroke-soft)",
                borderRadius: 12,
                cursor: "pointer",
                color: "var(--text)",
                transition: "border-color 0.12s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--orange)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--stroke-soft)"; }}
            >
              <IconSvg def={def} size={24} color="currentColor" />
              <span
                style={{
                  fontSize: 10.5,
                  color: "var(--muted)",
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {name}
              </span>
            </button>
          ))}
        </div>
      )}

      {selectedEntry ? (
        <IconPopup name={selectedEntry.name} def={selectedEntry.def} aliases={selectedEntry.aliases} onClose={() => setSelected(null)} />
      ) : null}
    </div>
  );
}

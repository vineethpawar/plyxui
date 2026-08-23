#!/usr/bin/env node
/**
 * gen-lucide-pack.mjs — generates src/pack/lucide.ts from lucide-static.
 *
 * This is the codegen the seed pack's header promised: instead of
 * hand-drawn approximations, the pack carries lucide's actual geometry
 * (ISC license — https://lucide.dev/license) parsed into IconDef
 * elements, so web and native render identical, weight-consistent
 * icons through the existing registry.
 *
 * Run from packages/icons:  node scripts/gen-lucide-pack.mjs
 *
 * Notes:
 * - Each semantic name maps to candidate lucide file names (lucide
 *   renames across versions — e.g. alert-triangle → triangle-alert);
 *   the first that exists wins.
 * - polygon elements are converted to closed paths so IconElement and
 *   both renderers stay untouched.
 * - Brand icons (github, linkedin) were removed from lucide; the
 *   classic feather-lineage geometry is embedded below.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = resolve(HERE, "../../../node_modules/lucide-static/icons");
const OUT = resolve(HERE, "../src/pack/lucide.ts");

/** semantic name → lucide file-name candidates (first hit wins). */
const ICON_LIST = {
  grip: ["grip-vertical"],
  "chevron-down": ["chevron-down"],
  "chevron-up": ["chevron-up"],
  "chevron-right": ["chevron-right"],
  "chevron-left": ["chevron-left"],
  heart: ["heart"],
  undo: ["undo-2"],
  redo: ["redo-2"],
  maximize: ["maximize-2"],
  minimize: ["minimize-2"],
  sun: ["sun"],
  moon: ["moon"],
  gem: ["gem"],
  warning: ["triangle-alert", "alert-triangle"],
  upload: ["upload"],
  download: ["download"],
  "git-branch": ["git-branch"],
  pencil: ["pencil"],
  sparkles: ["sparkles"],
  "arrow-left": ["arrow-left"],
  "arrow-right": ["arrow-right"],
  "arrow-up": ["arrow-up"],
  "arrow-down": ["arrow-down"],
  "external-link": ["external-link"],
  check: ["check"],
  x: ["x"],
  plus: ["plus"],
  minus: ["minus"],
  kebab: ["ellipsis", "more-horizontal"],
  search: ["search"],
  "zoom-in": ["zoom-in"],
  "zoom-out": ["zoom-out"],
  "file-text": ["file-text"],
  "file-down": ["file-down"],
  enter: ["corner-down-left"],
  backspace: ["delete"],
  star: ["star"],
  "layout-template": ["layout-template"],
  palette: ["palette"],
  eye: ["eye"],
  users: ["users"],
  trophy: ["trophy"],
  briefcase: ["briefcase"],
  menu: ["menu"],
  settings: ["settings"],
  copy: ["copy"],
  share: ["share-2"],
};

/** Removed from lucide upstream; classic feather-lineage geometry. */
const EXTRA_ICONS = {
  github: {
    elements: [
      {
        kind: "path",
        d: "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4",
      },
      { kind: "path", d: "M9 18c-4.51 2-5-2-7-2" },
    ],
  },
  linkedin: {
    elements: [
      { kind: "path", d: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4V8h4v2a6 6 0 0 1 2-2z" },
      { kind: "rect", x: 2, y: 9, width: 4, height: 12 },
      { kind: "circle", cx: 4, cy: 4, r: 2 },
    ],
  },
  /** heart with filled=true for the liked state. */
  "heart-filled": null, // derived from heart below
};

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

function parseSvgElements(svg) {
  const elements = [];
  const tagRe = /<(path|circle|rect|line|polyline|polygon)\b([^/>]*)\/?>/g;
  let m;
  while ((m = tagRe.exec(svg))) {
    const [, tag, attrStr] = m;
    const attrs = {};
    const attrRe = /([a-zA-Z-]+)="([^"]*)"/g;
    let a;
    while ((a = attrRe.exec(attrStr))) attrs[a[1]] = a[2];
    switch (tag) {
      case "path":
        elements.push({ kind: "path", d: attrs.d });
        break;
      case "circle":
        elements.push({ kind: "circle", cx: num(attrs.cx), cy: num(attrs.cy), r: num(attrs.r) });
        break;
      case "rect":
        elements.push({
          kind: "rect",
          x: num(attrs.x),
          y: num(attrs.y),
          width: num(attrs.width),
          height: num(attrs.height),
          ...(attrs.rx !== undefined ? { rx: num(attrs.rx) } : {}),
        });
        break;
      case "line":
        elements.push({ kind: "line", x1: num(attrs.x1), y1: num(attrs.y1), x2: num(attrs.x2), y2: num(attrs.y2) });
        break;
      case "polyline":
        elements.push({ kind: "polyline", points: attrs.points });
        break;
      case "polygon":
        // Close the shape as a path so IconElement stays unchanged.
        elements.push({ kind: "path", d: `M${attrs.points}Z` });
        break;
    }
  }
  return elements;
}

const pack = {};
const missing = [];
for (const [semantic, candidates] of Object.entries(ICON_LIST)) {
  const file = candidates.map((c) => resolve(ICONS_DIR, `${c}.svg`)).find(existsSync);
  if (!file) {
    missing.push(`${semantic} (tried: ${candidates.join(", ")})`);
    continue;
  }
  const elements = parseSvgElements(readFileSync(file, "utf8"));
  if (elements.length === 0) {
    missing.push(`${semantic} (no parseable elements in ${file})`);
    continue;
  }
  pack[semantic] = { elements };
}
for (const [name, def] of Object.entries(EXTRA_ICONS)) {
  if (def) pack[name] = def;
}
if (pack.heart) pack["heart-filled"] = { filled: true, elements: pack.heart.elements };

if (missing.length) {
  console.error("✗ missing icons:\n  " + missing.join("\n  "));
  process.exit(1);
}

const names = Object.keys(pack).sort();
const body = names
  .map((n) => `  ${JSON.stringify(n)}: ${JSON.stringify(pack[n])},`)
  .join("\n");

writeFileSync(
  OUT,
  `/**
 * GENERATED by scripts/gen-lucide-pack.mjs — do not edit by hand.
 *
 * Geometry from lucide (https://lucide.dev, ISC license), parsed into
 * IconDef elements so web and native render identically through the
 * registry. Brand icons (github, linkedin) carry the classic
 * feather-lineage paths, which lucide has since removed upstream.
 * Regenerate: cd packages/icons && node scripts/gen-lucide-pack.mjs
 */
import type { IconDef } from "../registry";

export const lucidePack = {
${body}
} as const satisfies Record<string, IconDef>;

export type LucidePackName = keyof typeof lucidePack;
`,
);
console.log(`✓ wrote ${names.length} icons to src/pack/lucide.ts`);

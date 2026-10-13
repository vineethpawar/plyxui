---
"@plyxui/plugins": minor
"@plyxui/mcp": patch
---

CommandPalette items can carry a `description` line, a right-aligned monospaced `hint` (say, the CLI a GUI action wraps), a `shortcut` chip, a `badge` for commands with consequences (`tone: "danger"` fills it) and an `onAltSelect` run on Cmd+Enter. The palette takes `leading`, `trailing` and `footer` slots, searches the hint and description too, and keeps the selection in view while the arrow keys walk a long list. Every addition is optional: a plain list renders exactly as before.

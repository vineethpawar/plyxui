# @plyxui/primitives

## 0.6.0

### Minor Changes

- b77a91a: E0 systems — the components that make the library feel alive:

  - **Presence** — mount/unmount transition primitive. Children stay in the tree while the exit animation runs, then unmount (`onExitComplete`). WAAPI on the motion tokens on web, Animated.timing on native; reduced motion collapses to a fast fade. Dialog, Popover, and the Toaster are built on it.
  - **Skeleton** — shimmer placeholder (`text` / `rect` / `circle`, multi-line text). Gradient sweep over containerFill on web, opacity pulse on native; static fill under reduced motion.
  - **AnimatedNumber** — count-up/down digits for score moments. rAF + ease-out over `motion.celebrate`, tabular-nums so layout doesn't wobble; snaps under reduced motion.
  - **Dialog** — the composed modal: one theme `scrim` color (new token), Presence scale 0.98 + fade, focus trap + focus restore, body scroll lock, Escape/backdrop dismiss, `Dialog.Title` / `Dialog.Description` / `Dialog.Actions`, and `tone="danger"` recoloring the primary action.
  - **Popover** — one floating-panel primitive to replace ad-hoc absolute panels. No portal, no positioning engine — positions inside a wrapping relative container; outside-mousedown + Escape close. Native renders inline (documented divergence, Tooltip-style).
  - **Toaster, Sonner-grade** — stacked-collapsed pile, newest on top, three peeking behind with scale/translate offsets, expands on hover. Hover and hidden tabs pause the timers; `action: { label, onClick }` renders a button and makes the toast stick until dismissed (Undo pattern). Existing `toast()` calls work unchanged; the queue grew `pause` / `resume` / `pauseAll` / `resumeAll`.
  - **Focus rings** — Input, Textarea, and forms Select draw a two-part ring on focus (page-fill gap + primaryOrange) transitioned on `motion.controlHover`. Inline styles can't express `:focus-visible`, so the ring shows on every focus for now.

### Patch Changes

- Updated dependencies [b77a91a]
- Updated dependencies [def98ef]
  - @plyxui/core@0.4.0
  - @plyxui/hooks@0.4.0

## 0.5.0

### Minor Changes

- e2e3a77: Add seven primitives, each with web + native implementations:

  - **Textarea** — multiline input with auto-grow (web) and top-aligned multiline (native)
  - **Card** — hairline surface, border warms on hover when interactive
  - **Badge** — tone-driven pill (accent / semantic / ghost), optional soft fill
  - **Progress** — scaleX meter that moves smoothly on live value changes
  - **Switch** — binary toggle with a sliding thumb
  - **Segmented** — compact single-select for 2–4 exclusive views
  - **Collapsible** — titled expand/collapse (grid-rows height on web, LayoutAnimation on native)

## 0.4.0

### Minor Changes

- 9a6021c: Wire actual `tsup` builds across every package. Consumers now install
  pre-bundled `dist/*.{js,cjs,d.ts}` instead of raw `.ts` source.

  Three things this changes:

  - **Drop-in for any bundler.** Vite, Next, Webpack, Metro, Rollup,
    esbuild, plain Node — none of them have to TS-compile from
    `node_modules` anymore. Snackager (Expo Snack) and other strict
    bundlers stop failing on `.ts` files in deps.
  - **Proper intellisense.** Every entry point emits a paired `.d.ts`
    (and `.d.cts`) so VS Code / WebStorm autocomplete works the same
    way it does for Mantine, Radix, etc. JSDoc on every exported
    symbol carries through to the type definitions.
  - **Smaller installs.** `dist/` tree-shakes; the published tarball
    drops `~30-40%` for most packages compared to source-publish.

  The exports field of every package now uses the standard pattern:

  ```jsonc
  {
    ".": {
      "react-native": {
        "types": "./dist/index.native.d.ts",
        "import": "./dist/index.native.js",
        "require": "./dist/index.native.cjs"
      },
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  }
  ```

  Source is still shipped in the tarball (`files: ["dist", "src"]`)
  for sourcemaps + reading the original code, but consumers resolve
  against `dist/`.

  Run `tsup` per package via `npm run build`. Turbo caches the
  output. CI now runs `npx turbo build --filter="@plyxui/*"` before
  `changesets/action` publishes.

### Patch Changes

- Updated dependencies [9a6021c]
  - @plyxui/core@0.3.0
  - @plyxui/styles@0.3.0

## 0.3.1

### Patch Changes

- 983fc15: Add `react-native` and `default` conditions to every package's `exports`
  field. Metro is strict about the Node.js exports spec — if `exports` is
  defined but doesn't list a condition Metro understands (it tries
  `react-native` first, then `default`), the resolver errors with
  "Package path . is not exported".

  This unblocks consumers using Metro (Expo Snack, React Native CLI,
  React Native Web bundling through Metro). Web consumers (Vite,
  Next.js, Webpack) were unaffected because they read `import`.

  No source changes — every condition still points at the same source
  files as before. Pure exports-field plumbing.

- Updated dependencies [983fc15]
  - @plyxui/core@0.2.1
  - @plyxui/styles@0.2.1

## 0.3.0

### Minor Changes

- 903acf5: Three new primitives: `Image`, `Divider`, `Spinner`.

  - `Image` wraps the native element with a themed loading skeleton, an
    `aspectRatio` prop, a `radius` token, and a `fallback` slot for when
    the URL 404s. Native uses RN `Image` with the same shape.
  - `Divider` is a themed line: horizontal or vertical, optional inline
    label for the OR-style splitter, dashed style available.
  - `Spinner` is an indeterminate loading indicator. SVG arc + CSS
    keyframe on web, RN `ActivityIndicator` on native. Five named sizes
    - raw pixels, accessible by default (`role=status`, `aria-label`).

  Phase 3 (primitives) is now complete: Box, Text, Stack, Flex, Input,
  Button, Image, Divider, Spinner.

## 0.2.0

### Minor Changes

- cab0e50: First public alpha: 0.1.0

  Eight packages ship together so consumers can pull only what they need.

  **@plyxui/core** — tokens, polymorphic types, headless hooks. Pure TS, zero DOM, zero RN.

  **@plyxui/styles** — ThemeProvider + useTheme. CSS variables on web, Appearance API on native. Follows OS preference until the user picks.

  **@plyxui/primitives** — Box, Text, Stack, Flex, Input, Button. Web + native parity.

  **@plyxui/icons** — Icon component with a registry pattern. Seed pack of 20 strokeable icons. Augment via module declaration.

  **@plyxui/layouts** — AppShell, Sidebar, ScreenContainer.

  **@plyxui/navigator** — defineRoutes + react-router / react-navigation adapters.

  **@plyxui/comps** — Modal, Dropdown.

  **@plyxui/mcp** — first-party MCP server stub. Tool surface defined; handler implementations are the next chunk of work.

  Source-only distribution for now: each package ships `src/` and consumers' bundlers compile. Pre-compiled `dist/` builds come in 0.2.

### Patch Changes

- Updated dependencies [cab0e50]
  - @plyxui/core@0.2.0
  - @plyxui/styles@0.2.0

# Community themes

One file per theme, named after the contributor's GitHub handle.

Nothing in this folder is a shared file, which is the point: a hundred people can each add
a theme on the same afternoon and none of their pull requests will conflict. See
[`CONTRIBUTING.md`](../../../../CONTRIBUTING.md) at the root for the full walkthrough.

| File | What it is |
|---|---|
| `_template.ts` | Copy this. Files starting with an underscore are skipped by the generator |
| `types.ts` | The `Theme` shape. `colors` is partial, so changing one token is a real theme |
| `index.ts` | **Generated.** Do not edit; run `npm run --workspace @plyxui/core themes` |
| anything else | A contributed theme |

## Why the barrel is generated

A hand-edited list would put every contributor on the same line of the same file, so the
second pull request to arrive would conflict with the first and so would all ninety-eight
after it. `scripts/build-themes.mjs` reads the folder instead. It runs as part of
`npm run build`, so a merged theme is importable without anyone editing a list.

## Using one

```ts
import { registerColorTokens } from "@plyxui/core";
import { themes } from "@plyxui/core/themes";

registerColorTokens(themes["vineethpawar"].colors);
```

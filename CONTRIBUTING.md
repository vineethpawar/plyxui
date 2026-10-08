# Contributing to plyxui

Your first pull request here can be a colour theme. It is a real contribution, it does not
need you to understand the rest of the codebase, and it will not collide with anyone else's.

This guide assumes you made your GitHub account an hour ago. If a step seems too small to
write down, that is on purpose.

## What you are adding

One new file, named after your GitHub handle, in `packages/core/src/themes/`. Nothing else.
You do not edit any shared file, so your pull request cannot conflict with anyone else's,
no matter how many people are doing this at the same time.

A theme says what colours plyxui should use. Every value is a `{ light, dark }` pair,
because the library supports both and a theme that only works in one is half finished.

## The steps

### 1. Fork

Open [github.com/vineethpawar/plyxui](https://github.com/vineethpawar/plyxui) and press
**Fork**, top right. That makes a copy of this project under your own account. You can
change anything in your copy; nobody else sees it until you ask.

### 2. Clone your fork

On your fork, press **Code**, copy the HTTPS address, then:

```bash
git clone https://github.com/YOUR-HANDLE/plyxui.git
cd plyxui
```

Use your own handle in that address, not mine. Cloning mine gives you a copy you cannot
push to.

### 3. Make a branch

```bash
git switch -c theme-YOUR-HANDLE
```

Work on a branch, not on `main`. It keeps your `main` clean so your next contribution
starts from a tidy copy.

### 4. Copy the template

```bash
cp packages/core/src/themes/_template.ts packages/core/src/themes/YOUR-HANDLE.ts
```

Name the file exactly your GitHub handle, in lowercase. That is what guarantees no two
people touch the same file.

### 5. Choose your colours

Open your new file and change the values. Set `name`, `author` and `description` at the
top, then change as many or as few colours as you like. Changing one is fine.

Every colour is a hex code like `#245FD4`. If you need somewhere to start, open
`packages/core/src/tokens/colors.ts` and look at the defaults.

Two things worth getting right:

- **Fill in both modes.** `light` is for a white background, `dark` for a near-black one.
- **Keep text readable.** If `text` and the fill behind it are close in brightness, nobody
  can read it. When in doubt, keep the defaults for `text` and change the accents.

### 6. Check it compiles

```bash
npm install
npm run --workspace @plyxui/core check-types
```

If that prints nothing, you are fine. If it complains, it will name the line.

### 7. Commit and push

```bash
git add packages/core/src/themes/YOUR-HANDLE.ts
git commit -m "themes: add YOUR-HANDLE"
git push origin theme-YOUR-HANDLE
```

### 8. Open the pull request

Go to your fork on GitHub. There will be a banner offering to open a pull request from the
branch you just pushed. Press it, check the title, and submit.

In the description, say in one line what you were going for. "Warm, high contrast, meant
for a bright room" tells a reviewer more than a list of hex codes they can already see.

## What happens next

I read it. If something needs changing I will say so in a comment, and you update the pull
request by pushing another commit to the same branch. It does not need to be closed and
reopened.

When it is merged, `node packages/core/scripts/build-themes.mjs` regenerates the barrel so
your theme is importable as part of `@plyxui/core/themes`. That script exists so that the
list of themes is never a file contributors have to edit, which is what would make these
pull requests conflict.

## Using a theme

```ts
import { registerColorTokens } from "@plyxui/core";
import { themes } from "@plyxui/core/themes";

registerColorTokens(themes["your-handle"].colors);
```

Call it before `<ThemeProvider>` mounts.

## Other ways in

A theme is the easiest first one, not the only one. Bug reports with a way to reproduce
them are genuinely useful, and so is any documentation sentence that confused you: if it
confused you it will confuse the next person, and you are the one who can still remember
why.

## A note on stars

If this is useful to you, star it. If it is not, do not. A star that was asked for tells
nobody anything, and GitHub treats organised starring as inauthentic activity, which helps
neither of us.

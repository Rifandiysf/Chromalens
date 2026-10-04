# Chromalens

Hover over any element on a website, read its color, and copy it in the format you need.
No DevTools, no hunting through CSS.

- **Formats:** HEX (8-digit when translucent), RGB, RGBA, HSL, HSLA, HWB, OKLCH, OKLAB, CSS name, Tailwind, `color(srgb)`.
  A "≈" before a CSS name or Tailwind value means the closest match, not an exact one.
- **Real rendered colors:** values come from computed styles, so CSS variables, inherited values and `currentColor` are already resolved.
- **Safe by design:** no host permissions. The picker is only injected into a tab after you click the toolbar icon.
- **Browsers:** Chrome, Edge, Brave and other Chromium browsers, and Firefox 109+ (all Manifest V3).

## Using it

1. Click the Chromalens toolbar icon (or press `Alt+Shift+C`).
2. Hover an element to preview its text, background and border colors (or SVG fill and stroke).
3. Click to lock the element, pick a format in the dropdown, then click a value to copy it.
4. Use the arrow next to a color to see every format at once.
5. Press `Esc` to unlock, and `Esc` again to exit.

## Development

Requirements: Node.js 20+ and [pnpm](https://pnpm.io).

```bash
pnpm install         # also generates the .wxt folder with types
pnpm dev             # Chrome with hot reload
pnpm dev:firefox     # Firefox with hot reload
pnpm check           # lint + typecheck + tests (what CI runs)
pnpm build           # production build in .output/chrome-mv3
pnpm zip             # store-ready zip (use zip:firefox for Firefox)
```

Load a production build by hand:
- **Chromium:** open `chrome://extensions`, enable Developer mode, click **Load unpacked** and select `.output/chrome-mv3`.
- **Firefox:** run `pnpm build:firefox`, open `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on** and select `.output/firefox-mv3/manifest.json`.

Before publishing to Firefox, replace the placeholder add-on ID in `wxt.config.ts`.

## Tech stack

| Concern | Choice | Why |
| --- | --- | --- |
| Extension framework | [WXT](https://wxt.dev) | Generates the manifest from code, builds for every browser, hot reload, zip for stores |
| Language | TypeScript (strict) | Typed messages, settings and color formats |
| Overlay UI | React inside a shadow root | Hover, lock, expand and copy are state-driven; the shadow root isolates styles from the page |
| Color science | [culori](https://culorijs.org) | Well-tested parsing and conversion instead of hand-written math |
| Tailwind palette | `tailwindcss/colors` | Always the official palette; update by bumping the dependency |
| Messaging | [@webext-core/messaging](https://webext-core.aklinker1.io/messaging/installation) | Type-safe messages between background and content script |
| Settings | WXT storage | Typed, synced between browsers |
| Tests | Vitest + Testing Library (jsdom) | Fast unit and component tests |
| Lint and format | Biome | One tool, one config |
| CI | GitHub Actions | Lint, typecheck, test and build on every pull request |

## Project structure

```
src/
  entrypoints/
    background.ts              Toolbar click, badge, injects the picker on demand
    inspector.content/         Content script entry and its stylesheet
  background/                  Background logic (badge, injection)
  core/
    color/                     Framework-free color logic: parse, convert, format, palettes
    dom/                       Reads the colors of a page element
  features/inspector/          The picker UI (React): components, hooks, controller
  shared/                      Messages, settings, clipboard, top-layer helper, errors
docs/ARCHITECTURE.md           How the pieces fit together
```

`src/core` has no dependency on React or the browser extension APIs, so it is easy to test and reuse.

## Known limitations

- Colors come from computed styles, so images, gradients and canvas pixels are not read.
- Only the top frame is inspected, not content inside iframes.
- The Tailwind match uses the current (v4) palette, so sites that use the v3 palette show "≈" for some colors.
- Browsers block extensions on internal pages (`chrome://`), extension stores and PDF viewers.

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)

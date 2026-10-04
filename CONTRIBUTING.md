# Contributing to Chromalens

Thanks for helping! This guide keeps contributions quick to review.

## Getting started

```bash
pnpm install
pnpm dev          # opens a browser with the extension loaded and hot reload
pnpm check        # run before every commit: lint + typecheck + tests
```

## Code conventions

- **Descriptive names.** Never use single-letter names (`i`, `e`, `c`), including loop counters and callback
  parameters. Write `colorFormat`, `mouseEvent`, `channelValue`.
- **Errors explain why.** An error message must say what failed and why, and ideally what the user can do.
  Use `ColorParseError` or a plain `Error` with a full sentence, and log with the `[Chromalens]` prefix.
- **Handle failures.** Anything that can fail (clipboard, storage, messaging, parsing page values) needs
  `try/catch` and a useful message. Never swallow an error silently.
- **User-facing text is English.** Labels, tooltips and error messages shown to users are in English.
- **Keep `src/core` pure.** It must not import React, `wxt` or any browser extension API.
- **Tests with behavior changes.** Add or update a test next to the code (`*.test.ts` or `*.test.tsx`).

Formatting and most style rules are enforced by Biome: run `pnpm lint:fix`.

## Adding a color format

1. Add one entry to `COLOR_FORMATS` in `src/core/color/color-formats.ts`. The order of the list is the order in the UI.
2. Add a test in `src/core/color/color-formats.test.ts`.

Never rename an existing format `id`: ids are saved in users' settings.

## Pull requests

1. Fork the repository and create a branch from `main`.
2. Keep each pull request focused on one change.
3. Run `pnpm check` and make sure it passes.
4. Describe what changed and why, and attach a screenshot for UI changes.

## Reporting bugs

Open an issue with the browser and version, the page URL (if it is public), what you expected and what happened.

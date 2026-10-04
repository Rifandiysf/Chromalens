# Architecture

## Flow

```
Toolbar click (or Alt+Shift+C)
        |
        v
background.ts ---- sendMessage('toggleInspector') ----> content script already on the tab?
        |                                                        |
        | no (message fails)                                     | yes: toggles the picker
        v
scripting.executeScript(content-scripts/inspector.js)
        |
        v
inspector.content -> InspectorController -> shadow root overlay (React)
        |
        v
hover -> readElementColors() -> formatColor() -> panel
click -> lock element -> pick format -> copy value
        |
        v
sendMessage('inspectorStateChanged') -> background updates the "ON" badge
```

## Key decisions

**On-demand injection.** The manifest has no `host_permissions` and no static content scripts. With the
`activeTab` permission, the browser grants access to a tab only after the user clicks the icon. The script is
injected once; later clicks toggle it with a message.

**Shadow root overlay.** WXT's `createShadowRootUi` renders the UI inside a shadow root, so page CSS cannot
break the panel and the panel cannot restyle the page. The stylesheet is imported with `?inline` and passed as
a string, so no network request or `web_accessible_resources` entry is needed.

**Top layer.** Page elements with a very high `z-index` (sticky navbars, modals) can cover the overlay even with
`z-index: 2147483647`. The overlay host is therefore promoted to the browser's top layer with the Popover API
(`src/shared/top-layer.ts`) and promoted again whenever the active element changes.

**Computed styles.** Colors come from `getComputedStyle`, which resolves CSS variables, inheritance and
`currentColor`. Values are parsed by culori, so modern syntaxes (`oklch()`, `color()`, `hwb()`) work. Colors outside
the sRGB gamut are mapped to the closest displayable color.

**Page isolation while picking.** Capture-phase listeners swallow clicks and related mouse events so links and
buttons do not trigger. Events that come from the overlay itself are recognized with `event.composedPath()`.

## Folders

| Folder | Rule |
| --- | --- |
| `src/core` | Pure logic. No React, no extension APIs. |
| `src/features/inspector` | UI and behavior of the picker. |
| `src/background` | Logic used by the background worker. |
| `src/shared` | Small helpers used by more than one part. |
| `src/entrypoints` | Thin files that WXT turns into manifest entries. Keep them small. |

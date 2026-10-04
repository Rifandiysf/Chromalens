import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  // Firefox still defaults to Manifest V2 in WXT, so V3 is forced to keep all browsers on one code path.
  manifestVersion: 3,
  manifest: ({ browser }) => ({
    name: 'Chromalens',
    description:
      'Hover over any element on a website to read its color, then copy it as HEX, RGB, HSL, OKLCH, Tailwind and more.',
    // "activeTab" grants access to the current tab only after the user clicks the toolbar icon,
    // so no broad host permissions are needed.
    permissions: ['activeTab', 'scripting', 'storage'],
    action: {
      default_title: 'Chromalens: click to start picking colors',
    },
    commands: {
      _execute_action: {
        suggested_key: { default: 'Alt+Shift+C', mac: 'Alt+Shift+C' },
        description: 'Start or stop Chromalens on the current tab',
      },
    },
    ...(browser === 'firefox' && {
      browser_specific_settings: {
        gecko: { id: 'color-ninja@example.com', strict_min_version: '109.0' },
      },
    }),
  }),
});

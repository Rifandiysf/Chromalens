import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  manifestVersion: 3,
  manifest: ({ browser }) => ({
    name: 'Chromalens',
    description:
      'Hover over any element on a website to read its color, then copy it as HEX, RGB, HSL, OKLCH, Tailwind and more.',
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
        gecko: {
          id: 'rifandiyusuf47@gmail.com',
          strict_min_version: '140.0',
          data_collection_permissions: {
            required: ['none'],
          },
        },
      },
    }),
  }),
});
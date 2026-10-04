import { browser } from 'wxt/browser';
import { defineBackground } from 'wxt/utils/define-background';
import { setActiveBadge, showErrorBadge } from '@/background/action-badge';
import { describeToggleFailure, toggleInspectorOnTab } from '@/background/toggle-inspector';
import { onMessage } from '@/shared/messages';

export default defineBackground(() => {
  browser.action.onClicked.addListener(async (tab) => {
    if (tab.id === undefined) {
      console.error('[Chromalens] The toolbar click did not include a tab id, so there is no page to inspect.');
      return;
    }

    try {
      await toggleInspectorOnTab(tab.id);
    } catch (toggleError) {
      const explanation = describeToggleFailure(toggleError);
      console.error(`[Chromalens] ${explanation}`, toggleError);
      await showErrorBadge(tab.id, explanation);
    }
  });

  onMessage('inspectorStateChanged', async ({ data, sender }) => {
    if (sender.tab?.id === undefined) {
      console.warn('[Chromalens] Ignored a state message that did not come from a tab.');
      return;
    }
    await setActiveBadge(sender.tab.id, data.isActive);
  });
});

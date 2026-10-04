import { browser } from 'wxt/browser';
import { getErrorMessage } from '@/shared/errors';

const ACTIVE_BADGE_TEXT = 'ON';
const ERROR_BADGE_TEXT = '!';
const ACTIVE_BADGE_COLOR = '#8b7bff';
const ERROR_BADGE_COLOR = '#d9483b';
const ERROR_BADGE_DURATION_MILLISECONDS = 6000;

export const DEFAULT_ACTION_TITLE = 'Chromalens: click to start picking colors';

export async function setActiveBadge(tabId: number, isActive: boolean): Promise<void> {
  try {
    await browser.action.setBadgeBackgroundColor({ tabId, color: ACTIVE_BADGE_COLOR });
    await browser.action.setBadgeText({ tabId, text: isActive ? ACTIVE_BADGE_TEXT : '' });
  } catch (badgeError) {
    console.warn(`[Chromalens] Could not update the badge on tab ${tabId}: ${getErrorMessage(badgeError)}`);
  }
}

export async function showErrorBadge(tabId: number, explanation: string): Promise<void> {
  try {
    await browser.action.setBadgeBackgroundColor({ tabId, color: ERROR_BADGE_COLOR });
    await browser.action.setBadgeText({ tabId, text: ERROR_BADGE_TEXT });
    await browser.action.setTitle({ tabId, title: explanation });
  } catch (badgeError) {
    console.warn(`[Chromalens] Could not show the error badge on tab ${tabId}: ${getErrorMessage(badgeError)}`);
    return;
  }

  setTimeout(async () => {
    try {
      await browser.action.setBadgeText({ tabId, text: '' });
      await browser.action.setTitle({ tabId, title: DEFAULT_ACTION_TITLE });
    } catch (resetError) {
      console.debug(`[Chromalens] Skipped resetting the error badge on tab ${tabId}: ${getErrorMessage(resetError)}`);
    }
  }, ERROR_BADGE_DURATION_MILLISECONDS);
}

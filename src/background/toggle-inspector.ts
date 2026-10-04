import { browser } from 'wxt/browser';
import { getErrorMessage } from '@/shared/errors';
import { sendMessage } from '@/shared/messages';

const INSPECTOR_SCRIPT_PATH = '/content-scripts/inspector.js';

const RESTRICTED_PAGE_ERROR_PATTERN = /cannot access|cannot be scripted|extensions gallery|missing host permission/i;

export function describeToggleFailure(thrownValue: unknown): string {
  const originalMessage = getErrorMessage(thrownValue);

  if (RESTRICTED_PAGE_ERROR_PATTERN.test(originalMessage)) {
    return 'Chromalens cannot run on this page. Browsers block extensions on internal pages (like chrome://), extension stores and PDF viewers. Open a regular website and try again.';
  }

  return `Chromalens could not start on this tab. Reason: ${originalMessage}`;
}

export async function toggleInspectorOnTab(tabId: number): Promise<void> {
  try {
    await sendMessage('toggleInspector', undefined, tabId);
    return;
  } catch (messageError) {
    console.debug(
      `[Chromalens] No picker is running on tab ${tabId} yet, injecting it: ${getErrorMessage(messageError)}`,
    );
  }

  await browser.scripting.executeScript({ target: { tabId }, files: [INSPECTOR_SCRIPT_PATH] });
}

import { getErrorMessage } from './errors';

export class ClipboardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ClipboardError';
  }
}

function copyTextWithLegacyCommand(textToCopy: string): void {
  const temporaryTextArea = document.createElement('textarea');
  temporaryTextArea.value = textToCopy;
  temporaryTextArea.setAttribute('readonly', '');
  temporaryTextArea.style.position = 'fixed';
  temporaryTextArea.style.top = '-1000px';
  document.documentElement.appendChild(temporaryTextArea);

  try {
    temporaryTextArea.select();
    if (!document.execCommand('copy')) {
      throw new ClipboardError(
        'Could not copy to the clipboard because the browser blocked both the Clipboard API and the fallback copy command. Click the value again to retry.',
      );
    }
  } finally {
    temporaryTextArea.remove();
  }
}

export async function copyTextToClipboard(textToCopy: string): Promise<void> {
  if (typeof navigator.clipboard?.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(textToCopy);
      return;
    } catch (clipboardError) {
      console.warn(
        `[Chromalens] The Clipboard API rejected the copy request (${getErrorMessage(clipboardError)}). Trying the fallback copy command instead.`,
      );
    }
  }

  copyTextWithLegacyCommand(textToCopy);
}

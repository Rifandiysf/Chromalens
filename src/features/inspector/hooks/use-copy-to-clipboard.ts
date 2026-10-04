import { useCallback, useEffect, useRef, useState } from 'react';
import { copyTextToClipboard } from '@/shared/clipboard';
import { getErrorMessage } from '@/shared/errors';
import { STATUS_MESSAGE_DURATION_MILLISECONDS } from '../constants';

export interface CopyStatus {
  message: string;
  tone: 'success' | 'error';
}

/** Copies text and exposes a short-lived status message ("Copied ..." or the reason it failed). */
export function useCopyToClipboard() {
  const [copyStatus, setCopyStatus] = useState<CopyStatus | null>(null);
  const resetTimeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimeoutId.current !== null) {
        clearTimeout(resetTimeoutId.current);
      }
    },
    [],
  );

  const copyValue = useCallback(async (valueToCopy: string) => {
    try {
      await copyTextToClipboard(valueToCopy);
      setCopyStatus({ message: `Copied ${valueToCopy}`, tone: 'success' });
    } catch (copyError) {
      console.error(`[Chromalens] Copy failed for "${valueToCopy}": ${getErrorMessage(copyError)}`, copyError);
      setCopyStatus({ message: getErrorMessage(copyError), tone: 'error' });
    }

    if (resetTimeoutId.current !== null) {
      clearTimeout(resetTimeoutId.current);
    }
    resetTimeoutId.current = setTimeout(() => setCopyStatus(null), STATUS_MESSAGE_DURATION_MILLISECONDS);
  }, []);

  return { copyStatus, copyValue };
}

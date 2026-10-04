import { useCallback, useEffect, useState } from 'react';
import { type ColorFormatId, DEFAULT_COLOR_FORMAT_ID, isColorFormatId } from '@/core/color';
import { getErrorMessage } from '@/shared/errors';
import { selectedFormatSetting } from '@/shared/settings';

/** The color format the user picked, loaded from and saved to the extension's synced storage. */
export function useSelectedFormat() {
  const [selectedFormatId, setSelectedFormatId] = useState<ColorFormatId>(DEFAULT_COLOR_FORMAT_ID);

  useEffect(() => {
    let isCancelled = false;

    selectedFormatSetting
      .getValue()
      .then((storedFormatId) => {
        if (!isCancelled && isColorFormatId(storedFormatId)) {
          setSelectedFormatId(storedFormatId);
        }
      })
      .catch((storageError) => {
        console.warn(
          `[Chromalens] Could not load your saved color format, so "${DEFAULT_COLOR_FORMAT_ID}" is used instead. Reason: ${getErrorMessage(storageError)}`,
        );
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const changeSelectedFormat = useCallback((newFormatId: ColorFormatId) => {
    setSelectedFormatId(newFormatId);
    selectedFormatSetting.setValue(newFormatId).catch((storageError) => {
      console.warn(
        `[Chromalens] Could not save "${newFormatId}" as your preferred format, so it will reset next time. Reason: ${getErrorMessage(storageError)}`,
      );
    });
  }, []);

  return { selectedFormatId, changeSelectedFormat };
}

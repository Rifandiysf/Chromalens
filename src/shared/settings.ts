import { storage } from 'wxt/utils/storage';
import { type ColorFormatId, DEFAULT_COLOR_FORMAT_ID } from '@/core/color';

export const selectedFormatSetting = storage.defineItem<ColorFormatId>('sync:selectedFormatId', {
  fallback: DEFAULT_COLOR_FORMAT_ID,
});

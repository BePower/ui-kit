import { InjectionToken } from '@angular/core';

export interface UIBottomSheetConfig {
  closeLabel: string;
}

export const UI_BOTTOM_SHEET_CONFIG = new InjectionToken<UIBottomSheetConfig>(
  'UI_BOTTOM_SHEET_CONFIG',
);

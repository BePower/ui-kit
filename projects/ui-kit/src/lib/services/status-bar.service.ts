import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

import { StatusBar, Style } from '@capacitor/status-bar';

/**
 * A service for managing the status bar.
 */
@Injectable({ providedIn: 'root' })
export class StatusBarService {
  constructor() {}

  /**
   * Sets the status bar style to dark.
   */
  setStatusBarStyleDark = async () => {
    if (Capacitor.getPlatform() === 'web') {
      return;
    }
    await StatusBar.setStyle({ style: Style.Dark });
  };

  /**
   * Sets the status bar style to light.
   */
  setStatusBarStyleLight = async () => {
    if (Capacitor.getPlatform() === 'web') {
      return;
    }
    await StatusBar.setStyle({ style: Style.Light });
  };

  /**
   * Retrieves information about the status bar.
   * @returns A promise that resolves with information about the status bar.
   */
  getInfo = async () => {
    if (Capacitor.getPlatform() === 'web') {
      return {};
    }
    return StatusBar.getInfo();
  };

  /**
   * Hides the status bar.
   */
  hideStatusBar = async () => {
    if (Capacitor.getPlatform() === 'web') {
      return;
    }
    await StatusBar.hide();
  };

  /**
   * Shows the status bar.
   */
  showStatusBar = async () => {
    if (Capacitor.getPlatform() === 'web') {
      return;
    }
    await StatusBar.show();
  };
}

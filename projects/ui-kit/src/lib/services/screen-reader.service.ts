import { Injectable, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { ScreenReader } from '@capacitor/screen-reader';

/**
 * A service for observing the native screen reader state.
 */
@Injectable({ providedIn: 'root' })
export class ScreenReaderService {
  public screenState = signal(false);
  public screenStateKnown = signal(Capacitor.getPlatform() === 'web');
  private screenStateRevision = 0;

  constructor() {
    if (Capacitor.getPlatform() === 'web') {
      return;
    }

    void this.setInitialValue();
    void this.observeStateChanges();
  }

  /**
   * Requests focus for an element when the native screen reader is enabled.
   *
   * @returns A function that cancels an unresolved focus request.
   */
  focus(element: HTMLElement): () => void {
    let isActive = true;

    const focusWhenEnabled = async () => {
      const isEnabled = await this.isScreenReaderEnabled();

      if (!isActive || !isEnabled) {
        return;
      }

      isActive = false;

      if (element.isConnected) {
        element.focus({ preventScroll: true });
      }
    };

    void focusWhenEnabled();

    return () => {
      isActive = false;
    };
  }

  private async isScreenReaderEnabled(): Promise<boolean> {
    if (Capacitor.getPlatform() === 'web') {
      return false;
    }

    try {
      const { value } = await ScreenReader.isEnabled();
      return value;
    } catch {
      return false;
    }
  }

  private async setInitialValue(): Promise<void> {
    const revision = this.screenStateRevision;

    try {
      const { value } = await ScreenReader.isEnabled();

      if (revision !== this.screenStateRevision) {
        return;
      }

      this.setScreenReaderState(value);
    } catch {
      if (revision === this.screenStateRevision) {
        this.screenStateKnown.set(false);
      }
    }
  }

  private async observeStateChanges(): Promise<void> {
    try {
      await ScreenReader.addListener('stateChange', ({ value }) => {
        this.screenStateRevision += 1;
        this.setScreenReaderState(value);
      });
    } catch {
      // The initial state determines whether the condensed behavior is available.
    }
  }

  private setScreenReaderState(value: boolean): void {
    this.screenState.set(value);
    this.screenStateKnown.set(true);
  }
}

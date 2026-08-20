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
  private readonly pendingFocusRequests = new Set<() => void>();
  private screenStateRevision = 0;

  constructor() {
    if (Capacitor.getPlatform() === 'web') {
      return;
    }

    void this.setInitialValue();
    void this.observeStateChanges();
  }

  /**
   * Requests focus for an element once the native screen reader state is known.
   *
   * @returns A function that cancels an unresolved focus request.
   */
  focus(element: HTMLElement): () => void {
    let isActive = true;

    const focus = () => {
      if (!isActive) {
        return;
      }

      isActive = false;

      if (this.screenState() && element.isConnected) {
        element.focus({ preventScroll: true });
      }
    };

    if (this.screenStateKnown()) {
      focus();
    } else {
      this.pendingFocusRequests.add(focus);
    }

    return () => {
      isActive = false;
      this.pendingFocusRequests.delete(focus);
    };
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

    const pendingFocusRequests = [...this.pendingFocusRequests];
    this.pendingFocusRequests.clear();
    pendingFocusRequests.forEach((focus) => focus());
  }
}

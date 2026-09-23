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
  private pageFocusTarget?: () => HTMLElement | undefined;

  /** @internal The last entered page owns the return landmark until it leaves. */
  registerPageFocusTarget(target: () => HTMLElement | undefined): () => void {
    this.pageFocusTarget = target;
    return () => {
      if (this.pageFocusTarget === target) this.pageFocusTarget = undefined;
    };
  }

  /** Restore the current page landmark after Ionic removes the overlay. */
  focusCurrentPage(): () => void {
    const target = this.pageFocusTarget?.();
    return target ? this.focus(target, { onlyWhenEnabled: false, afterRender: true }) : () => {};
  }

  constructor() {
    if (Capacitor.getPlatform() === 'web') {
      return;
    }

    void this.setInitialValue();
    void this.observeStateChanges();
  }

  /**
   * Requests focus when the native screen reader is enabled, unless explicitly unconditional.
   * afterRender gives newly revealed views a paint before focus is applied.
   *
   * @returns A function that cancels an unresolved focus request.
   */
  focus(
    element: HTMLElement,
    options: { onlyWhenEnabled?: boolean; afterRender?: boolean } = {},
  ): () => void {
    let isActive = true;
    let frame: number | undefined;
    const view = element.ownerDocument.defaultView;

    const applyFocus = () => {
      if (!isActive || !this.canFocus(element)) return;
      isActive = false;
      element.focus({ preventScroll: true });
    };

    const requestFocus = () => {
      if (!isActive) return;
      if (options.afterRender && view) {
        // Leave one rendering opportunity between revealing the view and focusing it.
        frame = view.requestAnimationFrame(() => {
          frame = view.requestAnimationFrame(applyFocus);
        });
      } else {
        applyFocus();
      }
    };

    if (options.onlyWhenEnabled === false) {
      requestFocus();
    } else {
      void this.isScreenReaderEnabled().then((enabled) => {
        if (enabled) requestFocus();
      });
    }

    return () => {
      isActive = false;
      if (frame !== undefined) view?.cancelAnimationFrame(frame);
    };
  }

  private canFocus(element: HTMLElement): boolean {
    if (!element.isConnected) return false;
    const ancestors: Element[] = [];
    let current: Element | null = element;
    while (current) {
      ancestors.push(current);
      if (current.matches('[inert], [hidden], [aria-hidden="true"], .ion-page-hidden')) {
        return false;
      }
      const style = element.ownerDocument.defaultView?.getComputedStyle(current);
      if (style?.display === 'none' || style?.visibility === 'hidden') return false;
      const root = current.getRootNode();
      current = current.parentElement ?? (root instanceof ShadowRoot ? root.host : null);
    }

    // A delayed page request must never take focus out of an active Ionic overlay.
    const overlays = element.ownerDocument.querySelectorAll<
      HTMLElement & {
        presented?: boolean;
        focusTrap?: boolean;
      }
    >('ion-modal, ion-alert, ion-action-sheet, ion-popover, ion-loading');
    const top = Array.from(overlays)
      .filter((overlay) => overlay.presented && overlay.focusTrap !== false)
      .sort((a, b) => Number(a.style.zIndex) - Number(b.style.zIndex))
      .at(-1);
    return !top || ancestors.includes(top);
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

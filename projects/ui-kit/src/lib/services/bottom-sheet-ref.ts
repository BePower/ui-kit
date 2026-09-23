import type { ScreenReaderService } from './screen-reader.service';

/** Reference to one bottom sheet. Available through DI inside consumer content. */
export class UIBottomSheetRef<TResult = unknown> {
  private initialFocusTarget?: HTMLElement;
  private pendingScreenReader?: ScreenReaderService;
  private cancelFocusRequest?: () => void;

  constructor(
    private readonly dismiss: (data: TResult | undefined, role: string) => Promise<boolean>,
  ) {}

  close(data?: TResult): Promise<boolean> {
    return this.dismiss(data, 'confirm');
  }

  cancel(): Promise<boolean> {
    return this.dismiss(undefined, 'cancel');
  }

  /** @internal Coordinates initial focus after both the shell and modal are ready. */
  registerInitialFocusTarget(element: HTMLElement): void {
    this.initialFocusTarget = element;
    if (this.pendingScreenReader) {
      this.focusInitialTarget(this.pendingScreenReader);
    }
  }

  /** @internal Requests focus after presentation, or queues it until the shell is rendered. */
  focusInitialTarget(screenReader: ScreenReaderService): void {
    if (!this.initialFocusTarget) {
      this.pendingScreenReader = screenReader;
      return;
    }

    this.pendingScreenReader = undefined;
    this.cancelFocusRequest?.();
    this.cancelFocusRequest = screenReader.focus(this.initialFocusTarget, {
      onlyWhenEnabled: false,
      afterRender: true,
    });
  }

  /** @internal Releases references owned by the rendered shell. */
  clearInitialFocusTarget(): void {
    this.cancelFocusRequest?.();
    this.cancelFocusRequest = undefined;
    this.pendingScreenReader = undefined;
    this.initialFocusTarget = undefined;
  }
}

import { inject, Injectable, Injector } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { UI_BOTTOM_SHEET_CONFIG } from '../components/bottom-sheet/bottom-sheet-config';
import type {
  UIBottomSheetOptions,
  UIBottomSheetResult,
} from '../interfaces/bottom-sheet.interface';
import { ScreenReaderService } from './screen-reader.service';
import { UIBottomSheetRef } from './bottom-sheet-ref';

@Injectable({ providedIn: 'root' })
export class UIBottomSheetService {
  private readonly modalController = inject(ModalController);
  private readonly injector = inject(Injector);
  private readonly screenReader = inject(ScreenReaderService);
  private cancelPageFocusRequest?: () => void;

  /** Resolves when this specific overlay is dismissed, including backdrop/back-button dismissal. */
  async open<TResult = unknown, TContent = unknown>(
    options: UIBottomSheetOptions<TContent>,
  ): Promise<UIBottomSheetResult<TResult>> {
    if (!options.closeLabel?.trim()) {
      throw new Error('[UIBottomSheet] closeLabel is required.');
    }

    this.cancelPageFocusRequest?.();

    let modal: HTMLIonModalElement;
    const ref = new UIBottomSheetRef<TResult>((data, role) => modal.dismiss(data, role));
    const contentInjector = Injector.create({
      parent: options.injector ?? this.injector,
      providers: [
        { provide: UIBottomSheetRef, useValue: ref },
        {
          provide: UI_BOTTOM_SHEET_CONFIG,
          useValue: {
            closeLabel: options.closeLabel.trim(),
          },
        },
      ],
    });

    try {
      modal = await this.modalController.create({
        component: options.component,
        componentProps: options.componentProps ?? {},
        injector: contentInjector,
        cssClass: 'ui-kit-bottom-sheet',
        mode: 'ios',
        breakpoints: [0, 1],
        initialBreakpoint: 1,
        handle: false,
        backdropDismiss: options.backdropDismiss ?? false,
        // Important messages require explicit dismissal; hiding the handle alone does not stop swipe.
        canDismiss: async (_data, role) => role !== 'gesture',
      });
      let dismissing = false;
      const cancelInitialFocus = () => {
        dismissing = true;
        ref.clearInitialFocusTarget();
      };
      modal.addEventListener('ionModalWillDismiss', cancelInitialFocus);
      let dismissed = false;
      try {
        // Subscribe before presenting: content can dismiss during its own initialization.
        const dismissal = modal.onDidDismiss<TResult>();
        await modal.present();
        if (!dismissing) ref.focusInitialTarget(this.screenReader);
        const result = await dismissal;
        dismissed = true;
        return result;
      } finally {
        ref.clearInitialFocusTarget();
        modal.removeEventListener('ionModalWillDismiss', cancelInitialFocus);
        modal.remove();
        if (dismissed) {
          this.cancelPageFocusRequest = this.screenReader.focusCurrentPage();
        }
      }
    } finally {
      contentInjector.destroy();
    }
  }
}

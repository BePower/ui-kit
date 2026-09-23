import { inject, Injectable, Injector } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { UI_BOTTOM_SHEET_CONFIG } from '../components/bottom-sheet/bottom-sheet-config';
import type { UIBottomSheetOptions } from '../interfaces/bottom-sheet.interface';
import { UIBottomSheetHandle } from './bottom-sheet-handle';
import { ScreenReaderService } from './screen-reader.service';
import { UIBottomSheetRef } from './bottom-sheet-ref';

type Dismiss<TResult> = (data: TResult | undefined, role: string) => Promise<boolean>;

interface PendingDismissal<TResult> {
  data: TResult | undefined;
  role: string;
  resolve: (dismissed: boolean) => void;
  reject: (reason: unknown) => void;
}

@Injectable({ providedIn: 'root' })
export class UIBottomSheetService {
  private readonly modalController = inject(ModalController);
  private readonly injector = inject(Injector);
  private readonly screenReader = inject(ScreenReaderService);
  private cancelPageFocusRequest?: () => void;

  /** Presents one bottom sheet and returns instance-scoped external controls. */
  async present<TResult = unknown, TContent = unknown>(
    options: UIBottomSheetOptions<TContent>,
  ): Promise<UIBottomSheetHandle<TResult>> {
    if (!options.closeLabel?.trim()) {
      throw new Error('[UIBottomSheet] closeLabel is required.');
    }

    this.cancelPageFocusRequest?.();

    let dismissModal: Dismiss<TResult> | undefined;
    const pendingDismissals: PendingDismissal<TResult>[] = [];
    const ref = new UIBottomSheetRef<TResult>((data, role) => {
      if (dismissModal) {
        return dismissModal(data, role);
      }

      return new Promise<boolean>((resolve, reject) => {
        pendingDismissals.push({ data, role, resolve, reject });
      });
    });
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
    let modal: HTMLIonModalElement | undefined;
    let cancelInitialFocus: (() => void) | undefined;
    const cleanup = (restorePageFocus: boolean): void => {
      ref.clearInitialFocusTarget();
      if (modal && cancelInitialFocus) {
        modal.removeEventListener('ionModalWillDismiss', cancelInitialFocus);
      }
      modal?.remove();
      contentInjector.destroy();
      if (restorePageFocus) {
        this.cancelPageFocusRequest = this.screenReader.focusCurrentPage();
      }
    };
    const rejectPendingDismissals = (error: unknown): void => {
      dismissModal = () => Promise.reject(error);
      for (const pending of pendingDismissals.splice(0)) {
        pending.reject(error);
      }
    };

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
      const presentedModal = modal;
      let dismissing = false;
      cancelInitialFocus = () => {
        dismissing = true;
        ref.clearInitialFocusTarget();
      };
      presentedModal.addEventListener('ionModalWillDismiss', cancelInitialFocus);
      // Subscribe before presenting: content can dismiss during its own initialization.
      const dismissal = presentedModal.onDidDismiss<TResult>();
      await presentedModal.present();

      const modalDismiss: Dismiss<TResult> = (data, role) => presentedModal.dismiss(data, role);
      dismissModal = modalDismiss;
      if (pendingDismissals.length > 0) {
        dismissing = true;
      }
      for (const pending of pendingDismissals.splice(0)) {
        void modalDismiss(pending.data, pending.role).then(pending.resolve, pending.reject);
      }

      if (!dismissing) ref.focusInitialTarget(this.screenReader);
      const result = dismissal.then(
        (value) => {
          cleanup(true);
          return value;
        },
        (error: unknown) => {
          cleanup(false);
          throw error;
        },
      );
      return new UIBottomSheetHandle(ref, result);
    } catch (error) {
      rejectPendingDismissals(error);
      cleanup(false);
      throw error;
    }
  }
}

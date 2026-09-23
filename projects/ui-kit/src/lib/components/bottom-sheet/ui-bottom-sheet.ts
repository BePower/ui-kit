import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { IonModalToken } from '@ionic/angular/common';
import {
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonToolbar,
} from '@ionic/angular/standalone';
import { UIBottomSheetRef } from '../../services/bottom-sheet-ref';
import { UIButton } from '../button/ui-button';
import { UIIcon } from '../icon/ui-icon';
import { UI_BOTTOM_SHEET_CONFIG } from './bottom-sheet-config';

/** Layout shell used by components opened through UIBottomSheetService. */
@Component({
  selector: 'ui-bottom-sheet',
  standalone: true,
  imports: [IonButtons, IonContent, IonFooter, IonHeader, IonToolbar, UIButton, UIIcon],
  template: `
    <div class="ion-page">
      <ion-header #header class="ion-no-border" [translucent]="true">
        <ion-toolbar class="header-toolbar">
          @if (showCloseButton()) {
            <ion-buttons slot="end">
              <ui-button
                variant="secondary"
                size="min-icon"
                [ariaLabel]="config.closeLabel"
                (click)="sheetRef.cancel()"
              >
                <ui-icon name="close" fill="no-fill" color="green" size="32" />
              </ui-button>
            </ion-buttons>
          }
        </ion-toolbar>
      </ion-header>

      <ion-content [fullscreen]="true" [forceOverscroll]="false">
        <div #contentSurface class="content-surface" tabindex="-1">
          <ng-content></ng-content>
        </div>
      </ion-content>

      @if (hasFooter()) {
        <ion-footer #footer class="ion-no-border">
          <ion-toolbar>
            <ng-content select="[footer]"></ng-content>
          </ion-toolbar>
        </ion-footer>
      }
    </div>
  `,
  styleUrl: 'ui-bottom-sheet.scss',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UIBottomSheet {
  readonly showCloseButton = input(true, { transform: booleanAttribute });
  readonly hasFooter = input(false, { transform: booleanAttribute });
  protected readonly config = inject(UI_BOTTOM_SHEET_CONFIG);
  protected readonly sheetRef = inject(UIBottomSheetRef);
  private readonly modal = inject(IonModalToken, { optional: true });
  private readonly destroyRef = inject(DestroyRef);
  private readonly resizeObserver =
    typeof ResizeObserver === 'undefined'
      ? undefined
      : new ResizeObserver(() => this.updateHeight());
  private readonly mutationObserver =
    typeof MutationObserver === 'undefined'
      ? undefined
      : new MutationObserver(() => {
          this.observeProjectedContent();
          this.updateHeight();
        });
  private readonly header = viewChild.required<unknown, ElementRef<HTMLElement>>('header', {
    read: ElementRef,
  });
  private readonly contentSurface = viewChild.required<unknown, ElementRef<HTMLElement>>(
    'contentSurface',
    { read: ElementRef },
  );
  private readonly footer = viewChild<unknown, ElementRef<HTMLElement>>('footer', {
    read: ElementRef,
  });
  private appliedHeight = 0;
  private isHeightTrackingActive = false;

  constructor() {
    effect(() => {
      this.footer();
      if (this.isHeightTrackingActive) {
        this.observeProjectedContent();
        this.updateHeight();
      }
    });
    afterNextRender(() => {
      this.initializeDynamicHeight();
      this.sheetRef.registerInitialFocusTarget(this.contentSurface().nativeElement);
    });
    this.destroyRef.onDestroy(() => {
      this.sheetRef.clearInitialFocusTarget();
      this.resizeObserver?.disconnect();
      this.mutationObserver?.disconnect();
    });
  }

  private initializeDynamicHeight(): void {
    if (!this.modal || !this.resizeObserver || !this.mutationObserver) {
      return;
    }

    // Measure the intrinsic surface, not Ionic's scroll viewport. No asynchronous
    // initialization is needed, so observers cannot outlive a destroyed view.
    this.isHeightTrackingActive = true;
    this.observeProjectedContent();

    window.addEventListener('resize', this.updateHeight);
    this.destroyRef.onDestroy(() => window.removeEventListener('resize', this.updateHeight));
    this.updateHeight();
  }

  private observeProjectedContent(): void {
    const content = this.contentSurface().nativeElement;

    // Release removed descendants and rebuild subscriptions after projection changes.
    this.resizeObserver!.disconnect();
    this.mutationObserver!.disconnect();
    this.resizeObserver!.observe(content);
    this.resizeObserver!.observe(this.header().nativeElement);
    const footer = this.footer();
    if (footer) this.resizeObserver!.observe(footer.nativeElement);
    this.observeTree(content);
  }

  private observeTree(root: ParentNode): void {
    this.mutationObserver!.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    for (const element of Array.from(root.querySelectorAll('*'))) {
      this.resizeObserver!.observe(element);
      if (element.shadowRoot) {
        this.observeTree(element.shadowRoot);
      }
    }
  }

  private readonly updateHeight = (): void => {
    const chromeHeight =
      this.header().nativeElement.offsetHeight + (this.footer()?.nativeElement.offsetHeight ?? 0);
    const minimumHeight = window.innerHeight * 0.5;
    const modalOffsetTop = Number.parseFloat(
      getComputedStyle(this.modal!).getPropertyValue('--ion-modal-offset-top'),
    );
    const safeAreaTop = Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--ion-safe-area-top'),
    );
    let topInset = 0;
    if (Number.isFinite(safeAreaTop)) {
      topInset = safeAreaTop;
    }
    if (Number.isFinite(modalOffsetTop)) {
      topInset = modalOffsetTop;
    }
    const maximumHeight = window.innerHeight - topInset;
    const height = Math.min(
      maximumHeight,
      Math.max(minimumHeight, chromeHeight + this.contentSurface().nativeElement.scrollHeight),
    );

    if (height !== this.appliedHeight) {
      this.appliedHeight = height;
      this.modal!.style.setProperty('--height', `${height}px`);
    }
  };
}

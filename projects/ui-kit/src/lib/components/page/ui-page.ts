import { isPlatformBrowser } from '@angular/common';
import type { AfterViewInit, OnInit } from '@angular/core';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  NgZone,
  PLATFORM_ID,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  bindLifecycleEvents,
  type ViewDidEnter,
  type ViewDidLeave,
  type ViewWillEnter,
  type ViewWillLeave,
} from '@ionic/angular/common';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { ScreenReaderService } from '../../services/screen-reader.service';
import { StatusBarService } from '../../services/status-bar.service';
import { UIButton } from '../button/ui-button';
import { UIIcon } from '../icon/ui-icon';
import { arrowLeftNoFill as arrowLeftIcon } from '../icon/icons/arrow-left';
import type { IconName, IconVariant } from '../../interfaces/icon.interface';
import { UIProgressBar } from '../progress-bar/ui-progress-bar';
import { UIP } from '../p/ui-p';
import { UIText } from '../text/ui-text';

export interface HeaderButton {
  name: IconName;
  fill: IconVariant;
  ariaLabel: string;
  disabled?: boolean;
  callback: () => void;
}

export interface HeaderStep {
  currentStep: number;
  totalSteps: number;
  label: string;
  ariaLabel: string;
}

@Component({
  selector: 'ui-page',
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonFooter,
    IonToolbar,
    IonTitle,
    UIButton,
    IonButtons,
    UIIcon,
    IonBackButton,
    UIProgressBar,
    UIP,
    UIText,
  ],
  template: `
    <div class="ion-page">
      @if (hasHeader()) {
        <ion-header
          class="ion-no-border"
          [class.header-elevation-1]="isHeaderElevated()"
          [translucent]="translucent()"
          mode="ios"
        >
          <ion-toolbar
            [class]="['background-' + background(), 'header-background-' + headerType()]"
          >
            <ion-buttons slot="start">
              <ion-back-button
                mode="ios"
                [defaultHref]="backButtonDefaultHref()"
                [color]="ionicHeaderIconColor()"
                [icon]="backButtonIcon"
                text=""
              ></ion-back-button>
            </ion-buttons>
            @if (hasVisibleTitle()) {
              <ion-title [color]="ionicHeaderColor()">
                <span
                  #pageTitle
                  tabindex="-1"
                  role="heading"
                  aria-level="1"
                  [attr.aria-label]="screenReaderTitle()?.trim() || null"
                  >{{ title() }}</span
                >
              </ion-title>
            }
            <ion-buttons [collapse]="isCondensedHeaderEnabled()" slot="end">
              @for (headerButton of headerButtons(); track headerButton) {
                <ui-button
                  [ariaLabel]="headerButton.ariaLabel"
                  [disabled]="headerButton.disabled"
                  (click)="headerButton.callback()"
                  variant="secondary"
                  size="min-icon"
                >
                  <ui-icon
                    [name]="headerButton.name"
                    size="40"
                    [fill]="headerButton.fill"
                    [color]="ionicHeaderIconColor()"
                  ></ui-icon>
                </ui-button>
              }
            </ion-buttons>
          </ion-toolbar>
          @let step = headerStep();
          @if (isStepHeader() && step) {
            <ion-toolbar [class]="['header-step-toolbar', 'background-' + background()]">
              <ui-progress-bar
                [ariaLabel]="step.ariaLabel"
                [ariaValueText]="headerStepAriaLabel()"
                [value]="headerStepValue()"
              ></ui-progress-bar>
              <ui-p ariaHidden>
                <ui-text color="default-grey" variant="label-l">
                  {{ step.currentStep }}
                </ui-text>
                <ui-text color="default-grey" variant="body-m">
                  {{ step.label }} {{ step.totalSteps }}
                </ui-text>
              </ui-p>
            </ion-toolbar>
          }
        </ion-header>
      }

      <ion-content
        #content
        [class]="'background-' + background()"
        [forceOverscroll]="forceOverscroll()"
        [fullscreen]="true"
        [scrollEvents]="shouldObserveScroll()"
        (ionScroll)="onContentScroll()"
      >
        <div #pageContentSurface class="page-content-surface">
          @if (!hasVisibleTitle()) {
            <h1 #pageTitle class="screen-reader-only" tabindex="-1">{{ accessibleTitle() }}</h1>
          }

          @if (hasCondensedHeader()) {
            <ion-header collapse="condense" mode="ios">
              <ion-toolbar
                [class]="['background-' + background(), 'header-background-' + headerType()]"
              >
                <ion-title size="large" [color]="ionicHeaderColor()">
                  {{ title() }}
                </ion-title>
                <ion-buttons [collapse]="isCondensedHeaderEnabled()" slot="end">
                  @for (headerButton of headerButtons(); track headerButton) {
                    <ui-button
                      ariaHidden
                      [disabled]="headerButton.disabled"
                      (click)="headerButton.callback()"
                      variant="secondary"
                      size="min-icon"
                    >
                      <ui-icon
                        [name]="headerButton.name"
                        size="40"
                        [fill]="headerButton.fill"
                        [color]="ionicHeaderIconColor()"
                      ></ui-icon>
                    </ui-button>
                  }
                </ion-buttons>
              </ion-toolbar>
            </ion-header>
          }

          <ng-content></ng-content>
        </div>
      </ion-content>

      @if (hasFooter()) {
        <ion-footer class="ion-no-border" [class.footer-elevation-1]="isFooterElevated()">
          <ion-toolbar [class]="'background-' + background()">
            <ng-content select="[footer]"></ng-content>
          </ion-toolbar>
        </ion-footer>
      }
    </div>
  `,
  styleUrl: 'ui-page.scss',
  host: {
    '[class.no-header]': '!hasHeader()',
    '[class.no-footer]': '!hasFooter()',
  },
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UIPage
  implements AfterViewInit, OnInit, ViewWillEnter, ViewDidEnter, ViewWillLeave, ViewDidLeave
{
  background = input<'white' | 'grey' | 'light-green' | 'green' | 'yellow'>('white');
  headerType = input<'white' | 'green' | 'tab' | 'step'>('white');
  title = input<string>('');
  screenReaderTitle = input<string>();
  forceOverscroll = input(false, { transform: booleanAttribute });
  hasHeader = input(false, { transform: booleanAttribute });
  hasFooter = input(false, { transform: booleanAttribute });
  condensedHeader = input(false, { transform: booleanAttribute });
  translucent = input(false, { transform: booleanAttribute });
  headerButtons = input<HeaderButton[]>([]);
  headerStep = input<HeaderStep>();
  backButtonDefaultHref = input<string>();
  private readonly screenReader = inject(ScreenReaderService);
  readonly backButtonIcon = arrowLeftIcon;
  readonly isHeaderElevated = signal(false);
  readonly isFooterElevated = signal(false);
  readonly hasVisibleTitle = computed(() => this.hasHeader() && Boolean(this.title().trim()));
  readonly isStepHeader = computed(() => this.headerType() === 'step');
  readonly isCondensedHeaderEnabled = computed(
    () =>
      this.headerType() !== 'step' &&
      this.condensedHeader() &&
      this.hasVisibleTitle() &&
      this.screenReader.screenStateKnown() &&
      !this.screenReader.screenState(),
  );
  readonly accessibleTitle = computed(
    () => this.screenReaderTitle()?.trim() || this.title().trim() || '',
  );
  readonly headerStepValue = computed(() => {
    const step = this.headerStep();

    if (!step || step.totalSteps <= 0) {
      return 0;
    }

    return step.currentStep / step.totalSteps;
  });
  readonly headerStepAriaLabel = computed(() => {
    const step = this.headerStep();

    return step ? `${step.currentStep} ${step.label} ${step.totalSteps}` : '';
  });
  readonly hasCondensedHeader = computed(() => this.isCondensedHeaderEnabled());
  readonly shouldObserveScroll = computed(() => this.hasFooter() || this.hasHeader());

  ionicHeaderColor = computed(() => {
    switch (this.headerType()) {
      case 'white':
      case 'step':
        return 'default-grey';
      case 'tab':
        return 'green';
      case 'green':
      default:
        return 'white';
    }
  });
  ionicHeaderIconColor = computed(() => {
    switch (this.headerType()) {
      case 'white':
      case 'tab':
      case 'step':
        return 'green';
      case 'green':
      default:
        return 'white';
    }
  });

  ngOnInit(): void {
    if (!this.hasHeader() && !this.screenReaderTitle()?.trim()) {
      throw new Error('[UIPage] screenReaderTitle is required when hasHeader is false.');
    }

    if (this.hasHeader() && !this.accessibleTitle()) {
      throw new Error('[UIPage] A title or screenReaderTitle is required.');
    }

    if (this.hasHeader() && this.isStepHeader()) {
      this.validateHeaderStep();
    }
  }

  ngAfterViewInit(): void {
    this.bindIonicLifecycleEvents();
    this.destroyRef.onDestroy(() => this.cancelPageTitleFocus());
    void this.initializeScrollElevations();
  }

  /**
   * Runs immediately before the routed view enters.
   */
  ionViewWillEnter(): void {}

  /**
   * Runs after the routed view has finished entering.
   */
  ionViewDidEnter(): void {
    this.updateStatusBarStyle();
    this.cancelPageTitleFocus();

    const pageTitle = this.pageTitle()?.nativeElement;

    if (pageTitle) {
      this.cancelPageTitleFocusRequest = this.screenReader.focus(pageTitle);
    }
  }

  /**
   * Runs immediately before the routed view leaves.
   */
  ionViewWillLeave(): void {
    this.cancelPageTitleFocus();
  }

  /**
   * Runs after the routed view has finished leaving.
   */
  ionViewDidLeave(): void {}

  onContentScroll(): void {
    this.updateScrollElevations();
  }

  private async initializeScrollElevations(): Promise<void> {
    const scrollElement = await this.ionContent().getScrollElement();

    if (this.destroyRef.destroyed) {
      return;
    }

    this.scrollElement = scrollElement;
    this.updateScrollElevations();

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const resizeObserver = new ResizeObserver(() => this.updateScrollElevations());
    resizeObserver.observe(scrollElement);
    resizeObserver.observe(this.pageContentSurface().nativeElement);
    this.destroyRef.onDestroy(() => resizeObserver.disconnect());
  }

  private updateScrollElevations(): void {
    if (!this.scrollElement) {
      this.isHeaderElevated.set(false);
      this.isFooterElevated.set(false);
      return;
    }

    const { clientHeight, scrollHeight, scrollTop } = this.scrollElement;
    const maxScrollTop = Math.max(0, scrollHeight - clientHeight);
    const headerCoversContent = this.hasHeader() && maxScrollTop > 1 && scrollTop > 1;
    const footerCoversContent =
      this.hasFooter() && maxScrollTop > 1 && scrollTop < maxScrollTop - 1;

    this.isHeaderElevated.set(headerCoversContent);
    this.isFooterElevated.set(footerCoversContent);
  }

  private cancelPageTitleFocus(): void {
    this.cancelPageTitleFocusRequest?.();
    this.cancelPageTitleFocusRequest = undefined;
  }

  private updateStatusBarStyle(): void {
    if (!this.hasHeader()) {
      void this.statusBar.setStatusBarStyleLight();
      return;
    }

    switch (this.headerType()) {
      case 'white':
      case 'tab':
      case 'step':
        void this.statusBar.setStatusBarStyleLight();
        return;
      case 'green':
      default:
        void this.statusBar.setStatusBarStyleDark();
    }
  }

  private validateHeaderStep(): void {
    const step = this.headerStep();

    if (!step) {
      throw new Error('[UIPage] headerStep is required when headerType is step.');
    }

    if (!step.label?.trim()) {
      throw new Error('[UIPage] headerStep.label is required when headerType is step.');
    }

    if (!step.ariaLabel?.trim()) {
      throw new Error('[UIPage] headerStep.ariaLabel is required when headerType is step.');
    }

    if (!Number.isInteger(step.totalSteps) || step.totalSteps <= 0) {
      throw new Error('[UIPage] headerStep.totalSteps must be a positive integer.');
    }

    if (
      !Number.isInteger(step.currentStep) ||
      step.currentStep < 1 ||
      step.currentStep > step.totalSteps
    ) {
      throw new Error(
        '[UIPage] headerStep.currentStep must be an integer between 1 and totalSteps.',
      );
    }
  }

  private bindIonicLifecycleEvents(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const navigationViewHost = this.findNavigationViewHost();

    if (!navigationViewHost || navigationViewHost === this.host.nativeElement) {
      return;
    }

    this.destroyRef.onDestroy(bindLifecycleEvents(this.zone, this, navigationViewHost));
  }

  private findNavigationViewHost(): HTMLElement | undefined {
    let candidate: HTMLElement | null = this.host.nativeElement;

    while (candidate) {
      const parent = this.getParentElement(candidate);

      if (parent?.matches('ion-router-outlet, ion-nav')) {
        return candidate;
      }

      candidate = parent;
    }

    return undefined;
  }

  private getParentElement(element: HTMLElement): HTMLElement | null {
    if (element.parentElement) {
      return element.parentElement;
    }

    const root = element.getRootNode();
    return root instanceof ShadowRoot && root.host instanceof HTMLElement ? root.host : null;
  }

  private readonly ionContent = viewChild.required<IonContent>('content');
  private readonly pageTitle = viewChild<ElementRef<HTMLElement>>('pageTitle');
  private readonly pageContentSurface =
    viewChild.required<ElementRef<HTMLElement>>('pageContentSurface');
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly zone = inject(NgZone);
  private statusBar = inject(StatusBarService);
  private scrollElement?: HTMLElement;
  private cancelPageTitleFocusRequest?: () => void;
}

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
import type { IconName } from '../icon/icon-map.interface';

export interface HeaderButton {
  name: IconName;
  fill: 'no-fill' | 'fill';
  ariaLabel: string;
  disabled?: boolean;
  callback: () => void;
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
                <span #pageTitle tabindex="-1" role="heading" aria-level="1">{{ title() }}</span>
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
        </ion-header>
      }

      <ion-content
        #content
        [class]="'background-' + background()"
        [forceOverscroll]="forceOverscroll()"
        [fullscreen]="isFullscreen()"
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
    '[class.fullscreen]': 'isFullscreen()',
  },
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UIPage
  implements AfterViewInit, OnInit, ViewWillEnter, ViewDidEnter, ViewWillLeave, ViewDidLeave
{
  background = input<'white' | 'grey' | 'light-green' | 'green' | 'yellow'>('white');
  headerType = input<'white' | 'green' | 'tab'>('white');
  title = input<string>('');
  screenReaderTitle = input<string>();
  forceOverscroll = input(false, { transform: booleanAttribute });
  hasHeader = input(false, { transform: booleanAttribute });
  hasFooter = input(false, { transform: booleanAttribute });
  fullscreen = input(false, { transform: booleanAttribute });
  condensedHeader = input(false, { transform: booleanAttribute });
  translucent = input(false, { transform: booleanAttribute });
  headerButtons = input<HeaderButton[]>([]);
  backButtonDefaultHref = input<string>();
  private readonly screenReader = inject(ScreenReaderService);
  readonly backButtonIcon = arrowLeftIcon;
  readonly isHeaderElevated = signal(false);
  readonly isFooterElevated = signal(false);
  readonly isCondensedHeaderEnabled = computed(
    () =>
      this.condensedHeader() &&
      this.screenReader.screenStateKnown() &&
      !this.screenReader.screenState(),
  );
  readonly isFullscreen = computed(() => this.fullscreen() || this.isCondensedHeaderEnabled());
  readonly hasVisibleTitle = computed(() => this.hasHeader() && Boolean(this.title().trim()));
  readonly accessibleTitle = computed(
    () => this.title().trim() || this.screenReaderTitle()?.trim() || '',
  );
  readonly hasCondensedHeader = computed(
    () => this.isCondensedHeaderEnabled() && this.hasVisibleTitle(),
  );
  readonly shouldObserveScroll = computed(() => this.hasFooter() || this.hasHeader());

  ionicHeaderColor = computed(() => {
    switch (this.headerType()) {
      case 'white':
        this.statusBar.setStatusBarStyleLight();
        return 'default-grey';
      case 'tab':
        this.statusBar.setStatusBarStyleLight();
        return 'green';
      case 'green':
      default:
        this.statusBar.setStatusBarStyleDark();
        return 'white';
    }
  });
  ionicHeaderIconColor = computed(() => {
    switch (this.headerType()) {
      case 'white':
      case 'tab':
        return 'green';
      case 'green':
      default:
        return 'white';
    }
  });

  ngOnInit(): void {
    if (!this.accessibleTitle()) {
      throw new Error('[UIPage] A title or screenReaderTitle is required.');
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

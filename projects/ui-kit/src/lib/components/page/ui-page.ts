import type { AfterViewInit, ElementRef } from '@angular/core';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
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
            <ion-title [color]="ionicHeaderColor()">{{ title() }}</ion-title>
            <ion-buttons [collapse]="true" slot="end">
              @for (headerButton of headerButtons(); track headerButton) {
                <ui-button
                  [aria-label]="headerButton.ariaLabel"
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
        @if (hasCondensedHeader()) {
          <ion-header collapse="condense" mode="ios">
            <ion-toolbar
              [class]="['background-' + background(), 'header-background-' + headerType()]"
            >
              <ion-title size="large" [color]="ionicHeaderColor()">{{ title() }}</ion-title>
              <ion-buttons [collapse]="true" slot="end">
                @for (headerButton of headerButtons(); track headerButton) {
                  <ui-button
                    [aria-label]="headerButton.ariaLabel"
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

        <div #pageContentSurface class="page-content-surface">
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
export class UIPage implements AfterViewInit {
  background = input<'white' | 'grey' | 'light-green' | 'green' | 'yellow'>('white');
  headerType = input<'white' | 'green' | 'tab'>('white');
  title = input<string>('');
  forceOverscroll = input(false, { transform: booleanAttribute });
  hasHeader = input(false, { transform: booleanAttribute });
  hasFooter = input(false, { transform: booleanAttribute });
  fullscreen = input(false, { transform: booleanAttribute });
  collapse = input(false, { transform: booleanAttribute });
  translucent = input(false, { transform: booleanAttribute });
  headerButtons = input<HeaderButton[]>([]);
  backButtonDefaultHref = input<string>();
  readonly backButtonIcon = arrowLeftIcon;
  readonly isHeaderElevated = signal(false);
  readonly isFooterElevated = signal(false);
  readonly isFullscreen = computed(() => this.fullscreen() || this.collapse());
  readonly hasCondensedHeader = computed(
    () => this.collapse() && this.hasHeader() && Boolean(this.title()),
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

  ngAfterViewInit(): void {
    void this.initializeScrollElevations();
  }

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

  private readonly ionContent = viewChild.required<IonContent>('content');
  private readonly pageContentSurface =
    viewChild.required<ElementRef<HTMLElement>>('pageContentSurface');
  private readonly destroyRef = inject(DestroyRef);
  private statusBar = inject(StatusBarService);
  private scrollElement?: HTMLElement;
}

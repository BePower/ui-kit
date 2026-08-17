import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from '@angular/core';
import {
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

@Component({
  selector: 'ui-page',
  standalone: true,
  imports: [IonContent, IonHeader, IonFooter, IonToolbar, IonTitle, UIButton, IonButtons, UIIcon],
  template: `
    @if (hasHeader()) {
      <ion-header [translucent]="fullscreen()">
        <ion-toolbar [class]="['background-' + background(), 'header-background-' + headerType()]">
          <ion-buttons slot="start">
            <ui-button variant="secondary" size="min-icon">
              <ui-icon
                name="arrow-left"
                size="40"
                fill="no-fill"
                [color]="ionicHeaderIconColor()"
              ></ui-icon>
            </ui-button>
            <ui-button variant="secondary" size="min-icon">
              <ui-icon
                name="arrow-left"
                size="40"
                fill="no-fill"
                [color]="ionicHeaderIconColor()"
              ></ui-icon>
            </ui-button>
          </ion-buttons>
          <ng-content select="[header]"></ng-content>
          <ion-title [color]="ionicHeaderColor()">{{ title() }}</ion-title>
          <ion-buttons slot="end">
            <ui-button variant="secondary" size="min-icon">
              <ui-icon
                name="condivisione"
                size="40"
                fill="no-fill"
                [color]="ionicHeaderIconColor()"
              ></ui-icon>
            </ui-button>
            <ui-button variant="secondary" size="min-icon">
              <ui-icon
                name="heart"
                size="40"
                fill="fill"
                [color]="ionicHeaderIconColor()"
              ></ui-icon>
            </ui-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
    }

    <ion-content
      [class]="'background-' + background()"
      [forceOverscroll]="forceOverscroll()"
      [fullscreen]="fullscreen()"
    >
      <ng-content></ng-content>
    </ion-content>

    @if (hasFooter()) {
      <ion-footer>
        <ion-toolbar [class]="'background-' + background()">
          <ng-content select="[footer]"></ng-content>
        </ion-toolbar>
      </ion-footer>
    }
  `,
  styleUrl: 'ui-page.scss',
  host: {
    '[class.no-header]': '!hasHeader()',
    '[class.no-footer]': '!hasFooter()',
    '[class.fullscreen]': 'fullscreen()',
  },
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UIPage {
  background = input<'white' | 'grey' | 'light-green' | 'green' | 'yellow'>('white');
  headerType = input<'white' | 'green' | 'tab'>('white');
  title = input<string>('');
  forceOverscroll = input(false, { transform: booleanAttribute });
  hasHeader = input(false, { transform: booleanAttribute });
  hasFooter = input(false, { transform: booleanAttribute });
  fullscreen = input(false, { transform: booleanAttribute });

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

  private statusBar = inject(StatusBarService);
}

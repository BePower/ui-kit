import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  HostBinding,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [IonButton],
  template: `<ion-button [color]="ionicColor()"><ng-content></ng-content></ion-button>`,
  styleUrl: 'ui-button.scss',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UIButton {
  variant = input<'primary'>('primary');
  expand = input(false, { transform: booleanAttribute });

  ionicColor = computed(() => {
    switch (this.variant()) {
      case 'primary':
      default:
        return 'primary';
    }
  });

  @HostBinding('class.primary')
  get isPrimary() {
    return this.variant() === 'primary';
  }

  @HostBinding('class.expand')
  get hasExpand() {
    return this.expand();
  }
}

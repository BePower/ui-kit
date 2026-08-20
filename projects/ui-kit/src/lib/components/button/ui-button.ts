import type { OnInit } from '@angular/core';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  HostBinding,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { IonButton, IonSpinner } from '@ionic/angular/standalone';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [IonButton, IonSpinner],
  template: `<ion-button
    mode="ios"
    [disabled]="disabled() || _isLoading()"
    [color]="ionicColor()"
    [fill]="ionicFill()"
    [attr.aria-label]="ariaLabel()"
    [attr.aria-hidden]="ariaHidden()"
  >
    @if (_isLoading()) {
      <ion-spinner color="default-grey" name="lines-sharp"></ion-spinner>
    } @else {
      <ng-content></ng-content>
    }
  </ion-button>`,
  styleUrl: 'ui-button.scss',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UIButton implements OnInit {
  variant = input<'primary' | 'secondary' | 'outlined'>('primary');
  size = input<'default' | 'icon' | 'min-icon'>('default');
  expand = input(false, { transform: booleanAttribute });
  disabled = input(false, { transform: booleanAttribute });
  isLoading = input(false, { transform: booleanAttribute });
  ariaLabel = input<string>();
  ariaHidden = input(false, { transform: booleanAttribute });

  ngOnInit(): void {
    if (!this.ariaHidden() && !this.ariaLabel()?.trim()) {
      throw new Error('[UIButton] ariaLabel is required when ariaHidden is false.');
    }
  }

  _isLoading = computed(() => this.variant() !== 'secondary' && this.isLoading());

  ionicColor = computed(() => {
    switch (this.variant()) {
      case 'secondary':
      case 'outlined':
        return 'default-grey';
      case 'primary':
      default:
        return 'primary';
    }
  });
  ionicFill = computed(() => {
    switch (this.variant()) {
      case 'outlined':
        return 'outline';
      case 'secondary':
        return 'clear';
      case 'primary':
      default:
        return 'solid';
    }
  });

  @HostBinding('class.primary')
  get isPrimary() {
    return this.variant() === 'primary';
  }

  @HostBinding('class.secondary')
  get isSecondary() {
    return this.variant() === 'secondary';
  }

  @HostBinding('class.outlined')
  get isOutlined() {
    return this.variant() === 'outlined';
  }

  @HostBinding('class.expand')
  get hasExpand() {
    return this.expand();
  }

  @HostBinding('class.icon')
  get isIcon() {
    return this.size() === 'icon';
  }

  @HostBinding('class.min-icon')
  get isMinIcon() {
    return this.size() === 'min-icon';
  }
}

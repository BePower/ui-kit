import { NgTemplateOutlet } from '@angular/common';
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
import { IonButton, IonSpinner, IonText } from '@ionic/angular/standalone';

export type UIButtonSize = 'default' | 'icon' | 'min-icon' | 'inline';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [NgTemplateOutlet, IonButton, IonSpinner, IonText],
  template: `
    <ng-template #content>
      @if (_isLoading()) {
        <ion-spinner color="default-grey" name="lines-sharp"></ion-spinner>
      } @else {
        <ng-content></ng-content>
      }
    </ng-template>

    @if (isInline()) {
      <ion-text [color]="ionicColor()">
        <span
          #inlineAction
          class="inline-action"
          role="button"
          [attr.aria-disabled]="isDisabled() ? 'true' : null"
          [attr.aria-label]="ariaLabel()"
          [attr.aria-hidden]="ariaHidden() ? 'true' : null"
          [attr.tabindex]="ariaHidden() || isDisabled() ? -1 : 0"
          (click)="onInlineClick($event)"
          (keydown)="onInlineKeydown($event, inlineAction)"
          (keyup)="onInlineKeyup($event, inlineAction)"
        >
          <ng-container [ngTemplateOutlet]="content"></ng-container>
        </span>
      </ion-text>
    } @else {
      <ion-button
        mode="ios"
        [disabled]="disabled() || _isLoading()"
        [color]="ionicColor()"
        [fill]="ionicFill()"
        [expand]="expand() ? 'block' : undefined"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-hidden]="ariaHidden() ? 'true' : null"
        [attr.tabindex]="ariaHidden() ? -1 : null"
      >
        <ng-container [ngTemplateOutlet]="content"></ng-container>
      </ion-button>
    }
  `,
  styleUrl: 'ui-button.scss',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UIButton implements OnInit {
  variant = input<'primary' | 'secondary' | 'outlined'>('primary');
  size = input<UIButtonSize>('default');
  expand = input(false, { transform: booleanAttribute });
  disabled = input(false, { transform: booleanAttribute });
  isLoading = input(false, { transform: booleanAttribute });
  ariaLabel = input<string>();
  ariaHidden = input(false, { transform: booleanAttribute });

  ngOnInit(): void {
    if (this.size() === 'inline' && this.variant() !== 'secondary') {
      throw new Error('[UIButton] size="inline" can only be used with variant="secondary".');
    }

    if (this.size() === 'inline' && this.expand()) {
      throw new Error('[UIButton] size="inline" cannot be used with expand.');
    }

    if (!this.isInline() && !this.ariaHidden() && !this.ariaLabel()?.trim()) {
      throw new Error(
        '[UIButton] ariaLabel is required when ariaHidden is false unless size is "inline".',
      );
    }
  }

  _isLoading = computed(() => this.variant() !== 'secondary' && this.isLoading());
  isDisabled = computed(() => this.disabled() || this._isLoading());
  isInline = computed(() => this.size() === 'inline');

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

  onInlineClick(event: MouseEvent): void {
    if (this.isDisabled()) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  onInlineKeydown(event: KeyboardEvent, action: HTMLElement): void {
    if (this.isDisabled()) {
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      action.click();
      return;
    }

    if (event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
    }
  }

  onInlineKeyup(event: KeyboardEvent, action: HTMLElement): void {
    if (this.isDisabled() || (event.key !== ' ' && event.key !== 'Spacebar')) {
      return;
    }

    event.preventDefault();
    action.click();
  }

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

  @HostBinding('class.inline')
  get hasInlineSize() {
    return this.isInline();
  }
}

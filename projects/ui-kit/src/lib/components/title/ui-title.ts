import { NgTemplateOutlet } from '@angular/common';
import type { OnInit } from '@angular/core';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { IonText } from '@ionic/angular/standalone';
import type { TextColor } from '../../interfaces/text-color.type';

export type UITitleSize = 'xl' | 'l' | 'm' | 's';

@Component({
  selector: 'ui-title',
  standalone: true,
  imports: [NgTemplateOutlet, IonText],
  template: `
    <ng-template #content>
      <ion-text mode="ios" [color]="color()">
        <ng-content></ng-content>
      </ion-text>
    </ng-template>

    @switch (size()) {
      @case ('xl') {
        <h1
          [attr.aria-hidden]="ariaHidden() ? 'true' : null"
          [attr.aria-label]="accessibleAriaLabel()"
        >
          <ng-container [ngTemplateOutlet]="content"></ng-container>
        </h1>
      }
      @case ('l') {
        <h2
          [attr.aria-hidden]="ariaHidden() ? 'true' : null"
          [attr.aria-label]="accessibleAriaLabel()"
        >
          <ng-container [ngTemplateOutlet]="content"></ng-container>
        </h2>
      }
      @case ('m') {
        <h3
          [attr.aria-hidden]="ariaHidden() ? 'true' : null"
          [attr.aria-label]="accessibleAriaLabel()"
        >
          <ng-container [ngTemplateOutlet]="content"></ng-container>
        </h3>
      }
      @case ('s') {
        <h4
          [attr.aria-hidden]="ariaHidden() ? 'true' : null"
          [attr.aria-label]="accessibleAriaLabel()"
        >
          <ng-container [ngTemplateOutlet]="content"></ng-container>
        </h4>
      }
    }
  `,
  styleUrl: 'ui-title.scss',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UITitle implements OnInit {
  size = input<UITitleSize>('l');
  color = input<TextColor>('default-grey');
  ariaLabel = input<string>();
  ariaHidden = input(false, { transform: booleanAttribute });
  readonly accessibleAriaLabel = computed(() => {
    const ariaLabel = this.ariaLabel()?.trim();

    return this.ariaHidden() || !ariaLabel ? null : ariaLabel;
  });

  ngOnInit(): void {
    if (this.ariaHidden() && this.ariaLabel()?.trim()) {
      throw new Error('[UITitle] ariaLabel cannot be used when ariaHidden is true.');
    }
  }
}

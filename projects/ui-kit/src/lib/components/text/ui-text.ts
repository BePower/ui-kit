import { ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';
import { IonText } from '@ionic/angular/standalone';
import type { TextColor } from '../../interfaces/text-color.type';

export type UITextVariant =
  'inherit' | 'body-l' | 'body-m' | 'body-s' | 'label-l' | 'label-m' | 'label-s';

@Component({
  selector: 'ui-text',
  standalone: true,
  imports: [IonText],
  template: `<ion-text mode="ios" [color]="color()">
    <ng-content></ng-content>
  </ion-text>`,
  styleUrl: 'ui-text.scss',
  host: {
    '[attr.data-variant]': 'variant()',
  },
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UIText {
  color = input<TextColor>('default-grey');
  variant = input<UITextVariant>('inherit');
}

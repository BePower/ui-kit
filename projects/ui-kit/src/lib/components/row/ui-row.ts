import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { IonRow } from '@ionic/angular/standalone';

import type { UISpacing, UIVerticalSpacing } from '../../interfaces/spacing.type';

@Component({
  selector: 'ui-row',
  standalone: true,
  imports: [IonRow],
  template: `<ion-row
    [attr.data-bottom]="bottom()"
    [attr.data-gap]="gap()"
    [attr.data-top]="top()"
  >
    <ng-content></ng-content>
  </ion-row>`,
  styleUrl: 'ui-row.scss',
  host: {},
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UIRow {
  top = input<UIVerticalSpacing>('none');
  bottom = input<UIVerticalSpacing>('none');
  gap = input<UISpacing>('xxs');
}

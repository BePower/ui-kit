import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { IonCol } from '@ionic/angular/standalone';

import type { UIAlignment } from '../../interfaces/alignment.type';
import type { UIHorizontalSpacing } from '../../interfaces/spacing.type';

export type UIColAlignment = UIAlignment;
export type UIColSize = number | `${number}` | 'auto';

@Component({
  selector: 'ui-col',
  standalone: true,
  imports: [IonCol],
  template: `<ion-col
    class="ion-display-flex"
    [attr.data-horizontal]="horizontal()"
    [class.ion-align-items-center]="align() === 'center'"
    [class.ion-align-items-end]="align() === 'end'"
    [class.ion-align-items-start]="align() === 'start'"
    [class.ion-justify-content-center]="justify() === 'center'"
    [class.ion-justify-content-end]="justify() === 'end'"
    [class.ion-justify-content-start]="justify() === 'start'"
    [size]="ionicSize()"
  >
    <ng-content></ng-content>
  </ion-col>`,
  styleUrl: 'ui-col.scss',
  host: {},
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UICol {
  justify = input<UIAlignment>('start');
  align = input<UIAlignment>('start');
  horizontal = input<UIHorizontalSpacing>('none');
  size = input<UIColSize>();

  ionicSize = computed(() => {
    const size = this.size();

    return size === undefined ? undefined : String(size);
  });
}

import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { IonGrid } from '@ionic/angular/standalone';

import type { UIHorizontalSpacing } from '../../interfaces/spacing.type';

@Component({
  selector: 'ui-grid',
  standalone: true,
  imports: [IonGrid],
  template: `<ion-grid [attr.data-horizontal]="horizontal()" [fixed]="fixed()">
    <ng-content></ng-content>
  </ion-grid>`,
  styleUrl: 'ui-grid.scss',
  host: {},
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UIGrid {
  fixed = input(false, { transform: booleanAttribute });
  horizontal = input<UIHorizontalSpacing>('xs');
}

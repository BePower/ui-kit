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
import { IonCol } from '@ionic/angular/standalone';

import type { UIAlignment } from '../../interfaces/alignment.type';
import type { UIHorizontalSpacing } from '../../interfaces/spacing.type';

export type UIColAlignment = UIAlignment;
export type UIColSize = number | `${number}` | 'auto';

@Component({
  selector: 'ui-col',
  standalone: true,
  imports: [IonCol, NgTemplateOutlet],
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
    <ng-template #projectedContent><ng-content></ng-content></ng-template>
    @if (useLegacyContent) {
      <slot></slot>
    } @else {
      <ng-container [ngTemplateOutlet]="projectedContent"></ng-container>
    }
  </ion-col>`,
  styleUrl: 'ui-col.scss',
  host: {},
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UICol implements OnInit {
  /** Temporary native-slot compatibility, read once on initialization. */
  legacyContent = input(false, { transform: booleanAttribute });
  justify = input<UIAlignment>('start');
  align = input<UIAlignment>('start');
  horizontal = input<UIHorizontalSpacing>('none');
  size = input<UIColSize>();

  protected useLegacyContent = false;

  ngOnInit(): void {
    this.useLegacyContent = this.legacyContent();
  }

  ionicSize = computed(() => {
    const size = this.size();

    return size === undefined ? undefined : String(size);
  });
}

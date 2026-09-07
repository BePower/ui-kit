import { NgTemplateOutlet } from '@angular/common';
import type { OnInit } from '@angular/core';
import {
  booleanAttribute,
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
  imports: [IonRow, NgTemplateOutlet],
  template: `<ion-row [attr.data-bottom]="bottom()" [attr.data-gap]="gap()" [attr.data-top]="top()">
    <ng-template #projectedContent><ng-content></ng-content></ng-template>
    @if (useLegacyContent) {
      <slot></slot>
    } @else {
      <ng-container [ngTemplateOutlet]="projectedContent"></ng-container>
    }
  </ion-row>`,
  styleUrl: 'ui-row.scss',
  host: {},
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UIRow implements OnInit {
  /** Temporary native-slot compatibility, read once on initialization. */
  legacyContent = input(false, { transform: booleanAttribute });
  top = input<UIVerticalSpacing>('none');
  bottom = input<UIVerticalSpacing>('none');
  gap = input<UISpacing>('none');

  protected useLegacyContent = false;

  ngOnInit(): void {
    this.useLegacyContent = this.legacyContent();
  }
}

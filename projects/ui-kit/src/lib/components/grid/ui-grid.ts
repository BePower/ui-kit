import { NgTemplateOutlet } from '@angular/common';
import type { OnInit } from '@angular/core';
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
  imports: [IonGrid, NgTemplateOutlet],
  template: `<ion-grid [attr.data-horizontal]="horizontal()" [fixed]="fixed()">
    <ng-template #projectedContent><ng-content></ng-content></ng-template>
    @if (useLegacyContent) {
      <slot></slot>
    } @else {
      <ng-container [ngTemplateOutlet]="projectedContent"></ng-container>
    }
  </ion-grid>`,
  styleUrl: 'ui-grid.scss',
  host: {},
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UIGrid implements OnInit {
  /** Temporary native-slot compatibility, read once on initialization. */
  legacyContent = input(false, { transform: booleanAttribute });
  fixed = input(false, { transform: booleanAttribute });
  horizontal = input<UIHorizontalSpacing>('xs');

  protected useLegacyContent = false;

  ngOnInit(): void {
    this.useLegacyContent = this.legacyContent();
  }
}

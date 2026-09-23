import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from '@angular/core';
import type { UIAlignment } from '../../interfaces/alignment.type';

@Component({
  selector: 'ui-p',
  standalone: true,
  template: `<p [class]="'align-' + align()" [attr.aria-hidden]="ariaHidden() ? 'true' : null">
    <ng-content></ng-content>
  </p>`,
  styleUrl: 'ui-p.scss',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UIP {
  align = input<UIAlignment>('start');
  ariaHidden = input(false, { transform: booleanAttribute });
}

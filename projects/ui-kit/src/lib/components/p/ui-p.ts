import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'ui-p',
  standalone: true,
  template: `<p [attr.aria-hidden]="ariaHidden() ? 'true' : null">
    <ng-content></ng-content>
  </p>`,
  styleUrl: 'ui-p.scss',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UIP {
  ariaHidden = input(false, { transform: booleanAttribute });
}

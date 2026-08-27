import type { OnInit } from '@angular/core';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { IonProgressBar } from '@ionic/angular/standalone';

@Component({
  selector: 'ui-progress-bar',
  standalone: true,
  imports: [IonProgressBar],
  template: `<ion-progress-bar
    [attr.aria-label]="ariaLabel()"
    [attr.aria-valuetext]="ariaValueText()"
    [attr.aria-hidden]="ariaHidden()"
    mode="ios"
    color="tertiary"
    [value]="value()"
  >
  </ion-progress-bar>`,
  styleUrl: 'ui-progress-bar.scss',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UIProgressBar implements OnInit {
  value = input<number>(0);
  ariaLabel = input<string>();
  ariaValueText = input<string>();
  ariaHidden = input(false, { transform: booleanAttribute });

  ngOnInit(): void {
    if (!this.ariaHidden() && !this.ariaLabel()?.trim()) {
      throw new Error('[UIProgressBar] ariaLabel is required when ariaHidden is false.');
    }
  }
}

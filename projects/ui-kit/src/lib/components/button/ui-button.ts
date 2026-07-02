import { Component, input, ViewEncapsulation } from '@angular/core';
import { IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [IonButton],
  template: `<ion-button><ng-content></ng-content></ion-button>`,
  styleUrl: 'ui-button.scss',
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class UIButton {
}

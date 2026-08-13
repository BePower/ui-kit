import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { IconName } from './icon-map.interface';
import { iconMap } from './icon-map';

@Component({
  selector: 'ui-icon',
  standalone: true,
  imports: [IonIcon, CommonModule],
  template: `
    @if (showIcon()) {
      <ion-icon
        [ngClass]="['size-' + size()]"
        [color]="color()"
        aria-hidden="true"
        [src]="iconSrc()"
      >
      </ion-icon>
    }
  `,
  styleUrl: 'ui-icon.scss',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UIIcon {
  name = input.required<IconName>();
  color = input<'default-grey' | 'primary'>();
  iconSrc = signal<string | null>(null);
  showIcon = signal(false);
  size = input<'16' | '24' | '36' | '48'>('24');
  fill = input<'no-fill' | 'fill'>('fill');

  constructor() {
    effect(() => {
      const fill = this.fill();
      const name = this.name();

      this.showIcon.set(false);
      this.iconSrc.set(null);

      const icon = iconMap[name][fill];
      if (!icon) {
        console.error(`[UI ICON] - icon not found, ${name} ${fill}`);
        return;
      }

      this.iconSrc.set(icon);
      this.showIcon.set(true);
    });
  }
}

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
  color = input<'default-grey' | 'primary' | 'secondary' | 'white' | 'green'>();
  iconSrc = signal<string | null>(null);
  showIcon = signal(false);
  size = input<'16' | '24' | '36' | '40' | '48'>('24');
  fill = input<'no-fill' | 'fill'>('fill');

  constructor() {
    effect((onCleanup) => {
      const fill = this.fill();
      const name = this.name();
      let isCurrentRequest = true;

      onCleanup(() => {
        isCurrentRequest = false;
      });

      this.showIcon.set(false);
      this.iconSrc.set(null);

      const loadIcon = iconMap[name][fill];
      if (!loadIcon) {
        console.error(`[UI ICON] - icon not found, ${name} ${fill}`);
        return;
      }

      void loadIcon()
        .then((icon) => {
          if (!isCurrentRequest) {
            return;
          }

          this.iconSrc.set(icon);
          this.showIcon.set(true);
        })
        .catch((error) => {
          if (!isCurrentRequest) {
            return;
          }

          console.error(`[UI ICON] - failed to load icon, ${name} ${fill}`, error);
        });
    });
  }
}

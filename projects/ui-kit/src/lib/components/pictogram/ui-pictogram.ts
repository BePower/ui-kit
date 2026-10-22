import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import type { PictogramName, PictogramSize } from '../../interfaces/pictogram.interface';
import { pictogramMap } from './pictogram-map';

@Component({
  selector: 'ui-pictogram',
  standalone: true,
  template: `
    @if (showPictogram()) {
      <img [class]="'size-' + size()" [src]="pictogramSrc()" alt="" aria-hidden="true" />
    }
  `,
  styleUrl: 'ui-pictogram.scss',
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UIPictogram {
  name = input.required<PictogramName>();
  size = input<PictogramSize>('64');
  pictogramSrc = signal<string | null>(null);
  showPictogram = signal(false);

  constructor() {
    effect((onCleanup) => {
      const name = this.name();
      let isCurrentRequest = true;

      onCleanup(() => {
        isCurrentRequest = false;
      });

      this.showPictogram.set(false);
      this.pictogramSrc.set(null);

      const loadPictogram = pictogramMap[name];
      if (!loadPictogram) {
        console.error(`[UI PICTOGRAM] - pictogram not found, ${name}`);
        return;
      }

      void loadPictogram()
        .then((pictogram) => {
          if (!isCurrentRequest) {
            return;
          }

          this.pictogramSrc.set(pictogram);
          this.showPictogram.set(true);
        })
        .catch((error) => {
          if (!isCurrentRequest) {
            return;
          }

          console.error(`[UI PICTOGRAM] - failed to load pictogram, ${name}`, error);
        });
    });
  }
}

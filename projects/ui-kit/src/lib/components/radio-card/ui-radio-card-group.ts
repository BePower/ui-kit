import {
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  forwardRef,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { IonRadioGroup } from '@ionic/angular/standalone';
import { RadioGroupBase } from '../radio-group/radio-group-base';
import { UIRadioCard } from './ui-radio-card';

let nextGroupId = 0;

@Component({
  selector: 'ui-radio-card-group',
  standalone: true,
  imports: [IonRadioGroup],
  templateUrl: '../radio-group/radio-group.html',
  styleUrl: 'ui-radio-card-group.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UIRadioCardGroup),
      multi: true,
    },
  ],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UIRadioCardGroup extends RadioGroupBase {
  name = input(`ui-radio-card-group-${++nextGroupId}`);
  readonly errorId = `${this.name()}-error`;
  protected readonly componentName = 'UIRadioCardGroup';
  protected readonly options = contentChildren(UIRadioCard, { descendants: true });
}

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
import { UIRadioButton } from './ui-radio-button';

let nextRadioButtonGroupId = 0;

@Component({
  selector: 'ui-radio-button-group',
  standalone: true,
  imports: [IonRadioGroup],
  templateUrl: '../radio-group/radio-group.html',
  styleUrl: 'ui-radio-button-group.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UIRadioButtonGroup),
      multi: true,
    },
  ],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UIRadioButtonGroup extends RadioGroupBase {
  name = input(`ui-radio-button-group-${++nextRadioButtonGroupId}`);
  readonly errorId = `${this.name()}-error`;
  protected readonly componentName = 'UIRadioButtonGroup';
  protected readonly options = contentChildren(UIRadioButton, { descendants: true });
}

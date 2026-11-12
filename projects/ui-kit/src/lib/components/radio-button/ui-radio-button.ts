import type { OnInit } from '@angular/core';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  HostBinding,
  input,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { IonRadio } from '@ionic/angular/standalone';

let nextRadioButtonId = 0;

@Component({
  selector: 'ui-radio-button',
  standalone: true,
  imports: [IonRadio],
  template: `
    <ion-radio
      mode="ios"
      labelPlacement="end"
      [alignment]="hasDescription() ? 'start' : 'center'"
      justify="start"
      [value]="value()"
      [disabled]="isDisabled()"
      [class.error]="hasError()"
      [attr.aria-label]="label()"
      [attr.aria-describedby]="describedBy()"
    >
      <span class="content">
        @if (hasDescription()) {
          <span class="title">{{ label() }}</span>
          <span class="description" [id]="descriptionId">{{ description() }}</span>
        } @else {
          <span class="label">{{ label() }}</span>
        }
        @if (errorText()) {
          <span class="error-message" [id]="errorId" role="alert">{{ errorText() }}</span>
        }
      </span>
    </ion-radio>
  `,
  styleUrl: 'ui-radio-button.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UIRadioButton implements OnInit {
  value = input.required<string>();
  label = input.required<string>();
  description = input<string>();
  disabled = input(false, { transform: booleanAttribute });
  invalid = input(false, { transform: booleanAttribute });
  errorText = input<string>();

  readonly radioButtonId = `ui-radio-button-${++nextRadioButtonId}`;
  readonly descriptionId = `${this.radioButtonId}-description`;
  readonly errorId = `${this.radioButtonId}-error`;

  private readonly groupDisabled = signal(false);
  private readonly groupInvalid = signal(false);

  readonly hasDescription = computed(() => Boolean(this.description()?.trim()));
  readonly isDisabled = computed(() => this.disabled() || this.groupDisabled());
  readonly hasError = computed(
    () => this.invalid() || this.groupInvalid() || Boolean(this.errorText()),
  );
  readonly describedBy = computed(() =>
    [this.hasDescription() ? this.descriptionId : null, this.errorText() ? this.errorId : null]
      .filter(Boolean)
      .join(' '),
  );

  ngOnInit(): void {
    if (!this.value().trim()) {
      throw new Error('[UIRadioButton] value is required and cannot be blank.');
    }
    if (!this.label().trim()) {
      throw new Error('[UIRadioButton] label is required and cannot be blank.');
    }
    if (this.description() !== undefined && !this.description()?.trim()) {
      throw new Error('[UIRadioButton] description cannot be blank.');
    }
  }

  setGroupState(disabled: boolean, invalid: boolean): void {
    this.groupDisabled.set(disabled);
    this.groupInvalid.set(invalid);
  }

  @HostBinding('class.disabled')
  get hasDisabledState(): boolean {
    return this.isDisabled();
  }

  @HostBinding('class.error')
  get hasErrorState(): boolean {
    return this.hasError();
  }
}

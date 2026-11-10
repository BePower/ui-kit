import type { OnInit } from '@angular/core';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  effect,
  forwardRef,
  HostBinding,
  input,
  model,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IonRadioGroup } from '@ionic/angular/standalone';
import { UIRadioCard } from './ui-radio-card';

let nextGroupId = 0;

@Component({
  selector: 'ui-radio-card-group',
  standalone: true,
  imports: [IonRadioGroup],
  template: `
    <fieldset
      [disabled]="isDisabled()"
      [attr.aria-invalid]="hasError() ? 'true' : null"
      [attr.aria-describedby]="hasError() && errorText() ? errorId : null"
    >
      <legend class="visually-hidden">{{ ariaLabel() }}</legend>
      <ion-radio-group
        role="radiogroup"
        [attr.aria-label]="ariaLabel()"
        [name]="name()"
        [value]="value()"
        (ionChange)="onIonChange($event)"
        (ionBlur)="onGroupBlur()"
      >
        <ng-content></ng-content>
      </ion-radio-group>
      @if (hasError() && errorText()) {
        <p class="group-error" [id]="errorId" role="alert">{{ errorText() }}</p>
      }
    </fieldset>
  `,
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
export class UIRadioCardGroup implements ControlValueAccessor, OnInit {
  ariaLabel = input.required<string>();
  name = input(`ui-radio-card-group-${++nextGroupId}`);
  disabled = input(false, { transform: booleanAttribute });
  invalid = input(false, { transform: booleanAttribute });
  errorText = input<string>();
  value = model<string | null>(null);

  readonly errorId = `${this.name()}-error`;

  private readonly formDisabled = signal(false);
  private readonly cards = contentChildren(UIRadioCard, { descendants: true });
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  readonly hasError = computed(() => this.invalid() || Boolean(this.errorText()));

  constructor() {
    effect(() => {
      const disabled = this.isDisabled();
      const invalid = this.hasError();
      for (const card of this.cards()) {
        card.setGroupState(disabled, invalid);
      }
    });
  }

  ngOnInit(): void {
    if (!this.ariaLabel().trim()) {
      throw new Error('[UIRadioCardGroup] ariaLabel is required and cannot be blank.');
    }
    if (!this.name().trim()) {
      throw new Error('[UIRadioCardGroup] name cannot be blank.');
    }
  }

  onIonChange(event: CustomEvent<{ value: unknown }>): void {
    if (this.isDisabled()) {
      return;
    }
    const nextValue = event.detail.value == null ? null : String(event.detail.value);
    this.value.set(nextValue);
    this.onChange(nextValue);
  }

  onGroupBlur(): void {
    this.onTouched();
  }

  writeValue(value: unknown): void {
    this.value.set(value == null ? null : String(value));
  }

  registerOnChange(callback: (value: string | null) => void): void {
    this.onChange = callback;
  }

  registerOnTouched(callback: () => void): void {
    this.onTouched = callback;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
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

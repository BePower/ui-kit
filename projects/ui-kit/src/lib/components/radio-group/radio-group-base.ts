import type { InputSignal, OnInit, Signal } from '@angular/core';
import {
  booleanAttribute,
  computed,
  Directive,
  effect,
  HostBinding,
  input,
  model,
  signal,
} from '@angular/core';
import type { ControlValueAccessor } from '@angular/forms';

interface RadioGroupOption {
  setGroupState(disabled: boolean, invalid: boolean): void;
}

function normalizeRadioValue(value: unknown): string | null {
  if (value == null) return null;
  switch (typeof value) {
    case 'string':
      return value;
    case 'number':
    case 'boolean':
    case 'bigint':
      return String(value);
    default:
      throw new TypeError(
        'Radio group values must be strings, numbers, booleans, bigints or null.',
      );
  }
}

/** Internal shared Angular Forms and accessibility behavior for radio groups. */
@Directive()
export abstract class RadioGroupBase implements ControlValueAccessor, OnInit {
  ariaLabel = input.required<string>();
  abstract readonly name: InputSignal<string>;
  protected abstract readonly componentName: string;
  protected abstract readonly options: Signal<readonly RadioGroupOption[]>;
  disabled = input(false, { transform: booleanAttribute });
  invalid = input(false, { transform: booleanAttribute });
  errorText = input<string>();
  value = model<string | null>(null);

  abstract readonly errorId: string;

  private readonly formDisabled = signal(false);
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  readonly hasError = computed(() => this.invalid() || Boolean(this.errorText()));

  constructor() {
    effect(() => {
      const disabled = this.isDisabled();
      const invalid = this.hasError();
      for (const radio of this.options()) {
        radio.setGroupState(disabled, invalid);
      }
    });
  }

  ngOnInit(): void {
    if (!this.ariaLabel().trim()) {
      throw new Error(`[${this.componentName}] ariaLabel is required and cannot be blank.`);
    }
    if (!this.name().trim()) {
      throw new Error(`[${this.componentName}] name cannot be blank.`);
    }
  }

  onIonChange(event: CustomEvent<{ value: unknown }>): void {
    if (this.isDisabled()) {
      return;
    }
    const nextValue = normalizeRadioValue(event.detail.value);
    this.value.set(nextValue);
    this.onChange(nextValue);
  }

  onGroupBlur(): void {
    this.onTouched();
  }

  writeValue(value: unknown): void {
    this.value.set(normalizeRadioValue(value));
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

import type { OnInit } from '@angular/core';
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  HostBinding,
  input,
  model,
  output,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextId = 0;

@Component({
  selector: 'ui-input-field',
  standalone: true,
  template: `
    <div class="field">
      @if (label()) {
        <label class="title" [for]="inputId">{{ label() }}</label>
      }

      <div class="control">
        <ng-content select="[slot='left']"></ng-content>
        <input
          [id]="inputId"
          [type]="type()"
          [name]="name()"
          [value]="value()"
          [placeholder]="placeholder()"
          [disabled]="isDisabled()"
          [readOnly]="readonly()"
          [required]="required()"
          [attr.autocomplete]="autocomplete()"
          [attr.inputmode]="inputMode()"
          [attr.aria-label]="ariaLabel()"
          [attr.aria-labelledby]="ariaLabelledby()"
          [attr.aria-describedby]="message() ? messageId : null"
          [attr.aria-invalid]="hasError() ? 'true' : null"
          (focus)="onFocus()"
          (blur)="onBlur($event)"
          (input)="onInput($event)"
        />
        <ng-content select="[slot='right']"></ng-content>
      </div>

      @if (message()) {
        <div class="message" [id]="messageId" [attr.role]="hasError() ? 'alert' : null">
          {{ message() }}
        </div>
      }
    </div>
  `,
  styleUrl: 'ui-input-field.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UIInputField),
      multi: true,
    },
  ],
  encapsulation: ViewEncapsulation.ShadowDom,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UIInputField implements ControlValueAccessor, OnInit {
  label = input<string>();
  placeholder = input('');
  helperText = input<string>();
  errorText = input<string>();
  invalid = input(false, { transform: booleanAttribute });
  disabled = input(false, { transform: booleanAttribute });
  readonly = input(false, { transform: booleanAttribute });
  required = input(false, { transform: booleanAttribute });
  type = input('text');
  name = input('');
  autocomplete = input<string>();
  inputMode = input<string>();
  ariaLabel = input<string>();
  ariaLabelledby = input<string>();
  value = model('');
  blurred = output<FocusEvent>();

  readonly inputId = `ui-input-field-${++nextId}`;
  readonly messageId = `${this.inputId}-message`;

  private readonly focused = signal(false);
  private readonly formDisabled = signal(false);
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  readonly hasError = computed(() => this.invalid() || Boolean(this.errorText()));
  readonly message = computed(() => this.errorText() || this.helperText());

  ngOnInit(): void {
    if (!this.label()?.trim() && !this.ariaLabel()?.trim() && !this.ariaLabelledby()?.trim()) {
      throw new Error(
        '[UIInputField] label, ariaLabel or ariaLabelledby is required for an accessible name.',
      );
    }
  }

  onFocus(): void {
    this.focused.set(true);
  }

  onBlur(event: FocusEvent): void {
    this.focused.set(false);
    this.onTouched();
    this.blurred.emit(event);
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.onChange(value);
  }

  writeValue(value: unknown): void {
    this.value.set(value == null ? '' : String(value));
  }

  registerOnChange(callback: (value: string) => void): void {
    this.onChange = callback;
  }

  registerOnTouched(callback: () => void): void {
    this.onTouched = callback;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }

  @HostBinding('class.focused')
  get isFocused(): boolean {
    return this.focused();
  }

  @HostBinding('class.filled')
  get isFilled(): boolean {
    return this.value().length > 0;
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

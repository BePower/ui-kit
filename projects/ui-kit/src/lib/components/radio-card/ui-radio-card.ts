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
import { IonRadio, IonRadioGroup } from '@ionic/angular/standalone';

let nextCardId = 0;
let nextGroupId = 0;

@Component({
  selector: 'ui-radio-card',
  standalone: true,
  imports: [IonRadio],
  template: `
    <ion-radio
      mode="ios"
      labelPlacement="end"
      alignment="center"
      justify="start"
      [value]="value()"
      [disabled]="isDisabled()"
      [class.error]="hasError()"
      [attr.aria-label]="title()"
      [attr.aria-describedby]="describedBy()"
    >
      <span class="content">
        <span class="title">{{ title() }}</span>
        <span class="description" [id]="descriptionId">{{ description() }}</span>
        @if (errorText()) {
          <span class="error-message" [id]="errorId" role="alert">{{ errorText() }}</span>
        }
      </span>
    </ion-radio>
  `,
  styleUrl: 'ui-radio-card.scss',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UIRadioCard implements OnInit {
  value = input.required<string>();
  title = input.required<string>();
  description = input.required<string>();
  disabled = input(false, { transform: booleanAttribute });
  invalid = input(false, { transform: booleanAttribute });
  errorText = input<string>();

  readonly cardId = `ui-radio-card-${++nextCardId}`;
  readonly descriptionId = `${this.cardId}-description`;
  readonly errorId = `${this.cardId}-error`;

  private readonly groupDisabled = signal(false);
  private readonly groupInvalid = signal(false);

  readonly isDisabled = computed(() => this.disabled() || this.groupDisabled());
  readonly hasError = computed(
    () => this.invalid() || this.groupInvalid() || Boolean(this.errorText()),
  );
  readonly describedBy = computed(() =>
    [this.descriptionId, this.errorText() ? this.errorId : null].filter(Boolean).join(' '),
  );

  ngOnInit(): void {
    if (!this.value().trim()) {
      throw new Error('[UIRadioCard] value is required and cannot be blank.');
    }
    if (!this.title().trim()) {
      throw new Error('[UIRadioCard] title is required and cannot be blank.');
    }
    if (!this.description().trim()) {
      throw new Error('[UIRadioCard] description is required and cannot be blank.');
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

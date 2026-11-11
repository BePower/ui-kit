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

let nextCardId = 0;

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
      [attr.aria-label]="accessibleName()"
      [attr.aria-describedby]="describedBy()"
    >
      <span class="content">
        @if (title()) {
          <span class="title">{{ title() }}</span>
        }
        @if (description()) {
          <span class="description" [id]="descriptionId">{{ description() }}</span>
        }
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
  title = input<string>();
  description = input<string>();
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
  readonly accessibleName = computed(
    () => this.title()?.trim() || this.description()?.trim() || '',
  );
  readonly describedBy = computed(() =>
    [
      this.title() && this.description() ? this.descriptionId : null,
      this.errorText() ? this.errorId : null,
    ]
      .filter(Boolean)
      .join(' '),
  );

  ngOnInit(): void {
    if (!this.value().trim()) {
      throw new Error('[UIRadioCard] value is required and cannot be blank.');
    }
    const title = this.title()?.trim();
    const description = this.description()?.trim();
    if (!title && !description) {
      throw new Error('[UIRadioCard] title or description is required.');
    }
    if (this.title() !== undefined && !title) {
      throw new Error('[UIRadioCard] title cannot be blank when provided.');
    }
    if (this.description() !== undefined && !description) {
      throw new Error('[UIRadioCard] description cannot be blank when provided.');
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

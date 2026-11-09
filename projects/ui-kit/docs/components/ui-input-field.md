# `ui-input-field`

Consumer-facing documentation for the `ui-input-field` component.

## Import

`ui-input-field` is a standalone Angular component.

```ts
import { Component } from '@angular/core';
import { UIInputField } from '@bepower/ui-kit';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [UIInputField],
  template: `<ui-input-field label="Email" placeholder="name@example.com"></ui-input-field>`,
})
export class ExampleComponent {}
```

## Basic usage

```html
<ui-input-field label="Email" placeholder="name@example.com"></ui-input-field>
```

The component renders a native `<input>` inside its Shadow DOM, with an optional label, an optional
message area below the control, and two content slots for leading and trailing adornments. It
implements `ControlValueAccessor`, so it works both as a standalone input and inside Angular forms.

## Accessible name

The component requires an accessible name: provide at least one of `label`, `ariaLabel`, or
`ariaLabelledby`. When none is set and the label is empty, the component throws at init time. This
is intentional: an unlabeled text field is not accessible.

## Inputs

### `label`

Visible label rendered as a `<label>` associated to the input. Also serves as the accessible name
when present.

Type: `string | undefined`. Default: `undefined`.

### `placeholder`

Placeholder text shown when the field is empty.

Type: `string`. Default: `''`.

### `bottomText`

Helper text rendered below the control. Superseded by `errorText` when the field is in error.

Type: `string | undefined`. Default: `undefined`.

### `errorText`

Error message rendered below the control. When set, it also puts the field in the error state
(`hasError`), is announced via `role="alert"`, and marks the input `aria-invalid`.

Type: `string | undefined`. Default: `undefined`.

### `invalid`

Forces the error state without an error message. Combine with `errorText` for a message, or use
alone to style the field as invalid.

Type: `boolean`. Default: `false`.

### `disabled`

Disables the field. The form-level disabled state (`setDisabledState`) is merged with this input,
so a reactive form can disable the control as well.

Type: `boolean`. Default: `false`.

### `readonly`

Renders the input read-only (focusable, value not editable).

Type: `boolean`. Default: `false`.

### `required`

Marks the native input as required.

Type: `boolean`. Default: `false`.

### `type`

Native input type (`text`, `email`, `password`, `number`, ...).

Type: `string`. Default: `'text'`.

### `name`

Native input `name`.

Type: `string`. Default: `''`.

### `autocomplete`

Maps to the native `autocomplete` attribute.

Type: `string | undefined`. Default: `undefined`.

### `inputMode`

Maps to the native `inputmode` attribute, hinting the on-screen keyboard (`numeric`, `email`, ...).

Type: `string | undefined`. Default: `undefined`.

### `ariaLabel`

Accessible name when no visible `label` is used.

Type: `string | undefined`. Default: `undefined`.

### `ariaLabelledby`

References the id of an external element that labels the field.

Type: `string | undefined`. Default: `undefined`.

## Model and outputs

### `value`

Two-way bindable value (`model`). Also updated through `ControlValueAccessor` when used with a form
control.

Type: `string`. Default: `''`.

```html
<ui-input-field label="Email" [(value)]="email"></ui-input-field>
```

### `blurred`

Emits the native `FocusEvent` when the input loses focus.

Type: `output<FocusEvent>`.

## Slots

| Slot             | Purpose                                      |
| ---------------- | -------------------------------------------- |
| `[slot='left']`  | Leading adornment (e.g. a search `ui-icon`). |
| `[slot='right']` | Trailing adornment (e.g. an info `ui-icon`). |

```html
<ui-input-field label="Search" placeholder="Search">
  <ui-icon slot="left" name="lens" fill="no-fill" size="24"></ui-icon>
  <ui-icon slot="right" name="info" fill="no-fill" size="24"></ui-icon>
</ui-input-field>
```

## Use with Angular forms

Because the component provides `NG_VALUE_ACCESSOR`, it integrates with template-driven and reactive
forms:

```html
<ui-input-field label="Email" formControlName="email"></ui-input-field>
```

The form's disabled state is applied through `setDisabledState` and merged with the `disabled`
input; touch state is propagated on blur.

## Host state classes

The host reflects state via classes for styling: `focused`, `filled`, `disabled`, `error`.

## Notes

- `ui-input-field` uses `ViewEncapsulation.ShadowDom`; its control rules are owned by the UI kit.
- The error message area is wired to the input through `aria-describedby`; in the error state it is
  exposed as an alert and the input is `aria-invalid`.
- Accept consumer-provided label and message copy; do not embed application-specific strings.

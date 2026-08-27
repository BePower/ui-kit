# `ui-title`

Consumer-facing documentation for the `ui-title` component.

## Import

`ui-title` is a standalone Angular component.

```ts
import { Component } from '@angular/core';
import { UITitle } from '@bepower/ui-kit';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [UITitle],
  template: `<ui-title>Section title</ui-title>`,
})
export class ExampleComponent {}
```

## Basic usage

```html
<ui-title>Section title</ui-title>
```

The component renders a native heading in its Shadow DOM, resets its browser margin, and applies a
design-system title token. The default `size="l"` renders an `h2`.

## Inputs

### `size`

Selects both the heading level and the design-system typography token.

Type:

```ts
'xl' | 'l' | 'm' | 's';
```

Default:

```ts
'l';
```

| Size | Native element | Typography token |
| ---- | -------------- | ---------------- |
| `xl` | `h1`           | `title-xl`       |
| `l`  | `h2`           | `title-l`        |
| `m`  | `h3`           | `title-m`        |
| `s`  | `h4`           | `title-s`        |

Use the size that preserves the page heading hierarchy.

```html
<ui-title size="xl">Page title</ui-title> <ui-title size="m">Subsection title</ui-title>
```

### `color`

`ui-title` applies an optional Ionic color to its content while retaining the selected heading
semantics and typography.

Type:

```ts
'default-grey' | 'primary' | 'secondary' | 'white' | 'green' | undefined;
```

Default: `undefined`.

```html
<ui-title color="green">Green title</ui-title>
```

Use an inner `ui-text` only when a fragment needs a different inline color or typography; its color
overrides the title color for that fragment.

### `ariaLabel`

Optionally overrides the accessible name of the native heading. Use it only when screen readers
must announce text that differs from the visible title; otherwise, the projected text is already
the accessible name.

Type: `string | undefined`.

```html
<ui-title ariaLabel="Account and security settings">Settings</ui-title>
```

### `ariaHidden`

Removes the native heading from the accessibility tree.

Type: `boolean`.

Default: `false`.

Use it only for a visible duplicate of another accessible title. It cannot be combined with
`ariaLabel`; the component throws an error when both are set.

```html
<ui-title ariaHidden>Settings</ui-title>
```

## Notes

- `ui-title` uses `ViewEncapsulation.ShadowDom`; its title rules are owned by the UI kit.
- It deliberately does not use `display: contents`; the native heading remains the semantic
  element exposed to assistive technologies.
- The component is intended for content titles. Keep Ionic `ion-title` for Ionic toolbar headers.

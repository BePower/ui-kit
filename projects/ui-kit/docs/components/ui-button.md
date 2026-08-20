# `ui-button`

Consumer-facing documentation for the `ui-button` component.

## Import

`ui-button` is a standalone Angular component.

```ts
import { Component } from '@angular/core';
import { UIButton } from '@bepower/ui-kit';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [UIButton],
  template: `<ui-button ariaLabel="Continue">Continue</ui-button>`,
})
export class ExampleComponent {}
```

## Basic usage

```html
<ui-button ariaLabel="Continue">Continue</ui-button>
```

## Inputs

### `variant`

Controls the visual style of the button.

Type:

```ts
'primary' | 'secondary' | 'outlined';
```

Default:

```ts
'primary';
```

Example:

```html
<ui-button ariaLabel="Primary" variant="primary">Primary</ui-button>
<ui-button ariaLabel="Secondary" variant="secondary">Secondary</ui-button>
<ui-button ariaLabel="Outlined" variant="outlined">Outlined</ui-button>
```

Behavior:

- `primary` uses Ionic `color="primary"` and `fill="solid"`
- `secondary` uses Ionic `color="default-grey"` and `fill="clear"`
- `outlined` uses Ionic `color="default-grey"` and `fill="outline"`

### `size`

Controls the internal spacing model.

Type:

```ts
'default' | 'icon' | 'min-icon';
```

Default:

```ts
'default';
```

Example:

```html
<ui-button ariaLabel="Default" size="default">Default</ui-button>
<ui-button ariaLabel="Add item" size="icon">
  <ion-icon name="add"></ion-icon>
</ui-button>
```

Behavior:

- `default` uses standard horizontal padding
- `icon` uses a more compact layout and rounded icon-button shape
- `min-icon` removes the button padding and minimum dimensions

### `expand`

Makes the button take the available width.

Type:

```ts
boolean;
```

Default:

```ts
false;
```

Example:

```html
<ui-button ariaLabel="Full width" [expand]="true">Full width</ui-button>
```

### `disabled`

Disables the button.

Type:

```ts
boolean;
```

Default:

```ts
false;
```

Example:

```html
<ui-button ariaLabel="Disabled" [disabled]="true">Disabled</ui-button>
```

### `ariaLabel`

Sets an accessible name on the wrapped Ionic button.

Type: `string | undefined`.

Default: no explicit label.

It is required when `ariaHidden` is `false`. The value is forwarded through the component Shadow DOM
to the native interactive button.

```html
<ui-button ariaLabel="Add item" size="icon">
  <ui-icon slot="icon-only" name="plus" fill="no-fill" />
</ui-button>
```

### `ariaHidden`

Removes the wrapped Ionic button from the accessibility tree.

Type: `boolean`.

Default: `false`.

When `true`, `ariaLabel` is optional. Use it only when another accessible control represents the
same action.

### `isLoading`

Replaces the projected content with a spinner when loading.

Type:

```ts
boolean;
```

Default:

```ts
false;
```

Example:

```html
<ui-button ariaLabel="Saving" [isLoading]="true">Saving</ui-button>
```

Behavior:

- when loading, the projected content is hidden and an `ion-spinner` is shown
- the button is also disabled while loading
- loading is currently applied only when `variant` is not `secondary`

## Content projection

`ui-button` projects its content into the wrapped Ionic button.

Example:

```html
<ui-button ariaLabel="Save changes">Save changes</ui-button>
```

You can also project slotted content that Ionic supports, such as `start` and `end`.

Example:

```html
<ui-button ariaLabel="Add item">
  <ion-icon slot="start" name="add"></ion-icon>
  Add item
</ui-button>
```

```html
<ui-button ariaLabel="Details" variant="outlined">
  Details
  <ion-icon slot="end" name="chevron-forward"></ion-icon>
</ui-button>
```

### Icon-only slot

Use Ionic's `icon-only` slot with `size="icon"` when the button has no text content. Import both standalone components in the consumer Angular component.

```ts
import { UIButton, UIIcon } from '@bepower/ui-kit';

@Component({
  // ...
  imports: [UIButton, UIIcon],
})
export class ExampleComponent {}
```

```html
<ui-button ariaLabel="Add item" size="icon">
  <ui-icon slot="icon-only" name="plus" fill="no-fill" />
</ui-button>
```

Provide an accessible name with `ariaLabel` whenever `ariaHidden` is `false`.

## Notes

- The component uses `ViewEncapsulation.ShadowDom`
- The consumer does not need to import component-local styles manually
- The consumer should still import `@bepower/ui-kit/base` globally as described in the main README
- Slot spacing is handled by the component stylesheet for supported projected nodes such as `ion-icon[slot='start']`

## Example combinations

Primary full width button:

```html
<ui-button ariaLabel="Continue" variant="primary" [expand]="true">Continue</ui-button>
```

Outlined button with trailing icon:

```html
<ui-button ariaLabel="Learn more" variant="outlined">
  Learn more
  <ion-icon slot="end" name="arrow-forward"></ion-icon>
</ui-button>
```

Loading button:

```html
<ui-button ariaLabel="Saving" [isLoading]="true">Saving</ui-button>
```

Icon-only button:

```html
<ui-button ariaLabel="Open notifications" size="icon">
  <ui-icon slot="icon-only" name="notification" />
</ui-button>
```

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
<ui-button ariaLabel="Primary action" variant="primary">Primary</ui-button>
<ui-button ariaLabel="Secondary action" variant="secondary">Secondary</ui-button>
<ui-button ariaLabel="Outlined action" variant="outlined">Outlined</ui-button>
```

Behavior:

- `primary` uses Ionic `color="primary"` and `fill="solid"`
- `secondary` uses Ionic `color="default-grey"` and `fill="clear"`
- `outlined` uses Ionic `color="default-grey"` and `fill="outline"`

### `size`

Controls the internal spacing model.

Type:

```ts
'default' | 'icon' | 'min-icon' | 'inline';
```

Default:

```ts
'default';
```

Example:

```html
<ui-button ariaLabel="Default action" size="default">Default</ui-button>
<ui-button ariaLabel="Add item" size="icon">
  <ion-icon name="add"></ion-icon>
</ui-button>
<ui-button size="inline" variant="secondary">Learn more</ui-button>
```

Behavior:

- `default` uses standard horizontal padding
- `icon` uses a more compact layout and rounded icon-button shape
- `min-icon` removes the button padding and minimum dimensions
- `inline` is a text CTA for use within prose; it removes standard padding and minimum dimensions

`inline` is valid only with `variant="secondary"` and cannot be combined with `expand`.

### Inline CTA

Use `size="inline"` for an action that acts on the current screen, such as opening a modal. It
renders as an inline action with button semantics, including keyboard activation with Enter and
Space. Its text can wrap naturally within a paragraph.

```html
<ui-p>
  Discover more benefits.
  <ui-button size="inline" variant="secondary" (click)="openBenefitsModal()">
    Read the details
  </ui-button>
</ui-p>
```

Keep primary calls to action as standalone buttons so they retain their larger touch target.

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
<ui-button ariaLabel="Full width action" [expand]="true">Full width</ui-button>
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
<ui-button ariaLabel="Disabled action" [disabled]="true">Disabled</ui-button>
```

### `ariaLabel`

Sets the accessible name on the interactive button.

Type: `string | undefined`.

`ariaLabel` is required unless `ariaHidden` is `true`. The only exception is `size="inline"`, whose
projected text supplies its accessible name; `ariaLabel` remains available there as an override.
The value is forwarded through the component Shadow DOM to the native interactive button.

```html
<ui-button ariaLabel="Add item" size="icon">
  <ui-icon slot="icon-only" name="plus" fill="no-fill" />
</ui-button>
```

### `ariaHidden`

Removes the wrapped Ionic button from the accessibility tree.

Type: `boolean`.

Default: `false`.

When `true`, the component also makes the control inert and removes it from keyboard navigation.
Use it only when another accessible control represents the same action.

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
<ui-button ariaLabel="View details" variant="outlined">
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

Provide `ariaLabel` for every visible button except `size="inline"`. An inline CTA is named by its
projected text unless `ariaLabel` overrides it.

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

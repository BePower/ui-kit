# `ui-icon`

Consumer-facing documentation for the `ui-icon` component.

## Import

`ui-icon` is a standalone Angular component.

```ts
import { Component } from '@angular/core';
import { UIIcon } from '@bepower/ui-kit';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [UIIcon],
  template: `<ui-icon name="arrow" fill="no-fill" />`,
})
export class ExampleComponent {}
```

## Icon loading

Icons are compiled into the UI kit as TypeScript data URIs and loaded on demand. The consumer does not need to add SVG assets to `angular.json` or configure another asset-copy rule.

## Basic usage

```html
<ui-icon name="arrow" fill="no-fill" />
```

## Inputs

### `name`

Selects an icon from the UI kit icon set.

Type:

```ts
IconName
```

Required: yes.

Available names:

```ts
'apple-logo' | 'arrow' | 'arrow-left' | 'arrow-right' | 'bank' | 'building'
| 'camera' | 'car' | 'card' | 'change' | 'check' | 'clock' | 'close'
| 'condivisione' | 'counter' | 'cta' | 'doc' | 'dropdown' | 'dropdown-left'
| 'dropdown-right' | 'dropdown-up' | 'euro' | 'eye' | 'eye-close'
| 'facebook-logo' | 'fulmine' | 'gift' | 'google-logo' | 'graph' | 'heart'
| 'hourglass' | 'info' | 'lens' | 'lines' | 'menu' | 'notification' | 'pin'
| 'plate' | 'plus' | 'posizione' | 'profile' | 'route' | 'setting' | 'share'
| 'star' | 'supporto' | 'trash' | 'valigia' | 'wallet' | 'warning'
```

Example:

```html
<ui-icon name="wallet" />
```

### `fill`

Selects the available visual variant of the icon.

Type:

```ts
'fill' | 'no-fill'
```

Default:

```ts
'fill'
```

Example:

```html
<ui-icon name="arrow" fill="fill" />
<ui-icon name="arrow" fill="no-fill" />
```

Not every icon has both variants. Use only a variant that is available for the selected name; when an unavailable pair is requested, the component logs an error and renders no icon.

### `size`

Controls the rendered icon size.

Type:

```ts
'16' | '24' | '36' | '48'
```

Default:

```ts
'24'
```

Example:

```html
<ui-icon name="plus" fill="no-fill" size="16" />
<ui-icon name="notification" size="36" />
<ui-icon name="warning" size="48" />
```

### `color`

Applies an Ionic color token to the icon.

Type:

```ts
'default-grey' | 'primary'
```

Default: no Ionic color is set.

Example:

```html
<ui-icon name="warning" color="primary" />
<ui-icon name="info" fill="no-fill" color="default-grey" />
```

The imported SVG paths use `currentColor`, so the selected Ionic color is applied to the icon.

## Notes

- The component uses `ViewEncapsulation.ShadowDom`.
- The consumer does not need to import component-local styles manually.
- The consumer should install `source-sans` and import `@bepower/ui-kit/base` globally as described in the main README.
- Icon names and variants are generated from the library icon source. See [Importing Icons](../../src/lib/components/icon/IMPORTING_ICONS.md) for the maintainer workflow.

## Example combinations

Small outlined arrow:

```html
<ui-icon name="arrow" fill="no-fill" size="16" color="primary" />
```

Filled notification:

```html
<ui-icon name="notification" fill="fill" size="24" />
```

Large warning icon:

```html
<ui-icon name="warning" fill="fill" size="48" color="primary" />
```

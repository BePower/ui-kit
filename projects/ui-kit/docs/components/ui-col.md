# `ui-col`

Consumer-facing documentation for the `ui-col` component.

## Import

```ts
import { UICol } from '@bepower/ui-kit';
```

## Basic usage

```html
<ui-col size="6" justify="center" align="center">Column content</ui-col>
```

`ui-col` is always a flex container and wraps Ionic's `ion-col`.

## Inputs

### `justify`

Controls horizontal alignment of the column content.

Type: `'start' | 'center' | 'end'`.

Default: `'start'`.

### `align`

Controls vertical alignment of the column content.

Type: `'start' | 'center' | 'end'`.

Default: `'start'`.

### `horizontal`

Adds horizontal content inset to this individual column.

Type:

```ts
'none' | 'xxxs' | 'xxs' | 'xs' | 's' | 'm';
```

Default: `'none'`.

| Token | Value |
| ----- | ----- |
| `none` | `0px` |
| `xxxs` | `8px` |
| `xxs` | `16px` |
| `xs` | `24px` |
| `s` | `32px` |
| `m` | `40px` |

This inset is additive to the half-gutter inherited from `ui-row gap`. Use it for local content
inset, not for the grid gutter or the page margin: those belong to `ui-row` and `ui-grid`.

### `size`

Sets the Ionic grid span of the column.

Type:

```ts
number | `${number}` | 'auto' | undefined;
```

Default: `undefined`.

The value is forwarded to `ion-col`. For example, use `size="4"` and `size="8"` for a 4/8 row,
or omit `size` on two columns to divide the available width equally.

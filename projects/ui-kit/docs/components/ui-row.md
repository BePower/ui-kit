# `ui-row`

Consumer-facing documentation for the `ui-row` component.

## Import

```ts
import { UICol, UIRow } from '@bepower/ui-kit';
```

## Basic usage

```html
<ui-row top="s" bottom="m" gap="xxs">
  <ui-col>First column</ui-col>
  <ui-col>Second column</ui-col>
</ui-row>
```

## Inputs

### `legacyContent`

Enables temporary native-slot content distribution for consumer styles during migration.

Type: `boolean`. Default: `false` (Angular content projection inside the component's Shadow DOM).

Set `legacyContent` to keep the row's children in its light DOM. The value is read once during
initialization; later input changes are ignored. Recreate the component to change modes.
This option is independent of the parent grid and any nested columns.
Remove it once the content has been migrated to the UI kit.

See [legacy content migration](../legacy-content.md) for a complete example and limitations.

### `top`

Applies block-start padding to the row.

Type:

```ts
'none' | 'xxxs' | 'xxs' | 'xs' | 's' | 'm' | 'l';
```

Default: `'none'`.

| Token  | Value  |
| ------ | ------ |
| `none` | `0px`  |
| `xxxs` | `8px`  |
| `xxs`  | `16px` |
| `xs`   | `24px` |
| `s`    | `32px` |
| `m`    | `40px` |
| `l`    | `48px` |

### `bottom`

Applies block-end padding to the row.

Type:

```ts
'none' | 'xxxs' | 'xxs' | 'xs' | 's' | 'm' | 'l';
```

Default: `'none'`.

`top` and `bottom` are independent, so the row can follow an asymmetric vertical rhythm without
requiring the same inset on both sides.

### `gap`

Sets the horizontal gutter between descendant `ui-col` elements.

Type:

```ts
'none' | 'xxxs' | 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'xxxl';
```

Default: `'xxs'`.

The component implements this as half the selected value on each column, with matching negative
row margins. It deliberately does not use CSS `gap`, so the gutter does not alter column widths.

Use `gap` with `ui-col`; native `ion-col` elements do not consume this UI-kit gutter.

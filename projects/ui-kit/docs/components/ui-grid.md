# `ui-grid`

Consumer-facing documentation for the `ui-grid` component.

## Import

```ts
import { Component } from '@angular/core';
import { UICol, UIGrid, UIRow } from '@bepower/ui-kit';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [UIGrid, UIRow, UICol],
  template: `
    <ui-grid horizontal="xs">
      <ui-row gap="xxs">
        <ui-col>First column</ui-col>
        <ui-col>Second column</ui-col>
      </ui-row>
    </ui-grid>
  `,
})
export class ExampleComponent {}
```

`ui-grid` wraps Ionic's `ion-grid` and owns the outer horizontal inset of the grid.

## Inputs

### `horizontal`

Sets the outer horizontal inset using a design-system spacing token.

Type:

```ts
'none' | 'xxxs' | 'xxs' | 'xs' | 's' | 'm';
```

Default: `'xs'`.

| Token | Value |
| ----- | ----- |
| `none` | `0px` |
| `xxxs` | `8px` |
| `xxs` | `16px` |
| `xs` | `24px` |
| `s` | `32px` |
| `m` | `40px` |

Together with the default `ui-row gap="xxs"`, this produces the standard 24px outer margin and
16px gutter shown in the grid specification.

### `fixed`

Enables Ionic's fixed-width grid behavior.

Type: `boolean`.

Default: `false`.

When enabled, Ionic constrains the grid to breakpoint-based maximum widths and centers it on wider
screens. It has no visible effect on phone-sized viewports, where the grid remains 100% wide.
Use it for desktop-oriented layouts; keep it disabled for the full-width mobile layout.

## Spacing model

`ui-grid` owns the outer inset. `ui-row` owns the gutter and `ui-col` applies the corresponding
half-gutter as internal column padding. This preserves Ionic's percentage column sizing without
using CSS `gap`.

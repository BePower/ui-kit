# `ui-text`

Consumer-facing documentation for the `ui-text` component.

## Import

`ui-text` is a standalone Angular component.

```ts
import { Component } from '@angular/core';
import { UIP, UIText } from '@bepower/ui-kit';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [UIP, UIText],
  template: `<ui-p>Paragraph <ui-text variant="body-s">detail</ui-text>.</ui-p>`,
})
export class ExampleComponent {}
```

## Basic usage

`ui-text` is an inline typography and color primitive. It renders Ionic `ion-text`, but does not
create a semantic text element: the surrounding element owns the semantics.

By default it inherits the typography of its surrounding text and applies the `default-grey` Ionic
color.

```html
<ui-p>Standard text with an <ui-text>inherited inline fragment</ui-text>.</ui-p>
```

It is not a replacement for `ui-title` or `ui-p`, which own heading and paragraph semantics.

## Inputs

### `variant`

Selects an inline typography override without changing the semantics of the surrounding content.

Type:

```ts
'inherit' | 'body-l' | 'body-m' | 'body-s' | 'label-l' | 'label-m' | 'label-s';
```

Default:

```ts
'inherit';
```

| Variant   | Effect                                 |
| --------- | -------------------------------------- |
| `inherit` | Keeps the typography of the parent     |
| `body-l`  | Applies the `p-l` typography token     |
| `body-m`  | Applies the `p-m` typography token     |
| `body-s`  | Applies the `p-s` typography token     |
| `label-l` | Applies the `label-l` typography token |
| `label-m` | Applies the `label-m` typography token |
| `label-s` | Applies the `label-s` typography token |

```html
<ui-p>
  Standard paragraph text.
  <ui-text variant="body-s">Secondary inline text.</ui-text>
</ui-p>
```

Use a `label-*` variant for short UI labels rather than prose. The projected text remains inline;
the variant changes only its typography: it does not create an HTML `label` or associate text with
a form control.

```html
<ui-p>Selected plan: <ui-text variant="label-m">Standard</ui-text></ui-p>
```

### `color`

Applies an Ionic color independently of the typography variant.

Type:

```ts
TextColor;
```

Default: `'default-grey'`.

```html
<ui-p>
  Your session expires soon.
  <ui-text variant="body-s" color="default-grey">Save your work.</ui-text>
</ui-p>
```

## Accessibility

`ui-text` leaves its projected content exposed to assistive technologies. Use native `strong`,
`em`, and `a` elements when the text needs semantic emphasis or link behavior. Do not use it as a
replacement for `ui-p` or `ui-title`.

## Notes

- `ui-text` uses `ViewEncapsulation.ShadowDom` and remains inline.
- Use `variant="inherit"` when the component must preserve surrounding typography while applying
  its Ionic color.

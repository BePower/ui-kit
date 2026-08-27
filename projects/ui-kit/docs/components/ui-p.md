# `ui-p`

Consumer-facing documentation for the `ui-p` component.

## Import

`ui-p` is a standalone Angular component.

```ts
import { Component } from '@angular/core';
import { UIP } from '@bepower/ui-kit';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [UIP],
  template: `<ui-p>Paragraph text</ui-p>`,
})
export class ExampleComponent {}
```

## Basic usage

```html
<ui-p>Paragraph text</ui-p>
```

The component renders a native `p` element in its Shadow DOM, resets its browser margin, and
applies the `p-m` paragraph typography token.

## Inputs

### Inline text

`ui-p` owns the block semantics and default `p-m` typography. Use `ui-text` only for inline text
that needs a different body token and/or Ionic color; import `UIText` alongside `UIP` in the
consuming component.

```html
<ui-p>
  Standard text.
  <ui-text variant="body-s" color="default-grey">Secondary note.</ui-text>
</ui-p>
```

### Inline action

For an action on the current screen, such as opening a modal, project a secondary `ui-button` with
`size="inline"`. The button remains semantically interactive while following the paragraph flow.

```html
<ui-p>
  Discover more benefits.
  <ui-button size="inline" variant="secondary" (click)="openBenefitsModal()">
    Read the details
  </ui-button>
</ui-p>
```

Use a link for navigation to another destination rather than an inline button.

### `ariaHidden`

Removes the native paragraph from the accessibility tree.

Type: `boolean`.

Default: `false`.

Use it only for visible text that duplicates information announced elsewhere, such as the label
next to an accessible progress bar.

```html
<ui-p ariaHidden>Step 2 of 4</ui-p>
```

## Notes

- `ui-p` does not expose `ariaLabel`: paragraph text supplies its own accessible content.
- `ui-p` always uses `p-m`. Use `ui-text` for local inline typography changes.
- `ui-p` uses `ViewEncapsulation.ShadowDom`, so its typography rules are owned by the UI kit.

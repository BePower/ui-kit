# `ui-progress-bar`

Consumer-facing documentation for the `ui-progress-bar` component.

## Import

`ui-progress-bar` is a standalone Angular component.

```ts
import { Component } from '@angular/core';
import { UIProgressBar } from '@bepower/ui-kit';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [UIProgressBar],
  template: `<ui-progress-bar ariaLabel="Step progress" [value]="0.5"></ui-progress-bar>`,
})
export class ExampleComponent {}
```

## Basic usage

```html
<ui-progress-bar ariaLabel="Avanzamento della procedura" ariaValueText="2 di 4" [value]="0.5">
</ui-progress-bar>
```

The component wraps Ionic's `ion-progress-bar` (`mode="ios"`, `color="tertiary"`) inside its Shadow
DOM and exposes a small, design-system-oriented API. `value` is a determinate fraction between `0`
and `1`.

## Accessible name

The component requires an accessible name unless it is hidden from assistive technology: provide
`ariaLabel` whenever `ariaHidden` is `false`. When neither is set the component throws at init time.
Pair `ariaLabel` with `ariaValueText` to announce the current step in human terms (e.g. `"2 di 4"`)
rather than the raw fraction.

## Inputs

### `value`

Determinate progress as a fraction from `0` to `1`.

Type: `number`. Default: `0`.

```html
<ui-progress-bar ariaLabel="Upload" [value]="0.25"></ui-progress-bar>
```

### `ariaLabel`

Accessible name of the progress bar. Required when `ariaHidden` is `false`.

Type: `string | undefined`. Default: `undefined`.

### `ariaValueText`

Human-readable description of the current value, announced instead of the numeric fraction.

Type: `string | undefined`. Default: `undefined`.

```html
<ui-progress-bar ariaLabel="Procedura" ariaValueText="2 di 4" [value]="0.5"></ui-progress-bar>
```

### `ariaHidden`

Removes the progress bar from the accessibility tree.

Type: `boolean`. Default: `false`.

Use it only for a purely decorative bar, or when progress is already announced elsewhere. When
`true`, `ariaLabel` is not required.

```html
<ui-progress-bar ariaHidden [value]="0.5"></ui-progress-bar>
```

## Notes

- `ui-progress-bar` uses `ViewEncapsulation.ShadowDom`; it maps Ionic color through the UI kit.
- It renders a determinate bar; it does not expose an indeterminate mode.
- Keep `value` within `0`–`1`; values outside the range are passed through to Ionic unchanged.

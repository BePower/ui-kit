# `ui-pictogram`

Consumer-facing documentation for the `ui-pictogram` component.

## Import

`ui-pictogram` is a standalone Angular component.

```ts
import { Component } from '@angular/core';
import { UIPictogram } from '@bepower/ui-kit';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [UIPictogram],
  template: `<ui-pictogram name="placeholder" />`,
})
export class ExampleComponent {}
```

## Pictogram loading

Pictograms are compiled into the UI kit as TypeScript data URIs and loaded on demand. Original SVG colors are preserved. Consumers do not need asset-copy configuration.

## Inputs

### `name`

Selects a pictogram from the UI kit registry.

Type:

```ts
PictogramName;
```

Required: yes.

Initial placeholder value:

```ts
'placeholder';
```

### `size`

Controls the square rendered size.

Type:

```ts
'48' | '64' | '96' | '128';
```

Default:

```ts
'64';
```

## Accessibility

`ui-pictogram` is always decorative. Its internal image has an empty alternative text and `aria-hidden="true"`. Do not use it as the only way to communicate information.

## Example

```html
<ui-pictogram name="placeholder" size="96" />
```

## Maintainer workflow

Source SVG files live in the repository-level `pictograms/` directory. See [Importing Pictograms](../../src/lib/components/pictogram/IMPORTING_PICTOGRAMS.md) for synchronization rules.

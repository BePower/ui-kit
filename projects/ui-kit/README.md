# `@bepower/ui-kit`

Angular UI library for BePower design system components.

## Documentation

- [UI Elements Guide](./docs/ui-elements.md)
- [UIButton](./docs/components/ui-button.md)
- [UIIcon](./docs/components/ui-icon.md)

## Requirements

- Angular `21.x`
- `@angular/common` and `@angular/core` as peer dependencies

## Installation

```bash
npm install @bepower/ui-kit
```

## Using the library in Angular components

The library exposes standalone components, including `UIButton` and `UIIcon`.

Example:

```ts
import { Component } from '@angular/core';
import { UIButton } from '@bepower/ui-kit';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [UIButton],
  template: `<ui-button></ui-button>`,
})
export class ExampleComponent {}
```

## Required global import in the consumer

The library exposes a global `base.scss` file that must be explicitly imported by the consumer application to apply document-level rules such as:

- `html { font-size: 16px; }`
- `body { font-size: 1rem; }`

In the consumer app global SCSS file, for example `src/global.scss` or `src/styles.scss`, add:

```scss
@use '@ionic/angular/css/core.css';
@use '@ionic/angular/css/normalize.css';
@use '@bepower/ui-kit/base';
```

Important:

- `@use` statements must be declared before any CSS rules in the file
- Place `@use '@bepower/ui-kit/base';` after the Ionic `@use` statements so its global rules can override Ionic defaults when needed

Valid example:

```scss
@use '@ionic/angular/css/core.css';
@use '@ionic/angular/css/normalize.css';
@use '@bepower/ui-kit/base';

body {
  margin: 0;
}
```

## Why the global import is required

The library components use `ViewEncapsulation.ShadowDom`, so their internal styles are shipped with the component itself. Global rules targeting `html` and `body`, on the other hand, cannot be applied automatically by the library and must be imported by the consumer application.

## Development

Build the library:

```bash
ng build ui-kit
```

Watch mode:

```bash
npm run watch
```

## Publishing

Build the package:

```bash
npm run build
```

Publish the contents of `dist/ui-kit`:

```bash
npm publish ./dist/ui-kit
```

Important:

- use `./dist/ui-kit` and not `dist/ui-kit`
- without `./`, npm may interpret the path as a remote repository reference

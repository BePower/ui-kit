# `ui-page`

Consumer-facing documentation for the `ui-page` component.

## Import

`ui-page` is a standalone Angular component.

```ts
import { Component } from '@angular/core';
import { UIPage } from '@bepower/ui-kit';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [UIPage],
  template: `<ui-page>Page content</ui-page>`,
})
export class ExampleComponent {}
```

## Basic usage

Use `ui-page` as the root container for a screen. Header and footer are optional.

```html
<ui-page>
  <main>Page content</main>
</ui-page>
```

When no header is rendered, `ui-page` applies the top device safe area to `ion-content`. When no footer is rendered, it applies the bottom safe area.

## Header and footer

Enable the required container with an input and project its contents using the matching `header` or `footer` attribute. `ui-page` renders the enclosing `ion-toolbar` for both header and footer, so consumers must not project another toolbar.

```ts
import { IonButton, IonTitle } from '@ionic/angular/standalone';
import { UIPage } from '@bepower/ui-kit';

@Component({
  // ...
  imports: [UIPage, IonButton, IonTitle],
})
export class ExampleComponent {}
```

```html
<ui-page [hasHeader]="true" [hasFooter]="true">
  <ion-title header>Settings</ion-title>

  <main>Page content</main>

  <ion-button footer expand="block">Save</ion-button>
</ui-page>
```

## Inputs

### `hasHeader`

Renders `ion-header` with an `ion-toolbar`, then projects content marked with the `header` attribute into that toolbar.

Type: `boolean`.

Default: `false`.

### `hasFooter`

Renders `ion-footer` with an `ion-toolbar`, then projects content marked with the `footer` attribute into that toolbar.

Type: `boolean`.

Default: `false`.

### `fullscreen`

Makes `ion-content` scroll behind the header and footer, following Ionic's `fullscreen` behavior.

Type: `boolean`.

Default: `false`.

When enabled, `ui-page` does not add safe-area padding automatically. Use it only for intentional edge-to-edge layouts and manage any content padding required by the overlaying UI.

### `background`

Controls the shared background of `ion-content` and the `ion-toolbar` elements rendered for the optional header and footer.

Type: `'white' | 'grey' | 'light-green' | 'green' | 'yellow'`.

Default: `'white'`.

### `headerColor`

Overrides the header toolbar background with any valid CSS color value. When omitted, the header uses the value selected by `background`.

Type: `string`.

Default: no override.

Example:

```html
<ui-page [hasHeader]="true" headerColor="#0054e9">
  <ion-title header>Details</ion-title>
  <main>Page content</main>
</ui-page>
```

### `forceOverscroll`

Forwards Ionic's `forceOverscroll` input to `ion-content`.

Type: `boolean`.

Default: `false`.

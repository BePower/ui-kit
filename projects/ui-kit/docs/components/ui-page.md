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

`ui-page` renders the header internally. Configure it with `title`, `headerButtons`, and the optional `backButtonDefaultHref` input; do not project content with the `header` attribute. Content marked with `header` is not a supported slot and is rendered in the page content instead.

The footer still projects content marked with the `footer` attribute. `ui-page` renders the enclosing `ion-toolbar`, so consumers must not project another toolbar.

When content is scrollable, `ui-page` applies elevation 1 to the header after leaving the top of
the page and to the footer while content remains below it.

## Condensed title

Set `collapse` together with `hasHeader` and `title` to render Ionic's condensed large title inside
`ion-content`. Both headers use Ionic's iOS mode, which lets the large title collapse into the
normal header title while the content scrolls.

`collapse` also enables `fullscreen` automatically, so the content can scroll behind the header.

> The in-page scroll collapse works inside `ui-page`'s Shadow DOM. Ionic's built-in iOS route
> transition cannot query that large title across the Shadow DOM boundary; configure a custom route
> transition if that animation is required.

```ts
import { Component } from '@angular/core';
import { IonButton } from '@ionic/angular/standalone';
import { type HeaderButton, UIPage } from '@bepower/ui-kit';

@Component({
  // ...
  imports: [UIPage, IonButton],
})
export class ExampleComponent {
  readonly headerButtons: HeaderButton[] = [
    {
      name: 'share',
      fill: 'no-fill',
      ariaLabel: 'Share settings',
      callback: () => this.share(),
    },
  ];

  private share() {
    // Open the share flow.
  }
}
```

```html
<ui-page
  [hasHeader]="true"
  [hasFooter]="true"
  [collapse]="true"
  title="Settings"
  [headerButtons]="headerButtons"
  backButtonDefaultHref="/home"
>
  <main>Page content</main>

  <ion-button footer expand="block">Save</ion-button>
</ui-page>
```

## Inputs

### `hasHeader`

Renders the internal `ion-header` and `ion-toolbar`.

Type: `boolean`.

Default: `false`.

When the content overflows, the header applies elevation 1 after scrolling away from the top and
removes it again when returning to the top. The behavior is the same with and without `collapse`.

### `title`

Sets the text rendered by the internal header title.

Type: `string`.

Default: `''`.

### `headerButtons`

Adds icon-only actions to the end of the header.

Type:

```ts
HeaderButton[];

interface HeaderButton {
  name: IconName;
  fill: 'no-fill' | 'fill';
  ariaLabel: string;
  disabled?: boolean;
  callback: () => void;
}
```

Default: `[]`.

`ariaLabel` is required. Supply a localized description of the action, not of the icon, because the icon is decorative to assistive technologies.

### `backButtonDefaultHref`

Sets the fallback route for the header back button.

Type: `string | undefined`.

Default: no fallback route.

The button is shown only when the Ionic router outlet can navigate back or when this input has a value. With router history, it navigates back in that history; otherwise it navigates to `backButtonDefaultHref`.

### `hasFooter`

Renders `ion-footer` with an `ion-toolbar` and projects content marked with the `footer` attribute.

Type: `boolean`.

Default: `false`.

When the content overflows, the footer applies elevation 1 while content remains below it and
removes it at the bottom of the scroll range.

### `fullscreen`

Makes `ion-content` scroll behind the header and footer, following Ionic's `fullscreen` behavior.

Type: `boolean`.

Default: `false`.

When enabled, `ui-page` does not add safe-area padding automatically. Use it only for intentional edge-to-edge layouts and manage any content padding required by the overlaying UI.
It is also enabled implicitly when `collapse` is `true`.

### `collapse`

`collapse` is opt-in. When enabled, it renders Ionic's iOS condensed large title if `hasHeader` is
`true` and `title` is not empty. It also enables `fullscreen` automatically.

If either the header or title is missing, no condensed title is rendered, but `fullscreen` remains
enabled.

Type: `boolean`.

Default: `false`.

### `translucent`

Forwards Ionic's translucent appearance to the internal `ion-header`.

Type: `boolean`.

Default: `false`.

It has an effect only when `hasHeader` is `true`. It does not enable `fullscreen`; set
`fullscreen` explicitly or use `collapse`.

### `background`

Controls the `ion-content` and footer toolbar background. The header uses the same background
unless `headerType` is `green`.

Type: `'white' | 'grey' | 'light-green' | 'green' | 'yellow'`.

Default: `'white'`.

### `headerType`

Controls the header background and the matching title and icon colors.

Type: `'white' | 'green' | 'tab'`.

Default: `'white'`.

### `forceOverscroll`

Forwards Ionic's `forceOverscroll` input to `ion-content`.

Type: `boolean`.

Default: `false`.

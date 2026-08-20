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
  template: `<ui-page screenReaderTitle="Example page">Page content</ui-page>`,
})
export class ExampleComponent {}
```

## Basic usage

Use `ui-page` as the root container for a screen. Header and footer are optional.

```html
<ui-page screenReaderTitle="Example page">
  <main>Page content</main>
</ui-page>
```

`ui-page` always renders `ion-content` in Ionic fullscreen mode. When no header is rendered, it
applies the top device safe area to `ion-content`; when no footer is rendered, it applies the bottom
safe area.

When `hasHeader` is `false`, `screenReaderTitle` is required. When `hasHeader` is `true`, provide
either `title` or `screenReaderTitle`.

## Ionic lifecycle

When `ui-page` is inside a view managed by `ion-router-outlet` or `ion-nav`, Ionic lifecycle
callbacks are forwarded to it: `ionViewWillEnter`, `ionViewDidEnter`, `ionViewWillLeave`, and
`ionViewDidLeave`. This lets `ui-page` manage its own entry and exit behavior, such as focusing an
accessible page reference after the enter transition.

When the native screen reader is active, `ui-page` focuses the level-one page title after entering.
When `screenReaderTitle` is provided, it is announced instead of the visual `title`. If no visual
title is rendered, `ui-page` focuses a visually hidden level-one heading whose text comes from
`screenReaderTitle`.

For screen-specific behavior, implement the same hooks on the routed component.

## Header and footer

`ui-page` renders the header internally. Configure it with `title`, `headerButtons`, and the optional
`backButtonDefaultHref` input. When no header is rendered, provide `screenReaderTitle`; with a
header, provide it when `title` is empty or to override the title announced to screen readers. Do not
project content with the `header` attribute. Content marked with `header` is not a supported slot and
is rendered in the page content instead.

The footer still projects content marked with the `footer` attribute. `ui-page` renders the enclosing `ion-toolbar`, so consumers must not project another toolbar.

When content is scrollable, `ui-page` applies elevation 1 to the header after leaving the top of
the page and to the footer while content remains below it.

## Condensed title

Set `condensedHeader` together with `hasHeader` and `title` to render Ionic's condensed large title
inside `ion-content`. Both headers use Ionic's iOS mode, which lets the large title collapse into
the normal header title while the content scrolls.

The condensed title and page content share the same scrolling surface. Pages with short content do
not receive an artificial scroll range just to accommodate the large title.

On native platforms, `ui-page` waits for the screen reader status before enabling the condensed
header. When the screen reader is active, or its status is unavailable, it renders only the regular
header.

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
  [condensedHeader]="true"
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
removes it again when returning to the top. The behavior is the same with and without a condensed
header.

### `title`

Sets the text rendered by the internal header title.

Type: `string`.

Default: `''`.

It is rendered as the visible page title when `hasHeader` is `true`. When no header is rendered,
use `screenReaderTitle` for the accessible level-one page heading.

### `screenReaderTitle`

Sets the localized accessible page title. When both `title` and `screenReaderTitle` are provided,
`title` remains visual while `screenReaderTitle` is announced by screen readers.

Type: `string | undefined`.

Default: `undefined`.

It is required at runtime when `hasHeader` is `false`, or when `hasHeader` is `true` and `title` is
empty. In that case, `ui-page` renders and focuses `screenReaderTitle` as a visually hidden
level-one heading after entering. Use a meaningful, non-empty page name.

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

### `condensedHeader`

`condensedHeader` is opt-in. When enabled, it renders Ionic's iOS condensed large title if
`hasHeader` is `true` and `title` is not empty.

The condensed behavior is disabled while the native screen reader is active or its status is
unavailable.

If either the header or title is missing, no condensed title is rendered.

Type: `boolean`.

Default: `false`.

### `translucent`

Forwards Ionic's translucent appearance to the internal `ion-header`.

Type: `boolean`.

Default: `false`.

It has an effect only when `hasHeader` is `true`.

### `background`

Controls the `ion-content` and footer toolbar background. The header uses the same background
unless `headerType` is `green`.

Type: `'white' | 'grey' | 'light-green' | 'green' | 'yellow'`.

Default: `'white'`.

### `headerType`

Controls the header background and the matching title and icon colors.

When the page finishes entering, it also sets the native status bar style to match the header. Pages
without an internal header use the light status bar style.

Type: `'white' | 'green' | 'tab'`.

Default: `'white'`.

### `forceOverscroll`

Forwards Ionic's `forceOverscroll` input to `ion-content`.

Type: `boolean`.

Default: `false`.

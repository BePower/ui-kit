# UI Elements Guide

This guide defines the expected approach for building UI elements inside `@bepower/ui-kit`.

It is intended for developers working on the library itself, not only for consumers of the package.

## Goals

Each UI element should be:

- aligned with the BePower design system
- ready to use without local restyling in the consumer app
- isolated from external CSS as much as possible
- consistent across Angular applications
- based on a small, repeatable authoring pattern

## Default authoring pattern

Every new UI element should follow these defaults unless there is a strong reason not to:

- standalone Angular component
- `ViewEncapsulation.ShadowDom`
- `ChangeDetectionStrategy.OnPush`
- styling in a dedicated `.scss` file
- visual tokens imported from `foundations/*`
- use Ionic public APIs first when wrapping Ionic components

## Recommended file structure

For a component named `ui-example`:

```text
src/lib/components/example/
  ui-example.ts
  ui-example.scss
```

Shared design tokens and global rules live in:

```text
src/lib/foundations/
  base.scss
  colors.scss
  root.scss
  shadows.scss
  sizes.scss
  spacing.scss
  typography.scss
```

Types and interfaces shared by multiple components live in:

```text
src/lib/interfaces/
```

Keep a type next to its component while it remains local. Move it to `interfaces/` once more than
one component depends on it.

## Component API

Expose a small and intentional public API.

Prefer inputs that describe the design system intent:

- `variant`
- `size`
- `expand`
- `disabled`
- `isLoading`

Avoid exposing low-level styling hooks unless they are part of the intended contract.

## Semantic typography

Use `ui-title` and `ui-p` for design-system headings and paragraphs instead of asking consumers to
apply typography mixins or local CSS. The components render native semantic elements internally and
own their typography rules through Shadow DOM.

- `ui-title` maps `xl`, `l`, `m`, and `s` to native `h1`, `h2`, `h3`, and `h4` respectively,
  and accepts an optional Ionic color.
- `ui-p` always renders a native `p` element with the `p-m` token.
- `ui-text` is an inline primitive. Its default `inherit` variant preserves the surrounding
  typography; `body-l`, `body-m`, and `body-s` apply the corresponding paragraph tokens. Its
  `label-l`, `label-m`, and `label-s` variants apply the corresponding label tokens. Its Ionic
  color defaults to `default-grey` and is independent from the typography variant.
- Use native `strong`, `em`, and `a` elements for semantic emphasis and links.
- Do not use `display: contents` for semantic primitives. It removes only the host layout box and
  makes accessibility behavior less predictable across platforms.

## Signals

Signal inputs are allowed and currently used as the preferred internal component API.

Typical pattern:

```ts
variant = input<'primary' | 'secondary'>('primary');
disabled = input(false, { transform: booleanAttribute });

ionicColor = computed(() => {
  switch (this.variant()) {
    case 'secondary':
      return 'default-grey';
    case 'primary':
    default:
      return 'primary';
  }
});
```

Use `computed()` for derived state such as:

- Ionic `color`
- Ionic `fill`
- loading visibility
- host state flags

## Host classes

Host classes should represent the state of the component and drive styling in SCSS.

Example:

```ts
@HostBinding('class.primary')
get isPrimary() {
  return this.variant() === 'primary';
}
```

Then in SCSS:

```scss
:host(.primary) ion-button {
  /* variant styles */
}
```

This keeps state in TypeScript and presentation in SCSS.

## Styling strategy

### 1. Prefer foundations

Always import design tokens from the shared foundations:

```scss
@use 'foundations/colors' as colors;
@use 'foundations/sizes' as sizes;
@use 'foundations/typography' as typography;
@use 'foundations/shadows' as shadows;
```

Avoid hardcoded visual values when an equivalent token exists.
Use `shadows.$shadow-elevation-1`, `shadows.$shadow-elevation-2`, or
`shadows.$shadow-elevation-3` for the three design-system elevation levels.

| Elevation | Token                         | Value                                                                         |
| --------- | ----------------------------- | ----------------------------------------------------------------------------- |
| 1         | `shadows.$shadow-elevation-1` | `0 0 15px 0 rgba(51, 51, 51, 0.15)`                                           |
| 2         | `shadows.$shadow-elevation-2` | `0 0 15px 0 rgba(51, 51, 51, 0.30)`                                           |
| 3         | `shadows.$shadow-elevation-3` | `0 15px 30px -10px rgba(51, 51, 51, 0.30), 0 0 15px 0 rgba(51, 51, 51, 0.15)` |

### 2. Use `root.shadow-root` for Ionic color mapping

When wrapping Ionic components, include the shared Ionic token mapping on the host:

```scss
@use 'foundations/root' as root;

:host {
  @include root.shadow-root;
}
```

This allows Ionic components inside the shadow root to resolve the expected color tokens.

### 3. Use Ionic APIs before deep styling

When wrapping `ion-button`, `ion-input`, and similar components, prefer:

- `[color]`
- `[fill]`
- `[size]`
- CSS custom properties supported by the Ionic component
- `::part(...)` when Ionic explicitly exposes a part

Avoid depending on internal Ionic implementation details that are not part of the public API.

## Shadow DOM boundaries

`ShadowDom` protects the component from consumer overrides, but it also imposes boundaries.

Inside `ui-button.scss`, you can style:

- `:host`
- the `ion-button` element declared in your template
- slotted nodes that you pass into the wrapped component
- exposed `::part(...)` targets

You cannot style arbitrary internal nodes inside Ionic shadow DOM unless Ionic exposes them through `part`.

Example:

- valid: `ion-button::part(native) { ... }`
- valid: `ion-button > [slot='start'] { ... }`
- invalid: `ion-button::part(native) .button-inner { ... }`

## Slots

When an Ionic component contains named slots such as `start` or `end`, you usually cannot style the internal `<slot>` element itself.

Instead, style the node assigned to that slot:

```scss
ion-button > [slot='start'] {
  margin-inline-end: #{sizes.$size-80};
}

ion-button > [slot='end'] {
  margin-inline-start: #{sizes.$size-80};
}
```

This is the preferred way to control spacing for projected icons and slot content.

## Global styles vs component styles

### Component styles

Keep component-specific styles inside the component SCSS file.

Examples:

- padding
- border radius
- button label typography
- slot spacing
- width when `expand` is enabled

### Global styles

Keep only document-level rules in `foundations/base.scss`.

Examples:

- `html { font-size: 16px; }`
- `body { font-size: 1rem; }`

These global rules must be imported explicitly by the consumer app.

## Consumer responsibilities

Consumers should:

- import the standalone component they need
- install `source-sans` so the design system font can be imported correctly:

  ```bash
  npm install source-sans
  ```

- import `@bepower/ui-kit/base` in their global SCSS
- place `@use '@bepower/ui-kit/base';` after Ionic global `@use` statements when they want UI kit global rules to win over Ionic defaults

## Checklist for a new UI element

Before publishing a new component, check that:

- it is standalone
- it uses `ShadowDom`
- it uses `OnPush`
- it imports only the Ionic primitives it needs
- it consumes shared foundations
- it maps design system variants to Ionic public APIs where possible
- it does not rely on unsupported deep selectors inside Ionic shadow DOM
- it exposes only intentional inputs
- it builds successfully with `ng build ui-kit`

## Current reference implementation

The current reference for this approach is `ui-button`:

- `src/lib/components/button/ui-button.ts`
- `src/lib/components/button/ui-button.scss`

Use it as the starting point for future components, but keep the guide as the source of truth when refining the pattern.

# Importing Icons

The icon source files must be placed in the repository root folder `icons/`. Import them with:

```bash
npm run icons:import
```

The command uses only `icons/` as its source; it does not accept another directory.

## Synchronization

Every import is a full synchronization, not an incremental update. Add, modify, or remove SVGs only in `icons/`, then run the command. It replaces all generated `icon/assets` files and regenerates both `icon-map.ts` and `icon-map.interface.ts` from the current contents of `icons/`.

An icon removed from `icons/` is therefore removed from the generated assets, `iconMap`, and `IconName` at the next import. If any input filename is invalid, the import stops before replacing generated files.

## File Names

Use lowercase kebab-case for the icon name and one of these exact suffixes:

```text
<icon-name>_fill.svg
<icon-name>_no-fill.svg
```

For example:

```text
arrow_fill.svg
arrow_no-fill.svg
arrow-left_no-fill.svg
payment-card_fill.svg
```

The suffix determines the variant exposed by `ui-icon`. When both files are provided, they are grouped under one name:

```html
<ui-icon name="arrow" fill="fill" />
<ui-icon name="arrow" fill="no-fill" />
```

An icon may provide only one variant. Do not use spaces, uppercase letters, underscores in the icon name, or additional suffixes: invalid SVG names stop the import before any generated file is changed.

## Color Handling

During import, every SVG `fill` except `fill="none"` is rewritten to `fill="currentColor"`. This lets `ui-icon` control the color while preserving outline paths that must remain unfilled. Strokes and all other SVG attributes are left unchanged.

## Review And Build

Validate an import without modifying files:

```bash
npm run icons:import -- --dry-run
```

After a successful import, build the library so the package distribution contains the new assets:

```bash
npm run build
```

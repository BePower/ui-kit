# Importing Pictograms

Place source SVG files in the repository root folder `pictograms/`, then import them with:

```bash
npm run pictograms:import
```

The command performs a full synchronization. It replaces generated `pictogram/pictograms/*.ts` modules and regenerates `pictogram-map.ts`, `pictogram-map.interface.ts`, and `src/lib/interfaces/pictogram.interface.ts`.

## File names

Use lowercase kebab-case with no variant suffix:

```text
<pictogram-name>.svg
```

Examples:

```text
wallet.svg
empty-state.svg
payment-success.svg
```

Spaces, uppercase letters, underscores, and files other than SVG are not accepted as pictogram sources.

## Color handling

The importer preserves SVG contents and colors. Unlike the icon importer, it does not rewrite `fill` attributes to `currentColor`.

Each generated module is loaded dynamically by `ui-pictogram`, so consumers do not need to copy assets in `angular.json`.

## Validation

Validate source files without changing generated output:

```bash
npm run pictograms:import -- --dry-run
```

After a successful import, run the component checks and build the library.

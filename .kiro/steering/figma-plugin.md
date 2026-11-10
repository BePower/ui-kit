---
inclusion: fileMatch
fileMatchPattern: '{figma-plugin/**,scripts/*figma*}'
name: figma-plugin
description: Rules for the Figma DS-generation plugin and its build/inventory scripts
---

# Figma plugin — native library generation (bepower-ui-kit)

I load these rules only when I touch the plugin or its build scripts. The general mandate lives
in `ds-orchestrator.md`.

## Principle: the sources are the single source of truth

`scripts/build-figma-plugin.mjs` + `scripts/figma-inventory.mjs` **derive** everything from the
library sources, not from parallel lists:

- **Color/numeric tokens**: evaluated by Sass via `meta.module-variables` on `foundations/colors`,
  `foundations/sizes`, `foundations/spacing`. `rem` values are converted to px (`* 16`).
- **Typography**: every `@mixin` of `foundations/typography.scss` is compiled to extract size,
  line-height, weight, underline, uppercase.
- **Button mapping**: read from `ui-button.scss`; `required()` **throws** if the pattern no longer
  matches. If I touch the button SCSS and change those property names, I update the pattern.
- **Component inputs**: extracted via the TypeScript type checker from the barrel
  `components/index.ts` (only `input()` / `input.required`, with literal unions as `values`).
- **Icons/pictograms**: from `icon-map.ts` + SVGs in `icons/` and from the `values` of
  `pictogram.name` + SVGs in `pictograms/`. Guards: if the registry and the sources diverge the
  build **fails** asking for `npm run icons:import` / `npm run pictograms:import`.

**Operational consequence**: I do not add data by hand into the bundle. To expose a new
token/variant in Figma, I add it to the **source** (foundations, component input, registry) and
regenerate.

## Build and artifacts

- Build from the workspace root: `node scripts/build-figma-plugin.mjs`. It writes
  `figma-plugin/dist/` (`code.js`, `manifest.json`, `build-info.json`, `tokens.json`).
- `figma-plugin/dist/` is **gitignored**: changing only the sources does not regenerate the bundle.
- Transpile target **ES2017** (Figma sandbox): no optional chaining/object spread in the
  distributed bundle. `status.html` is versioned and contains the marker `/* TOKENS */`.
- Manifest: `id` from `FIGMA_PLUGIN_ID` (default placeholder `bepower-ui-kit-repository-pilot`),
  `networkAccess.allowedDomains: ['none']`. For internal org publishing Figma assigns its own id;
  the pilot masters are not in production use, so moving to the assigned id needs no in-place
  migration. Once Figma assigns the real id, set it as the default. On an already-populated
  **production** library the id still binds the node data — I would not change it there without
  design-lead sign-off. See `figma-plugin/PUBLISHING.md`.

## Non-negotiable rules

- I do not remove pages/masters/variables to "update": it would break the instance links.
  The generator updates in place (expected: "656 updated, 0 created" with the catalog unchanged).
- I do not edit `figma-plugin/dist` by hand: it is generated output. I edit the sources
  (`components.js`, `composition.js`, `catalog.js`, `plugin.js`, `status.html`) and regenerate.
- Declared font: family from `foundations/base.scss` (`--ion-font-family`); the plugin does not
  use substitute fonts. If it is missing, the build throws.
- `figma-plugin/plugin.test.mjs` covers the generator: I run it after changes to the plugin.
- Library publishing in Figma: manual, designer-side. I indicate the procedure, I do not run it.

## Direction of the flow

Repo -> Figma (the plugin generates Figma natives from the sources). The plugin does **not** read
the Code Layer and does **not** modify the Angular components. The Figma -> component direction is
orchestration, not a plugin task.

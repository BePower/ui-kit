---
name: regenerate-figma-plugin
description: Regenerate the bepower-ui-kit Figma plugin bundle from the library sources and indicate the designer-side import/publishing procedure. Load this skill when you must realign Figma after a change to the sources (new component/variant/token), when you modify the plugin or its scripts, or when the design-to-code flow calls for the "repo → Figma" step.
---

# Figma plugin regeneration (repo → Figma)

Direction of the flow: **repo → Figma**. The plugin generates **native Figma elements from the
sources** of the library; it does not read the Code Layer and does **not** modify the Angular
components. The `figma-to-component` skill covers the reverse direction. The plugin's detailed
rules live in the steering `figma-plugin.md` (activates on `{figma-plugin/**,scripts/*figma*}`)
and in `figma-plugin/README.md`: this skill is the operational procedure.

## Principle: the sources are the single source of truth

`scripts/build-figma-plugin.mjs` + `scripts/figma-inventory.mjs` **derive** everything from the
sources:

- **Color/numeric tokens** evaluated by Sass (`meta.module-variables` on
  `foundations/{colors,sizes,spacing}`); `rem` → px (`* 16`).
- **Typography**: every `@mixin` of `foundations/typography.scss` compiled for size/line-height/
  weight/underline/uppercase.
- **Button mapping** read from `ui-button.scss` (the pattern **throws** if it no longer matches:
  if you change those property names in the SCSS, update the pattern).
- **Component inputs** extracted via the TypeScript type checker from the barrel
  `components/index.ts` (only `input()` / `input.required`, literal unions as `values`).
- **Icons/pictograms** from `icon-map.ts` + `icons/*.svg` and from `pictogram-map.ts` +
  `pictograms/*.svg`.

**Operational consequence**: do NOT add data by hand into the bundle. To expose a new
token/variant in Figma, add it to the **source** (foundations, component input, registry) and
regenerate.

## 1. Pre-check

- If you changed icons/pictograms, first align the registries: `npm run icons:import` /
  `npm run pictograms:import` (from the root). The plugin build **fails** if the registry and the
  SVGs diverge — it is a guard, not an error to work around.
- Make sure `npm ci` has been run (the build uses `sass` and `typescript`).

## 2. Build the bundle (from the workspace ROOT)

```bash
node scripts/build-figma-plugin.mjs
```

It writes `figma-plugin/dist/`: `code.js`, `manifest.json`, `build-info.json`, `tokens.json`. The
terminal prints **BePower build `<id>`** (same id in `dist/build-info.json`). Notes:

- `figma-plugin/dist/` is **gitignored**: changing only the sources does not regenerate the
  bundle; the command must be re-run.
- Transpile target **ES2017** (Figma sandbox): no optional chaining / object spread in the bundle.
- `figma-plugin/status.html` is versioned (contains the marker `/* TOKENS */`); `dist/` is
  regenerable and must not be edited by hand or versioned.

## 3. Test the generator (after changes to the plugin)

```bash
node --test figma-plugin/plugin.test.mjs
```

It verifies inventory, coverage, variants, basic icon geometry, two consecutive runs, absence of
duplicates, preservation of masters/Label property/content outside the boards. It does not replace
the real visual verification in Figma Desktop.

## 4. What NOT to do (non-negotiable rules)

- **Do not edit `figma-plugin/dist` by hand**: it is generated output. Edit the sources
  (`components.js`, `composition.js`, `catalog.js`, `plugin.js`, `status.html`) and regenerate.
- **Do not change the manifest `id`** (`1701629443273972387`): Figma assigned it to the
  internally published "Plenitude On The Road Design System" plugin. Existing node data and future
  updates bind to this id. `networkAccess.allowedDomains: ['none']` stays unchanged.
- **Do not remove pages/masters/variables** to "update": it would break the instance links. The
  generator updates in place.
- Font: family from `foundations/base.scss` (`--ion-font-family`, Source Sans 3); the plugin does
  not use substitute fonts — if it is missing, the build throws.

## 5. Delivery model

The plugin is published internally to the Figma organization as
**Plenitude On The Road Design System** (`id: 1701629443273972387`). The default build emits that
same id and the version read from `projects/ui-kit/package.json`; `FIGMA_PLUGIN_ID` and
`FIGMA_PLUGIN_NAME` remain optional overrides for an explicitly different target.

- **PR verification**: CI builds `figma-plugin/dist/` and uploads it as a downloadable artifact for
  the designer to test before approval.
- **Org-published release**: an org admin publishes the approved bundle from Figma Desktop. The
  plugin then appears in the organization Plugins/Tools list without a filesystem import or
  Community review. See `figma-plugin/PUBLISHING.md`.

**On the id**: the org-published plugin uses the id Figma assigns (`FIGMA_PLUGIN_ID`). The pilot
masters are not in production use, so moving to the assigned id needs no in-place migration — the
catalog may be regenerated from scratch on the org library file. Once Figma assigns the real id,
set it as the default in `scripts/build-figma-plugin.mjs`.

## 6. Designer-side procedure (I INDICATE it, I do not run it)

Import and publishing happen in Figma Desktop, designer-side (see `figma-plugin/README.md` for
local import, `figma-plugin/PUBLISHING.md` for internal org publishing):

1. Figma Desktop, library file, **Design** mode (not Dev Mode), edit permissions.
2. Source Sans 3 Regular + SemiBold available in Figma.
3. Plugins → Development → Import plugin from manifest → `figma-plugin/dist/manifest.json`.
4. Run **BePower UI Kit · repository pilot**; the update window stays open and shows the counts.
5. **Expected with the catalog unchanged: "656 updated, 0 created"**. A new component/variant in
   the sources legitimately increases the "created".
6. Verify samples, variable links and text styles, then **publish the library manually**. Publishing
   depends on plan and permissions: I indicate the procedure, I do not run it.

## Checklist

- [ ] Icon/pictogram registries aligned (`icons:import` / `pictograms:import`) if touched.
- [ ] `node scripts/build-figma-plugin.mjs` run from the root; build id noted.
- [ ] `node --test figma-plugin/plugin.test.mjs` green (if I modified the plugin).
- [ ] `dist/` not edited by hand; manifest id unchanged.
- [ ] Import/publishing procedure indicated to the designer with the expected counts.

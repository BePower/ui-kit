---
inclusion: fileMatch
fileMatchPattern: '{figma-plugin/**,scripts/*figma*,.github/workflows/build-figma-plugin.yml}'
name: figma-plugin
description: Preservation, layout, testing and deployment rules for the native Figma generator
---

# Figma plugin — native library generation

These rules cover the generator, build/inventory scripts and its CI workflow. Use
[regenerate-figma-plugin](../skills/regenerate-figma-plugin/SKILL.md) for the execution procedure.
Repository paths below are relative to the workspace root.

## Sources and generated output

- `scripts/figma-inventory.mjs` reads Angular input types through the TypeScript checker,
  evaluates Sass and checks SVG registries. `components.js` and `composition.js` are explicit
  visual adapters: extracting an input does not automatically implement it in Figma.
- Reuse foundations and the existing Angular contract. If `top`/`bottom` already exist in
  `UIRow`, fix the adapter rather than adding a second API or a parallel list of spacing values.
- Edit sources, never `figma-plugin/dist/`. The ES2017 build emits `code.js`, `ui.html`,
  `manifest.json`, `build-info.json` and `tokens.json`. `status.html` supplies the HTML and
  contains the `/* TOKENS */` marker. The published UI file matches the embedded `STATUS_HTML`.
- The default published plugin id is `1701629443273972387`; the default name is
  `Plenitude On The Road Design System`, suffixed with the library package version.
  `FIGMA_PLUGIN_ID` / `FIGMA_PLUGIN_NAME` are overrides for an explicitly different target.
  Do not change the identity of the plugin used by an existing library as a repair strategy.
- Version comes from `projects/ui-kit/package.json`. The build id is a truncated SHA-256 of
  the compiled plugin body, not the Git commit, package version or entire artifact archive.
  A metadata-only manifest change need not change that hash; consider this when changing deploy logic.
- The font family comes from `foundations/base.scss`. Missing configuration fails the build;
  unavailable Regular/SemiBold fonts fail the Figma run before document updates. Do not substitute fonts.

## Preserve libraries and consumer mockups

Existing masters are in use. Preserve master, component-set, slot-node and property identities;
never assume a pilot can be deleted or regenerated from scratch.

- Update existing variants **inside their current set**. Do not extract them all to a staging
  page: empty sets are unsupported, and the old set reference can become invalid. The previous
  Radio Card loop caused `insertChild: node ... does not exist` on a subsequent update.
- For a genuinely new set, group fresh components on the destination page once with
  `combineAsVariants`. It already inserts its children. For an existing set, insert only missing
  children; move the complete set between catalog pages rather than emptying it.
- Preserve case-sensitive variant axes and source identifiers. Different Radio Card content
  hierarchies currently use separate sets on `_RadioCard`; preserve those sets and their properties.
- An existing `slotContentId` binding is authoritative even when its property was renamed.
  New variants reuse the corresponding slot binding by its stable role. An invalid binding must
  stop the update with a diagnostic, not be silently replaced.
- Do not rewrite unchanged slot definitions. Do not reseed existing slots, restore intentionally
  removed defaults, recreate placeholders, swap existing projected components or resize their
  authored contents merely to refresh the generator. Layout updates belong to the container.
- Do not remove/reparent slot contents as a general repair. Any necessary legacy migration must
  preserve identity and have a regression case; repeated runs must not repeat the migration.
- `catalog.js` rebuilds tagged documentation boards. Personal mockups belong outside those
  boards, but being outside them alone does **not** prove immunity to propagated master changes.
  Never infer preservation of consumer overrides from a successful local mock test.

## Layout contracts learned from real failures

- `minWidth = null` removes the constraint. Figma rejects `minWidth = 0`; the test double must
  enforce the runtime constraint rather than accepting arbitrary JavaScript properties.
- `UIRow` keeps vertical layout, fixed/fill horizontal sizing and hugging height across
  `gap/top/bottom` variants. Its `Columns` slot owns horizontal layout and wrapping. Vertical
  padding must grow height without changing width or escaping `UIGrid`.
- Radio Card copy fills the remaining horizontal space and hugs wrapped text vertically.
  Verify one-column rows, narrow grids, long text and a variant switch with nonzero bottom padding.
- Text-button masters hug labels; expanded footer instances fill available width. Center the label
  and reset legacy stretch/grow settings. Hidden custom-content slots must not offset the label.
  Test a longer label such as “Scopri di più”, not only the default label.
- Keep stable IDs when changing layout. Do not detach or rebuild a consumer instance to make a
  screenshot look correct.

## Verification and incident handling

- Run `node --test figma-plugin/plugin.test.mjs` after generator changes. It builds the bundle
  and tests a simulated Plugin API. Add regression coverage for the actual failure, including
  API restrictions, empty-set invalidation, unchanged slot bindings and repeated updates.
- Compare IDs, keys, counts or booleans instead of asserting equality between a cyclic document
  node and `null`: formatting a failing assertion can exhaust memory and hide the real failure.
  Investigate `SIGKILL`/OOM; do not fix it by weakening assertions or merely raising memory limits.
- Avoid fixed totals of masters/build hashes in instructions. New coverage legitimately adds
  masters. An unchanged catalog rerun should create none and preserve existing identities.
- Real acceptance for structural changes: on a **copy of an existing library/mockup file**, keep
  a personal page with Page → Grid → two Rows → Col → Radio Card, custom text and slot contents.
  Change bottom padding, switch variants and run the update twice. Check content, order, IDs,
  sizing, clipping and text wrapping. A fresh empty file cannot validate this migration.
- If MCP/native access is unavailable, continue code/tests using supplied evidence and explicitly
  report native validation as outstanding. Do not claim the observed reset is fixed from mock tests.
- For a runtime error, record build id, phase, operation and node id. Reproduce the lifecycle in
  the test double when possible, and distinguish a demonstrated bug from a suspected cause.
  A failed run may leave partial changes: do not blindly retry or delete/recreate assets. Inspect
  a copy or use an existing file version to recover; code changes cannot recover lost user content.

## CI and publishing boundaries

`.github/workflows/build-figma-plugin.yml` is the executable source for deployment behavior:

- PRs build/test/upload artifacts. Eligible same-repository PRs automatically publish the plugin;
  forks and Dependabot skip comments/deploy. Manual deployment is opt-in on `main`.
- `figcd@0.0.16` requires both `manifest.main` and `manifest.ui` files, even though Figma permits
  embedded UI. Validate both before calling the publisher. The secret is `FIGMA_WEB_AUTHN_TOKEN`.
- Inside the shared publication concurrency group, compare the build id with the **latest
  successful** recorded deployment for that plugin, not any historic matching hash. Record success
  only after publishing succeeds; failures remain retryable. First use without a record publishes.
- The GitHub deployment record tracks this workflow, not out-of-band Figma publications. Preserve
  the explicit skip summary, cross-branch serialization and `deployments: write` permission.
- Publishing the plugin, executing it in a file, and publishing the generated **design library**
  are different actions. A green deploy does not validate a mockup or publish library changes.
  Do not trigger external publication merely to verify a local fix.
- `figma-plugin/PUBLISHING.md` still describes the historical manual-only pilot flow. Do not use
  those claims to override the current workflow or to justify destructive regeneration.

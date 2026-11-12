---
inclusion: fileMatch
fileMatchPattern: '{figma-plugin/**,scripts/*figma*,.github/workflows/build-figma-plugin.yml}'
name: figma-plugin
description: Native Figma generator preservation, layout, runtime and deployment invariants
---

# Figma generator invariants

## Sources and identity

- `scripts/figma-inventory.mjs` extracts Angular types, Sass and SVG registries; explicit
  `components.js`/`composition.js` adapters implement native behavior. Reuse Angular contracts and
  foundation values (`UIRow.top/bottom`, for example), not parallel APIs/token lists.
- Edit sources, not `figma-plugin/dist/`. ES2017 output: `code.js`, `ui.html`, `manifest.json`,
  `build-info.json`, `tokens.json`. Source `status.html` needs `/* TOKENS */`; published HTML must
  match embedded `STATUS_HTML`.
- Preserve plugin id `1701629443273972387`; default name `Plenitude On The Road Design System`
  includes the version from `projects/ui-kit/package.json`. `FIGMA_PLUGIN_ID`/`FIGMA_PLUGIN_NAME`
  overrides require an explicitly different target, never an identity-changing repair.
- Build id is truncated SHA-256 of compiled plugin body, not commit/version/archive. Manifest-only
  metadata changes may leave it unchanged. Font family comes from `foundations/base.scss`:
  missing configuration fails build; unavailable Regular/SemiBold fonts fail before document updates.

## Preserve existing libraries

Masters are already in use. Preserve master/set/slot/property identities:

- Update variants **inside existing sets**. Extracting all children can invalidate the empty set
  and cause `insertChild: node ... does not exist` (observed Radio Card failure). Insert only missing
  variants. Move whole sets between pages; for new sets, `combineAsVariants` inserts fresh children
  itself, once, on the destination page.
- Preserve case-sensitive axes/source IDs and separate Radio Card hierarchy sets on `_RadioCard`.
- Existing `slotContentId` bindings remain authoritative after property renames. New variants reuse
  bindings by stable role; invalid existing bindings stop with diagnostics, never silent replacement.
- Do not rewrite unchanged slots, reseed defaults, restore intentionally removed placeholders,
  swap projected components or resize authored content. Update container layout. Slot removal or
  reparenting requires an identity-preserving, idempotent migration and regression coverage.
- `catalog.js` rebuilds tagged docs; personal pages outside them can still lose overrides through
  master updates. Mock success does not prove preservation. Never detach/rebuild consumer instances
  to fix appearance or assume a pilot library is disposable.

## Layout regressions

- Unset `minWidth` with `null`; Figma rejects `0`. Enforce this in the test double.
- Rows: vertical, fixed/fill width, hug height across `gap/top/bottom`. `Columns` owns horizontal
  layout/wrapping. Vertical padding must not widen rows beyond Grid. Radio Card copy fills remaining
  width and hugs wrapped text; exercise narrow grids, one column, long copy and bottom-padding switches.
- Text-button masters hug labels; expanded footers fill width. Center labels, reset legacy
  stretch/grow and prevent hidden custom slots from offsetting text. Test “Scopri di più”.

## Evidence and incidents

- Mock regressions must model actual API restrictions, empty-set invalidation, stable slot bindings
  and repeat updates. An unchanged rerun creates no masters; avoid hardcoded totals/build hashes.
- Assert IDs/keys/counts/booleans, not cyclic nodes against `null`: formatting failures can OOM.
  Investigate SIGKILL instead of weakening assertions or merely increasing memory.
- Native structural acceptance uses a **copy of an existing file**, personal page with
  Page → Grid → two Rows → Col → Radio Card and custom text/slots. Switch bottom padding/variants,
  update twice, inspect content/order/IDs/sizing/clipping/wrapping. Empty-file tests cannot validate
  migration. Without native access, explicitly leave preservation/rendering validation outstanding.
- Record build, phase, operation and node ID; distinguish proven defects from hypotheses. Failed
  runs may leave partial changes: no blind retries or asset deletion. Inspect a copy or recover
  from a previous file version; code fixes cannot restore already-lost user content.

## Deployment

The current `.github/workflows/build-figma-plugin.yml` overrides historical manual-only pilot
claims in `figma-plugin/PUBLISHING.md`:

- PRs build/test/upload; eligible internal PRs auto-publish. Forks/Dependabot skip comments/deploy;
  manual deploy is opt-in on `main`.
- Pinned `figcd@0.0.16` needs files for both `manifest.main` and `manifest.ui`, despite Figma allowing
  embedded UI. Validate both; secret: `FIGMA_WEB_AUTHN_TOKEN`.
- Within shared cross-branch publication concurrency, compare against the **latest successful**
  deployment for that plugin, not any historical matching hash. First recordless run publishes;
  record only success so failures remain retryable. Preserve skip summaries and `deployments: write`.
  Records cannot track out-of-band publishing.
- Plugin publication, execution in a file and design-library publication are separate operations.
  Green deployment does not validate mockups; do not publish externally merely for local testing.

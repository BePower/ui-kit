---
name: regenerate-figma-plugin
description: Build, troubleshoot and validate the repository-to-Figma generator and its deployment workflow. Use for plugin adapters, native component updates, slot preservation, build artifacts or publishing failures; not for implementing Angular code from a Figma design.
---

# Regenerate and validate the Figma plugin

The repository is the source of truth for the native Figma generator. Read
[the plugin steering](../../steering/figma-plugin.md) before changing its adapters, build scripts
or workflow. That file owns the preservation, runtime and deployment invariants; do not duplicate
an outdated procedure here. Paths below are relative to the workspace root.

## Inspect and scope

1. Inspect `git status --short`, the affected source, tests and runtime error/screenshot.
   Preserve staged and unrelated changes. For Angular library edits also read
   `projects/ui-kit/AGENTS.md` and the relevant component documentation.
2. Distinguish Angular source changes, missing adapter coverage, build/publisher failures and
   Figma runtime failures. The inventory discovers inputs; an adapter still implements layout.
3. Read `scripts/build-figma-plugin.mjs`, the relevant adapter and
   `.github/workflows/build-figma-plugin.yml` when those contracts are involved.
4. Use available Figma tools only if connected and applicable, following their required skills.
   Without access, use repository evidence and supplied screenshots; do not imply native inspection.

## Build and local checks

Install dependencies only if needed, using the root lockfile and `.nvmrc`. If SVG sources changed,
run the appropriate `npm run icons:import` or `npm run pictograms:import` and inspect the diff.

For generator changes, run from the workspace root:

```bash
node --test figma-plugin/plugin.test.mjs
```

The suite invokes the build. For a build-only request or after a subsequent source edit:

```bash
node scripts/build-figma-plugin.mjs
```

Check `figma-plugin/dist/build-info.json` and the manifest. The generated directory must contain
`code.js`, `ui.html`, `manifest.json`, `build-info.json` and `tokens.json`. Preserve the published
id `1701629443273972387` unless a different target is explicitly requested. Never hand-edit `dist`.
Run formatting on changed files and `git diff --check`.

For workflow changes, validate YAML, shell/JavaScript syntax and affected decision paths using
mocked APIs: initial publication, equal/different hashes, latest-success selection, pagination and
failed-deploy retry. For publisher compatibility, exercise the pinned publisher with network calls
mocked when possible. Local checks must not send a real release to Figma.

## Native regression and preservation

Use a copy of an **existing** file for structural migrations. Check a personal page outside
regenerated documentation boards with nested Page/Grid/Rows/Cols, Radio Cards and custom slot
contents. Run twice, switch row padding variants and verify content, identities and layout.
Also check footer text centering and long button labels. Do not delete components or reset
instances to make the test pass.

If a user reports lost content, distinguish document-board reconstruction from propagated master
updates. A passing mock test is insufficient: it does not implement Figma's override propagation
or layout engine. Add a focused regression for observed API/lifecycle behavior; report what remains
unverified. Do not promise recovery of content absent from the current file.

## Delivery and handoff

- Local development: import `figma-plugin/dist/manifest.json` in Figma Desktop, Design mode, with
  edit access and Source Sans 3 Regular/SemiBold. Run the plugin named in the generated manifest,
  and match the status panel's build id to `build-info.json`.
- CI: eligible internal PRs publish via `figcd`; an unchanged hash skips publication according to
  the latest successful GitHub deployment record. Manual dispatch deploys only on `main` when
  selected. A push can therefore publish the plugin before PR merge; respect the authorized scope.
- A published plugin still has to be executed in the intended file. Publishing the generated
  design library to consumers remains a separate operation, not a consequence of the plugin build.
- Do not bump the package for every rebuild. Version changes must be authorized; if required for
  a PR, reuse its existing bump rather than bumping for each follow-up fix.

Report changed behavior, actual build id, tests performed, whether a deployment was run or skipped,
and whether native verification was completed. Say explicitly when a fix is supported only by local
checks. Do not hardcode a supposedly universal number of masters or claim a green deployment
certifies preservation of mockups.

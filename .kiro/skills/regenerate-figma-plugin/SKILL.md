---
name: regenerate-figma-plugin
description: Build, troubleshoot and validate the repository-to-Figma plugin, adapters, native updates and deployment workflow; not Figma-to-Angular implementation.
---

# Regenerate the Figma plugin

Read [plugin invariants](../../steering/figma-plugin.md) first: that file owns identity, slot
preservation, layout, native acceptance and deployment rules. Paths below start at workspace root.

1. Inspect status, affected source/tests and reported evidence; preserve existing changes.
   Distinguish Angular contract, adapter, build/publisher and native lifecycle failures. Read
   [library rules](../../../projects/ui-kit/AGENTS.md) for Angular edits; inspect build scripts or
   workflow when affected. Use connected Figma tools only with their required skills.
2. Install dependencies only if needed, using `.nvmrc` and root lockfile. Changed SVG sources may
   require `npm run icons:import` or `npm run pictograms:import`; inspect generated diffs.
3. Run `node --test figma-plugin/plugin.test.mjs` from workspace root: it builds the bundle and
   tests a simulated API. For build-only delivery, use `node scripts/build-figma-plugin.mjs`;
   source changes after tests require revalidation. Inspect manifest, build-info and required
   artifacts against the steering. Format touched files and run `git diff --check`.
4. For workflow edits, validate YAML, shell/JS and mocked decisions: initial publish, equal/different
   hashes, latest-success selection, pagination and failed-deploy retry. Exercise pinned publisher
   compatibility with mocked network calls where possible; no real release for local verification.
5. Perform the steering's native acceptance on a copy of an existing file when access exists.
   For lost content, distinguish regenerated docs from propagated master changes. Local tests do
   not simulate Figma override propagation/layout; report native checks outstanding if unavailable.

For local delivery, import `figma-plugin/dist/manifest.json` in Figma Desktop Design mode with edit
access and configured fonts (currently Source Sans 3 Regular/SemiBold). Match the plugin status
build id to `build-info.json`. Executing the plugin and publishing its design library are separate.
Internal PR pushes can publish before merge; respect authorized scope. Version bumps require
release authorization and happen once per PR, not once per rebuild.

Report behavior changed, actual build id, checks performed, deployment run/skipped/not attempted
and native validation status. Do not claim local tests certify preservation of consumer mockups.

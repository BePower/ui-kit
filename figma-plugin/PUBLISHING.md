# Publishing the plugin internally to the organization

This guide covers publishing the BePower UI Kit plugin **internally to the Figma
organization**, so designers open it from the Plugins/Tools list without importing a
manifest from the local filesystem. It complements `README.md` (the Development/local
import flow, which stays valid).

**Who runs this:** a Figma **organization admin**. Publishing is a human action in Figma
Desktop; it cannot be automated from CI or from this repo. The repo only prepares the
bundle; the admin publishes it.

Internal org plugins are available to every member of the organization and **do not go
through Figma's plugin review** (unlike the public Community, which does). Source: Figma
Learn, "Create internal plugins for an organization".

## The plugin id

Figma assigns its **own id** when you create a publishable plugin. The org-published
plugin uses that assigned id. The build reads two optional env vars:

- `FIGMA_PLUGIN_ID` — the id Figma assigns to the publishable plugin.
- `FIGMA_PLUGIN_NAME` — optional display name override.

The previous pilot id (`bepower-ui-kit-repository-pilot`) is a placeholder only; the pilot
masters are **not in production use**, so switching to the Figma-assigned id needs **no
in-place migration** — the plugin may regenerate the catalog on the organization's library
file from scratch. Once Figma assigns the real id, set it as the default in
`scripts/build-figma-plugin.mjs` so plain `node scripts/build-figma-plugin.mjs` emits it.

## Procedure (organization admin, in Figma Desktop)

1. In Figma Desktop (Design mode), create the publishable plugin: Plugins → Development →
   **New plugin** → "Create new plugin", which gives you a Figma-assigned `manifest.id`.
   Note that id.
2. From the workspace root, build the publish bundle with that id:

   ```bash
   FIGMA_PLUGIN_ID='<figma-assigned-id>' node scripts/build-figma-plugin.mjs
   ```

   This writes `figma-plugin/dist/` with the published id in `manifest.json`. (`dist/` is
   gitignored and regenerable, as always.)

3. Import that manifest once in Figma Desktop (Plugins → Development → Import plugin from
   manifest → `figma-plugin/dist/manifest.json`).
4. Validate: run the plugin and confirm the catalog generates correctly. The pilot masters
   are not in production use, so a from-scratch catalog generation on the org library file
   is acceptable; no in-place master migration is required.
5. Publish internally: Plugins → **Publish**, and set **Publish to** → your organization
   (not Community). An org admin is required; internal publishing needs no Figma review.
6. Designers find it in the Plugins/Tools list by filtering the source to your
   organization. Updates: repeat the build with the same `FIGMA_PLUGIN_ID` and publish a
   new version (same id, creator or approved-publisher account).

## What stays manual / out of scope

- **The library publishing in Figma** (making the generated masters available as a
  library to consuming files) remains a separate manual step, as in `README.md`.
- This repo does not publish the plugin and does not change the production library's
  plugin id on its own.

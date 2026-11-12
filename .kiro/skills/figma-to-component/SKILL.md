---
name: figma-to-component
description: Implement Figma designs or change public Angular/Ionic components in @bepower/ui-kit, including API, stories, docs and exports.
---

# Figma → component

1. Read [library rules](../../../projects/ui-kit/AGENTS.md) and their referenced docs, then inspect
   status, affected implementation, tests and stories. They own component conventions and commands;
   do not duplicate those rules here.
2. For Figma input, load the required design-to-code skill before fetching design context,
   metadata, variables and screenshots. Map design tokens to existing foundations. If native access
   is unavailable, use supplied specifications/screenshots and identify what remains unverified.
3. Resolve missing public-contract decisions: inputs/defaults, outputs, slots, exported types and
   accessibility. Express DS intent, not arbitrary styling controls. Ask only about unresolved or
   breaking choices; existing task authorization is sufficient.
4. Update the component TS/SCSS/spec, `stories/ui-<name>.stories.ts`, component documentation and
   appropriate barrels/`src/public-api.ts`. New components also require library README/UI Elements
   Guide updates. Paths are relative to `projects/ui-kit`.
5. Apply [accessibility checks](../a11y-checklist/SKILL.md) and, for shared behavior/refactors,
   [code-quality guidance](../../steering/code-quality.md). Preserve public Angular/Ionic behavior;
   the radio-group base is a reference, not a mandatory inheritance pattern.
6. Follow AGENTS verification: focused regressions, full coverage/typecheck for runtime changes,
   package compilation for component/API/Sass changes, Storybook build for stories/configuration.
   Review formatting and diff; report only performed checks and consumer impact.

## Figma alignment when requested

Barrel/inventory extraction does not implement native Figma support. Add explicit generator
adapters for supported new contracts; build success alone does not detect every missing adapter.
Use [regenerate-figma-plugin](../regenerate-figma-plugin/SKILL.md) and its tests when that scope is
requested. Optional Angular content need not become Figma variant axes: incompatible content
hierarchies may require separate sets, preserving existing identities.

Use [prepare-pull-request](../prepare-pull-request/SKILL.md) for requested PR work. Ordinary
implementation does not require pushing or writing to Figma; internal PR pushes can auto-publish.

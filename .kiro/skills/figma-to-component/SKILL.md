---
name: figma-to-component
description: bepower-ui-kit design-to-code flow — convert a Figma node/component defined by tech lead + design lead into a reusable Angular/Ionic component of @bepower/ui-kit (public API, component + SCSS + spec, story, docs, export, PR). Load this skill when you are handed a Figma node to convert or when you must add/modify a public component of the kit.
---

# Figma → component (@bepower/ui-kit)

The orchestrator's procedure for the **Figma → code** direction. The `@bepower/ui-kit` repo is the
source of truth; this skill covers converting a decision made in Figma (tech lead + design lead)
into a reusable component. The library implementation rules live in `projects/ui-kit/AGENTS.md`
(read it: this skill does NOT duplicate it, it presupposes it).

`ui-button` is the reference implementation: copy the relevant patterns, not unrelated behavior.

## 0. Prerequisites (before touching code)

Read, in this order:

1. `projects/ui-kit/AGENTS.md` — the library's non-negotiable rules.
2. `projects/ui-kit/README.md` and `projects/ui-kit/docs/ui-elements.md` — authoring pattern.
3. The nearest existing component doc in `projects/ui-kit/docs/components/`.
4. `git status --short` + the implementation, `.spec.ts` and story of the reference component.

Do not overwrite pending changes or untracked files.

## 1. Read the design

With the Figma skill loaded (`figma-design-to-code`) and the Figma MCP tools:

- `get_metadata` / `get_design_context` — node structure, variants, annotations, states.
- `get_variable_defs` — variables/tokens used in the node.
- `get_screenshot` — visual reference.

Map every Figma token onto an **existing foundation** of the kit
(`src/lib/foundations/{colors,sizes,spacing,typography,shadows}`). **Do not introduce literal
values** when an equivalent token exists. If the design uses a value without a token, it is a
foundations decision: flag it, do not invent it inline.

Explicitly list: variants, sizes, states (default/disabled/loading/…), slots, expected a11y
behavior (accessible name, focus, keyboard).

## 2. Propose the public API BEFORE the code

When the consumer contract is at stake (inputs, defaults, outputs, slots, exported types, a11y),
**propose the API and wait for confirmation** — it is a tech lead/design lead decision, not yours.
Propose:

- Selector name `ui-<name>` and class `UI<Name>`.
- Signal inputs with type and default: express **DS intent** (`variant`, `size`, `disabled`,
  `isLoading`, `expand`), not arbitrary styling hooks.
- Literal unions for the variants (e.g. `type UIFooVariant = 'primary' | 'secondary'`).
- Outputs, slots (named `<ng-content>`), exported types, accessible name (required vs optional
  label — accept the label from the consumer, do not embed application copy).

Identify the **breaking changes** instead of introducing them silently.

## 3. Generate the files

For a component `ui-<name>`:

| File                                                     | Purpose                                       |
| -------------------------------------------------------- | --------------------------------------------- |
| `projects/ui-kit/src/lib/components/<name>/ui-<name>.ts` | component                                     |
| `…/ui-<name>.scss`                                       | styles (foundations tokens only, no literals) |
| `…/ui-<name>.spec.ts`                                    | tests (Vitest + Angular TestBed + jsdom)      |
| `projects/ui-kit/stories/ui-<name>.stories.ts`           | story (see storybook skill / steering)        |
| `projects/ui-kit/docs/components/ui-<name>.md`           | docs page                                     |
| `projects/ui-kit/src/public-api.ts`                      | export component + types                      |

Implementation rules (from AGENTS.md / ui-elements.md): standalone, `ViewEncapsulation.ShadowDom`,
`ChangeDetectionStrategy.OnPush`, `input()` / `booleanAttribute` / `computed()`, Ionic primitives
from the standalone entry point, `root.shadow-root` on the host for Ionic color mapping. State in
TypeScript, presentation in SCSS. No business logic or application API calls.

Also update the component barrel (`src/lib/components/index.ts`): it is what defines the coverage
of the Figma plugin — a new export without an adapter makes the plugin build **fail**, it is not
ignored.

Update the library README and the UI Elements Guide when you add a public component.

## 4. Verify (commands from the workspace ROOT, not from projects/ui-kit)

- Focused during development: `npm test -- projects/ui-kit/src/lib/components/<name>/ui-<name>.spec.ts`
- Before handoff: `npm run test:coverage` + `npm run test:typecheck`.
- Package API/Sass changes: `npm run build` (compilation validation).
- Storybook story/config changes: `npm run storybook:build`.
- Formatting: `./node_modules/.bin/prettier --check <touched files>`.

Coverage: **100%** thresholds on the measured runtime (`vitest.config.mts`). Do not lower the
thresholds or add exclusions to hide missing tests. Report **exactly** which checks you ran and
what you could not verify (unit tests prove neither visual rendering nor screen reader; for a
visible UI change use `web-verify` / `browser-recording`).

## 5. Open the PR

Feature branch, **never a direct push to `main`**. Concise title (< 70 chars). Description: what
changes, consumer impact (breaking changes highlighted), checks run, limits. Steer the review.

## 6. Realign Figma (only if requested)

A new component/variant exists in Figma only after the plugin is regenerated: see the
`regenerate-figma-plugin` skill. It is not automatic and is not part of the conversion unless
requested.

## Handoff checklist

- [ ] Tokens mapped onto foundations, no literal where a token exists.
- [ ] Public API proposed and confirmed before the code (if consumer contract at stake).
- [ ] Component + SCSS + spec + story + docs + export in `public-api.ts` + barrel.
- [ ] A11y verified (see `a11y-checklist` skill).
- [ ] Coverage 100% + typecheck pass; package/Storybook build if relevant.
- [ ] README/UI Elements Guide updated for the new public component.
- [ ] PR on a feature branch with a complete description.

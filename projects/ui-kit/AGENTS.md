# Development instructions for @bepower/ui-kit

These versioned project rules apply to `projects/ui-kit` and its descendants, regardless of the
contributor, coding tool, account, or editor. If the current tool does not load this file
automatically, provide it explicitly before work begins. Do not depend on private chat history,
tool-specific memory, personal configuration, or machine-specific paths. Explicit task
instructions take precedence over these defaults; report material exceptions.

## Start here

- Read the [library README](README.md), [UI Elements Guide](docs/ui-elements.md), and the relevant
  component documentation in `docs/components`. Read the [workspace README](../../README.md)
  for setup and development commands. The UI Elements Guide defines the authoring pattern.
- Inspect `git status --short`, the affected implementation, its tests, and its stories before
  editing. Preserve pre-existing changes and untracked files; do not overwrite unrelated work.
- Read any more specific `AGENTS.md` in the directories you change.
- Keep changes scoped to the requested behavior. Resolve routine choices from existing patterns;
  ask when missing requirements affect the public API or intended user experience.
- Run npm commands from the workspace root (`bepower-ui-kit`), two levels above this file.
  Use `.nvmrc`, root `package.json#packageManager`, and the existing npm lockfile for setup.
  Check executable configuration before relying on a documented command.

## Structure and public contracts

- Components: `src/lib/components/<name>/ui-<name>.ts`, companion `.scss`, and `.spec.ts`.
- Shared tokens and mixins: `src/lib/foundations`; shared types: `src/lib/interfaces`.
  Keep component-local types beside their component until they are reused.
- Shared runtime behavior: `src/lib/services`; examples: `stories`; Storybook setup: `.storybook`.
- Public TypeScript entry point: `src/public-api.ts`, with component and interface barrel exports.
  Export new consumer-facing components and types through the appropriate public entry points.
- Package metadata and Sass exports: local `package.json`; packaging and foundation assets:
  `ng-package.json`. Keep published exports and documentation consistent with implementation.
- Treat input names, defaults, outputs, slots, exported types, accessibility behavior, and Sass
  entry points as consumer contracts. Identify breaking changes rather than introducing them
  silently. Keep app-specific business logic and API calls out of this reusable library.

## Component implementation

- Default to standalone Angular components with `ui-` selectors, `UI` class names,
  `ViewEncapsulation.ShadowDom`, and `ChangeDetectionStrategy.OnPush`.
- Follow the existing signal input pattern: `input()`, `booleanAttribute` for boolean attributes,
  and `computed()` for derived state. Keep state in TypeScript and presentation in SCSS.
- Keep APIs small and express design-system intent, such as `variant`, `size`, or `disabled`.
  Avoid arbitrary styling inputs that make consumers reconstruct the design system.
- Import only the required Ionic primitives from the standalone entry point. Prefer Ionic public
  inputs, supported CSS custom properties, and exposed `::part` targets over internal DOM details.
- Maintain strict typing. Do not suppress type errors or weaken configuration to hide defects.
- Clean up subscriptions, event listeners, observers, and imperative overlays. Preserve browser
  behavior and native-plugin fallback behavior where the affected component or service uses them.

## Styling and accessibility

- Read `docs/ui-elements.md` for Shadow DOM boundaries, slots, and semantic typography.
  `ui-button` is the reference implementation; copy relevant patterns, not unrelated behavior.
- Reuse `foundations` tokens for colors, spacing, sizes, typography, and shadows. Avoid new literal
  visual values when equivalent tokens exist. Keep shared changes in foundations and local styles
  in the component SCSS file.
- For Ionic wrappers, include `root.shadow-root` on the host for Ionic color mapping.
  Do not use unsupported selectors to reach through Ionic's shadow root.
- Keep document-level rules in `foundations/base.scss`. Consumers explicitly import
  `@bepower/ui-kit/base` after Ionic global imports; component styles cannot replace that contract.
- Preserve semantic headings, paragraphs, and interactive elements. Do not introduce
  `display: contents` on semantic typography primitives.
- Verify accessible names, keyboard interaction, focus visibility, disabled/loading behavior,
  and focus restoration for overlays as relevant. Accept consumer-provided labels rather than
  embedding application-specific copy or a new application translation system.
- For layout changes, check narrow and wide viewports, long content, scrolling, and safe areas
  where relevant. Unit tests alone do not establish correct visual rendering or screen-reader use.

## Stories, documentation, and icons

- Add or update `stories/ui-<name>.stories.ts` for public variants and meaningful interaction
  states. Storybook imports library sources directly, not `dist/ui-kit`.
- Update the component's `docs/components` page when its API or behavior changes. Keep the
  library README and UI Elements Guide current when adding public components or authoring rules.
- Source SVGs live in the workspace `icons` directory. Read the
  [icon importing guide](src/lib/components/icon/IMPORTING_ICONS.md) before changing icons;
  use `npm run icons:import` for the generated registry and inspect its diff.

## Verification

All commands below run from the workspace root, not from `projects/ui-kit`.

- Setup: `nvm use`, then `npm ci` when dependencies need installation.
- Focused tests: `npm test -- projects/ui-kit/src/lib/components/button/ui-button.spec.ts`
  (replace the example with the affected spec).
- Full suite: `npm test`.
- Coverage: `npm run test:coverage`.
- Test type checking: `npm run test:typecheck`.
- Interactive component checks: `npm run storybook`.
- Static Storybook validation: `npm run storybook:build`.
- Publishable package validation: `npm run build`.
- Formatting: `./node_modules/.bin/prettier --check <changed-files>`; format only relevant files.

Tests use Vitest, Angular TestBed, and jsdom. Reuse workspace `testing/helpers.ts` and
`testing/setup.ts`; tests transform sources in memory and must not depend on building `dist/ui-kit`.
Add meaningful regression tests for changed behavior, including relevant error and interaction
states. The measured runtime code has 100% coverage thresholds in `vitest.config.mts`; do not
lower thresholds or add exclusions to conceal missing tests.

For runtime changes, run focused tests during development and full coverage plus test type checking
before handoff. Validate package compilation for component/API/Sass changes and Storybook builds
for story/configuration changes. For documentation-only work, check formatting and local links.
Report exactly which checks ran and any blockers; do not claim unperformed browser/native checks.

## Workspace safety and handoff

- `npm run build` writes `dist/ui-kit`, which may be linked to a consumer. Use it deliberately
  for package validation, not as a prerequisite for tests or Storybook. Do not start watch builds
  concurrently with tasks that need the linked output to stay unchanged.
- Do not hand-edit `dist`, `coverage`, `storybook-static`, installed dependencies, or generated
  icon output in place of its sources. Do not commit credentials or expose tokens in logs.
- Publishing, deployment, version changes, and history rewrites must be part of the authorized
  task. Ordinary component development does not imply publishing the package.
- If work is shared across multiple contributors or coding tools, assign bounded tasks and file
  ownership. Everyone involved must read these rules; coordinate shared-file changes and review the
  combined result.
- Review the final diff. Report the behavior changed, consumer impact, checks run, and remaining
  limitations. Preserve unrelated work and avoid repository-wide formatting.
- Update this file when development conventions change. Keep rules portable and versioned here
  rather than duplicating divergent instructions in personal accounts or editor settings.

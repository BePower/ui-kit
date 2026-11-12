---
inclusion: fileMatch
fileMatchPattern: '{projects/ui-kit/stories/**,projects/ui-kit/.storybook/**}'
name: storybook
description: Rules for writing stories and configuring Storybook in the @bepower/ui-kit kit
---

# Storybook & stories — @bepower/ui-kit

I load these rules only when I touch `stories/**` or `.storybook/**`. The general mandate lives in
`ds-orchestrator.md`; the component implementation rules in `projects/ui-kit/AGENTS.md`.

## Principles

- Storybook imports the library **sources** (`../src/lib/...`), NOT `dist/ui-kit`. I do not
  introduce imports from the built package.
- Stack: `@storybook/angular-vite`, addons `@storybook/addon-a11y` and `@storybook/addon-docs`.
  The a11y addon is part of the test bench: a story must hold up to the a11y check.
- `storybook-static/` is generated output: I do not edit it by hand.

## Conventions for a story (reference: `ui-button.stories.ts`)

- One file per component: `stories/ui-<name>.stories.ts`.
- `meta`: `title: 'Components/<Name>'`, `component: UI<Name>`, `tags: ['autodocs']`,
  `decorators: [moduleMetadata({ imports: [...standalone components used] })]`.
- `satisfies Meta<UI<Name>>` and `StoryObj<UI<Name>>` for strict typing.
- I expose **the public variants** and the **meaningful interaction states** as separate stories
  (e.g. Primary/Secondary/Outlined, Loading, Disabled, Expanded, IconOnly), not just the default.
  The `args`/`argTypes` reflect the real signal inputs of the component; for unions I use
  `control: 'select'` with the same `options` as the type literals.
- I provide realistic `ariaLabel`/accessible names in the args: the stories also document a11y.
- New public stories -> I update the component doc in `docs/components` and, if needed, the
  UI Elements Guide.

## Config (`.storybook/`)

- `main.ts`: `stories: ['../stories/**/*.stories.ts']`, `staticDirs: ['../public']`, alias
  `@bepower/ui-kit/base` -> `src/lib/foundations/base.scss`. If I add static assets or paths,
  I go through here, without hardcoding paths elsewhere.
- `preview.ts`: standalone Ionic provider `provideIonicAngular({ animated: true, mode: 'ios' })`,
  initial viewport `iphone12mini`, `controls.expanded`. I keep the Ionic provider: the components
  wrap Ionic primitives and without the provider they do not render correctly.

## Verification (from the workspace root)

- Interactive: `npm run storybook`.
- Static validation: `npm run storybook:build` (output in `storybook-static/ui-kit`).
- For a visible UI change, capture browser evidence with available tools (`web-verify` /
  `browser-recording` if installed). If unavailable, report the visual check as outstanding.
- Current `preview.ts` sets `a11y.test: 'todo'`. A successful static build is not a passing
  accessibility gate: inspect addon findings and perform the relevant keyboard/native checks.
- I report which checks I ran; unit tests prove neither the visual rendering nor the screen reader.

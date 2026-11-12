---
inclusion: fileMatch
fileMatchPattern: '{projects/ui-kit/stories/**,projects/ui-kit/.storybook/**}'
name: storybook
description: Story authoring, configuration and verification for @bepower/ui-kit
---

# Storybook

Follow [library rules](../../projects/ui-kit/AGENTS.md). Import library sources, never `dist/ui-kit`;
`storybook-static/` is generated. Stack: Angular Vite, docs and a11y addons.

- Reference `ui-button.stories.ts`: one `stories/ui-<name>.stories.ts` per component, title
  `Components/<Name>`, component, `tags: ['autodocs']`, standalone imports via `moduleMetadata`.
  Use `satisfies Meta<UIName>` and `StoryObj<UIName>`; args reflect real inputs, union controls use
  matching select options. Expose public variants and meaningful interaction states with realistic
  accessible names; update component docs and, where relevant, the UI Elements Guide.
- `main.ts` owns story/static paths and the `@bepower/ui-kit/base` Sass alias. Preserve
  `preview.ts` Ionic setup (`provideIonicAngular({ animated: true, mode: 'ios' })`), initial
  `iphone12mini` viewport and expanded controls.
- From workspace root: `npm run storybook` for interaction; `npm run storybook:build` for static
  validation (output `storybook-static/ui-kit`). Inspect addon findings: `a11y.test: 'todo'`
  makes static success insufficient to claim an accessibility gate passed.
- Apply [accessibility checks](../skills/a11y-checklist/SKILL.md). Capture available browser evidence
  for visible changes; report outstanding visual/keyboard/screen-reader checks. Unit tests do not
  establish native rendering.

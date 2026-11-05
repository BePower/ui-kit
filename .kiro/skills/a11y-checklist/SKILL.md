---
name: a11y-checklist
description: Accessibility (UX/UI) checklist for a @bepower/ui-kit component — accessible name, keyboard, focus, disabled/loading states, viewport, safe area, Storybook a11y addon. Load this skill when you create or modify a component of the kit, when you verify a visible UI change, or when you write/update a story.
---

# Accessibility checklist — @bepower/ui-kit

The orchestrator's UX/UI area. Accessibility is a **public contract** of the component (see
`projects/ui-kit/AGENTS.md`, "Styling and accessibility" section), so it is treated like the API:
you do not break it silently. This skill is the operational checklist; the underlying rules live
in AGENTS.md and `docs/ui-elements.md`.

Guiding principle: unit tests do **not** establish visual rendering or screen-reader use. This
checklist is verified with the Storybook a11y addon, with keyboard testing, and for visible
changes with `web-verify` / `browser-recording`.

## 1. Accessible name

- Every interactive element has an **accessible name** (visible label, `aria-label`,
  `aria-labelledby`). Accept the label **from the consumer** (`ariaLabel` input / slot), do not
  embed application copy nor a library translation system.
- Icon-only / controls without visible text → accessible name **required**: document it as a
  requirement in the docs page and provide a realistic `ariaLabel` in the story args.
- Decorative images/pictograms → `aria-hidden` / empty name, not an invented name
  (see `ui-pictogram`, `ui-progress-bar` with `ariaHidden`).

## 2. Semantics

- Preserve native headings, paragraphs and interactive elements. `ui-title` maps `xl/l/m/s` onto
  `h1/h2/h3/h4`; do not alter the semantic hierarchy.
- **Do not** use `display: contents` on the semantic typography primitives.
- Use the right native element (button vs link vs input); do not reconstruct roles with `div`.

## 3. Keyboard and focus

- Everything clickable is reachable and operable by **keyboard** (Tab / Enter / Space / Escape
  where relevant).
- **Visible focus**: do not remove the outline without a compliant replacement.
- Overlays (bottom sheet, modals): focus management on open and focus **restoration** on close;
  `Escape` closes where expected. See `ui-bottom-sheet` + the screen-reader/status-bar services.
- Logical tab order; no unintended focus trap.

## 4. States

- **Disabled**: not focusable/operable, state communicated beyond color alone
  (`aria-disabled` / native attribute), consistent host state class.
- **Loading / isLoading**: state announced (e.g. `aria-busy`), interaction inhibited where needed.
- Error/validation states (e.g. `ui-input-field`): message linked to the field
  (`aria-describedby` / bottomText) and announced.

## 5. Contrast and color

- Colors from the **foundations tokens**, never literals. Do not rely on color alone for
  information (pair it with an icon/text/ARIA state).
- Real contrast must be verified visually: the a11y addon flags, but full WCAG certification
  requires manual testing with assistive technologies and is outside the unit tests.

## 6. Layout and viewport

- Check **narrow and wide** viewports, long content, scrolling, **safe area** where relevant
  (`ui-page` shell, bottom sheet). The Storybook preview starts from `iphone12mini`.
- Adequate touch targets; no overflow that cuts off content or controls.

## 7. Storybook test bench

- The `@storybook/addon-a11y` addon is part of the test bench: a story must **hold up** to the
  a11y check. Expose the meaningful interaction states (disabled, loading, error) as separate
  stories, not just the default, and provide realistic accessible names in the args.
- Interactive verification: `npm run storybook` (from the root). Static validation:
  `npm run storybook:build`.

## 8. Evidence for visible changes

For a visible UI change capture evidence with `web-verify` / `browser-recording` (screenshots for
static states, video/GIF for motion and multi-step interactions). In the report state what you
verified and what you **could not** verify (e.g. real screen reader).

## Quick checklist

- [ ] Accessible name present (consumer-provided where needed); icon-only documented.
- [ ] Native semantics preserved; no `display: contents` on the typography ones.
- [ ] Full keyboard; visible focus; focus management + restoration for overlays.
- [ ] Disabled and loading communicated beyond color.
- [ ] Colors from tokens; information not relying on color alone.
- [ ] Narrow/wide viewports, long content, safe area verified.
- [ ] Stories hold up to the a11y addon; meaningful states as separate stories.
- [ ] Visual evidence captured; limits stated in the report.

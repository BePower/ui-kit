---
name: a11y-checklist
description: Verify accessibility of @bepower/ui-kit components, visible UI changes and stories; document native/browser evidence and limits.
---

# Accessibility checks

Accessibility is a public contract; follow [library rules](../../../projects/ui-kit/AGENTS.md)
and the UI Elements Guide. Apply the relevant checks to rendered Angular/Ionic controls:

- **Names:** consumer-provided visible labels, `aria-label` or `aria-labelledby`. Document required
  icon-only labels and demonstrate them in stories. Hide decorative graphics appropriately;
  do not introduce application copy or a library translation system.
- **Semantics:** native buttons/links/inputs and semantic typography. `ui-title` maps `xl/l/m/s`
  to `h1/h2/h3/h4`; no `display: contents` on typography primitives.
- **Keyboard/focus:** logical tab order, expected arrow/Enter/Space/Escape behavior, visible focus,
  no unintended traps. Overlays manage focus on open and restore it on close; Escape where expected.
- **States:** disabled controls block activation and expose state beyond color. Check focusability
  against native semantics (`aria-disabled` alone does not remove tab stops). Loading is announced
  and inhibits interaction as required; validation messages are linked and announced.
- **Color/layout:** use foundation tokens, non-color signals and measured rendered contrast.
  Check narrow/wide viewports, long content, scrolling, safe areas and usable touch targets without
  clipping controls.
- **Stories:** meaningful disabled/loading/error states and realistic names, following
  [Storybook steering](../../steering/storybook.md). Inspect actual addon findings: current
  `a11y.test: 'todo'` means a green static build is not an accessibility gate.

Use available browser tools for screenshots or motion/interaction recordings and perform relevant
keyboard/assistive-technology checks. Report evidence and outstanding checks explicitly.
Unit tests, visual inspection alone and Figma screenshots do not establish Angular/Ionic screen-reader
behavior or WCAG conformance.

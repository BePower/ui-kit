---
inclusion: fileMatch
fileMatchPattern: '{projects/ui-kit/src/**,sonar-project.properties}'
name: code-quality
description: Shared component behavior, safe value normalization and SonarCloud evidence
---

# Shared behavior and SonarCloud

- Inspect the reported rules and duplicate blocks. Extract a cohesive internal helper, template
  or base only when contracts are shared. Do not force unrelated abstractions, suppress findings,
  add scanner/coverage exclusions or lower thresholds to pass a gate.
- Reference: `projects/ui-kit/src/lib/components/radio-group/` shares `RadioGroupBase` and a
  template. Concrete Radio Button/Card groups retain selectors, child queries, generated name
  prefixes and value-accessor providers. Keep implementation helpers out of public barrels.
- Preserve inherited signal inputs/model outputs, projection, validation, disabled/error
  propagation, blur/touched behavior and Ionic DOM requirements. These radio groups intentionally
  use Emulated encapsulation despite the library's ShadowDom default.
- Narrow `unknown` before conversion: unchecked `String(value)` can produce `[object Object]`.
  Share normalization between programmatic writes and events. The radio-group contract preserves
  strings, maps nullish values to `null`, stringifies number/boolean/bigint primitives and rejects
  objects/arrays/symbols/functions with `TypeError`. Do not generalize this policy to other controls;
  document changes to accepted values.
- Test every consumer of shared behavior. Rejected values must preserve selection and avoid form
  callbacks; `writeValue` must not call the registered change callback. Follow
  [AGENTS.md](../../projects/ui-kit/AGENTS.md) for coverage and Angular compilation checks.
- Verify SonarCloud's analysis for the current PR/commit, distinguishing **new-code** from overall
  duplication and coverage from issue resolution. Local tests, builds and duplication estimates
  neither prove a passing quality gate nor predict its exact percentage. Report unavailable or
  pending analysis explicitly.

---
inclusion: always
---

# BePower Design System

The repository is authoritative for `@bepower/ui-kit`. Figma design decisions become public
contracts, components, tests, stories and docs; the plugin generates native Figma assets from
repository sources, without reading Code Layers or modifying Angular.

Before library work, read [AGENTS.md](../../projects/ui-kit/AGENTS.md): it owns implementation,
setup, verification and workspace-safety rules. Preserve existing work. Ask only about unresolved
API/UX decisions or breaking changes; respect decisions already authorized. Reply in the user's
language and explain design-system tradeoffs.

Load only the guidance relevant to the task:

| Task                                         | Guidance                                                              |
| -------------------------------------------- | --------------------------------------------------------------------- |
| Figma → Angular or public component changes  | [figma-to-component](../skills/figma-to-component/SKILL.md)           |
| Component, story or visible UI accessibility | [a11y-checklist](../skills/a11y-checklist/SKILL.md)                   |
| Plugin generation, layout, updates or CI     | [regenerate-figma-plugin](../skills/regenerate-figma-plugin/SKILL.md) |
| Requested PR preparation/submission          | [prepare-pull-request](../skills/prepare-pull-request/SKILL.md)       |
| Shared behavior or SonarCloud findings       | [code-quality](code-quality.md)                                       |
| Storybook authoring/configuration            | [storybook](storybook.md)                                             |

Load required tool-specific skills before Figma calls. Discover optional tools/skills rather than
assuming availability; delegate only when authorized. Continue local work if tools are unavailable
and report the limit. Mock tests do not establish native rendering or preservation of Figma overrides.

Implementation alone does not authorize pushing, publishing, version changes or Figma writes.
Regenerate/realign Figma when requested. Internal PR pushes can publish the plugin automatically;
consult the current workflow before pushing.

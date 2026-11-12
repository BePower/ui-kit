---
name: prepare-pull-request
description: Prepare, push, open or update a BePower UI Kit PR with its required title, validation evidence and ClickUp links.
---

# Prepare a pull request

## Scope and validation

- Inspect status and intended commits; preserve unrelated/staged/untracked work. Commit only when
  authorized. Use a feature branch `CU-<ClickUpId>_<short-description>`, never push to `main`.
- Follow [AGENTS.md](../../../projects/ui-kit/AGENTS.md) for library checks and
  [regenerate-figma-plugin](../regenerate-figma-plugin/SKILL.md) for plugin checks. Documentation-only
  work needs formatting/local-link checks; workflow changes need syntax and decision-path validation.
  Format touched files and run `git diff --check`.
- For Sonar findings, follow [code-quality](../../steering/code-quality.md). After an authorized
  push, check analysis for that commit; report pending analysis instead of inferring gate success.
- An authorized version bump happens **once per PR** in `projects/ui-kit/package.json`. Inspect
  existing changes first; component additions, rebuilds and follow-up commits do not each need bumps.

## Push and create

1. Push intended commits with `git push -u origin <feature-branch>` (no bare push). A clean working
   tree is not required if unrelated local changes remain. Check the current
   `.github/workflows/build-figma-plugin.yml`: internal PR pushes can publish changed plugin hashes;
   plugin publication is distinct from native validation and design-library publication.
2. Run `gh pr list --head <branch>` to avoid duplicates. Create against `main` with an explicit head,
   provisional title `CU-<ClickUpId>_<description>` and `--body-file <file>` preserving newlines.
   Include ClickUp id/link, relevant Figma references, behavior/API impact, validation and limitations.
3. Read the returned PR number and immediately set `CU-<ClickUpId>_<description> (#<number>)`.
   Validate the final title against this exact regex:

   ```regex
   ^CU-[A-Za-z0-9]+_[^()\r\n]+[^\S\r\n]\(#\d+\)(?:\r?\n|$)
   ```

4. Verify with `gh pr view <number> --json number,title,url,state,headRefName,baseRefName,statusCheckRollup`.

For SAML/SSO failures, inspect `gh auth status` without exposing credentials, authorize using the
GitHub-provided SSO link, then retry `gh repo view`/`gh pr list`. Environment tokens can override
stored credentials; use normal interactive login in the user's terminal, never tokens in commands/logs.

## ClickUp and handoff

Include the task URL/id in GitHub. When this skill is explicitly invoked, add exactly one ClickUp
task comment via the configured connector with the PR URL and one-line summary; inspect existing
comments to avoid duplicates. Do not change other task fields without explicit authorization.
If the connector is unavailable, report the backlink pending; do not substitute unapproved raw API
calls or credentials.

Report final PR title/URL, ClickUp link/backlink status, branch/commit, actual local/CI checks and
remaining limitations. Do not claim completion with an invalid title, unpushed branch or missing
GitHub → ClickUp link; distinguish a pending ClickUp backlink from completed work.

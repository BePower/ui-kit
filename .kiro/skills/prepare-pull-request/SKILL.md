---
name: prepare-pull-request
description: Prepare, open, and link a BePower UI Kit pull request to its ClickUp task. Load this skill when the user asks to open, submit, push, or prepare a PR for this repository.
---

# Prepare a pull request — bepower-ui-kit

Use this procedure for every pull request in `bepower-ui-kit`. It keeps GitHub, ClickUp, CI,
and the design-to-code review flow connected.

## 1. Preconditions

- Read `projects/ui-kit/AGENTS.md` when the change touches the library.
- Inspect `git status --short`; preserve unrelated changes and untracked files.
- Confirm the current branch is a feature branch, never `main`.
- Identify the ClickUp task id. The supported branch pattern is:

  ```text
  CU-<ClickUpId>_<short-description>
  ```

- Review which commits and files belong to the PR. Push the intended commits before opening it;
  do not commit, discard or block on unrelated local changes just to obtain a clean working tree.
- Do not create a commit unless the user authorized committing. Do not push directly to `main`.

## 2. Required PR title convention

The PR title MUST match this regular expression exactly:

```regex
^CU-[A-Za-z0-9]+_[^()\r\n]+[^\S\r\n]\(#\d+\)(?:\r?\n|$)
```

The GitHub PR number is known only after creation, so use this two-step flow:

1. Create the PR with a provisional title that already contains the ClickUp id and branch
   description, for example `CU-1amfa060mub_UIKit-creazione-radio-button`.
2. Read the created PR number and immediately update the title to:

   ```text
   CU-1amfa060mub_UIKit-creazione-radio-button (#8)
   ```

Before reporting completion, validate the final title with the exact regex. The title must contain:

- `CU-` followed by the ClickUp id;
- `_` followed by a non-empty description;
- a space before the parenthesized PR number;
- the GitHub PR number in the form `(#N)`.

## 3. Validate locally before opening

Run the checks relevant to the change from the workspace root. For a component/API/Sass/story
change, the normal minimum is:

```bash
npm test -- projects/ui-kit/src/lib/components/<name>/<spec>.spec.ts
npm run test:coverage
npm run test:typecheck
npm run build
npm run storybook:build
```

For plugin source changes also run (the test command itself builds the bundle; rebuild separately
if sources change afterwards or delivery requires a fresh artifact):

```bash
node --test figma-plugin/plugin.test.mjs
node scripts/build-figma-plugin.mjs
```

For documentation-only changes, check formatting and local links rather than running unrelated
runtime builds. Validate changed workflow syntax and decision paths separately.

Run Prettier on touched source, story, documentation, steering, and workflow files, then:

```bash
git diff --check
```

Report checks exactly. Do not claim visual/browser or screen-reader verification unless it was
actually performed.

## 4. Push the feature branch

Use an explicit branch name and set its upstream:

```bash
git push -u origin <feature-branch>
```

Never use a bare `git push`, and never push to `main`.

If GitHub CLI reports SAML/SSO enforcement:

1. Run `gh auth status` without exposing the token.
2. Open the organization SSO authorization link printed by GitHub.
3. Re-run `gh repo view` and `gh pr list` after authorization.

If an environment token takes precedence over stored credentials, inspect authentication status
without printing secrets. Use the normal interactive `gh auth login`/SSO flow in the user's
terminal; do not copy tokens into commands or logs.

Internal PR pushes may automatically publish the Figma plugin when its build hash changes.
Review `.github/workflows/build-figma-plugin.yml`; a publication is not native Figma validation
or publication of the generated design library. Preserve fork/Dependabot exclusions and deploy
success tracking when changing CI.

## 5. Create and update the PR

Use `gh pr list --head <branch>` first to avoid duplicates. Create against `main`:

```bash
gh pr create \
  --base main \
  --head <feature-branch> \
  --title 'CU-<ClickUpId>_<description>' \
  --body-file <body-file>
```

The body must contain:

- the ClickUp task link and id;
- Figma specification/reference links when applicable;
- concise summary of the implementation;
- consumer/API and breaking-change impact;
- validation checks and known limitations;
- note that generated output is not hand-edited, if relevant.

After GitHub returns the PR number, update the title to the required final format:

```bash
gh pr edit <number> --title 'CU-<ClickUpId>_<description> (#<number>)'
```

Verify it:

```bash
gh pr view <number> --json number,title,url,state,headRefName,baseRefName,statusCheckRollup
```

## 6. Link the PR back to ClickUp

The link is bidirectional:

- GitHub → ClickUp: include the task URL and id in the PR title/body.
- ClickUp → GitHub: add exactly one comment to the task using the configured ClickUp MCP
  server, containing the PR URL and a one-line summary.

Do not change the ClickUp task status, assignee, priority, due date, description, or other fields
unless the user explicitly asks for that change. If ClickUp MCP is unavailable, report the PR URL
and ask the user to connect it; do not use an unapproved raw API call or expose a token.

## 7. Handoff

Report:

- final PR title and full PR URL;
- ClickUp task id/link and whether the backlink comment was posted;
- branch and commit;
- CI status and checks run;
- remaining limitations or required reviewer actions.

A PR is ready for review only when the title matches the regex, the branch is pushed, the ClickUp
link is present, and the validation status is honestly reported.

## Versioning safeguard

When a version bump is part of the authorized release task, bump `projects/ui-kit/package.json`
**once per pull request**. Check whether the PR already contains the bump; documentation-only
maintenance or a plugin rebuild does not by itself authorize a release/version change.
All components, plugin updates, and other changes included in the same PR share that version. Do not bump the package for each new
component, Figma rebuild, or follow-up commit in the same PR.

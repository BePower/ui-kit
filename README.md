# BePower UI Kit

[![Quality gate status](https://sonarcloud.io/api/project_badges/measure?project=BePower_ui-kit&metric=alert_status&token=affaccf10d2a93c9969767e9c53063e30ef8e5d2)](https://sonarcloud.io/summary/new_code?id=BePower_ui-kit)

Angular and Ionic component library implementing the BePower design system. Components are
standalone, use native Shadow DOM encapsulation, and expose shared foundations for colors,
typography, spacing, sizes, and shadows.

- [Library and consumer documentation](./projects/ui-kit/README.md)
- [Component documentation](./projects/ui-kit/docs/ui-elements.md)
- [Interactive Storybook](https://app-ui-kit.bepower.tech)

## Requirements

- Node.js `v24.17.0`, defined in [`.nvmrc`](./.nvmrc)
- npm `11.13.0`, defined by the `packageManager` field in `package.json`

GitHub Actions also reads `.nvmrc`, so local development and CI use the same Node.js version.

## Setup

```bash
nvm use
npm ci
```

## Storybook

Run the interactive component documentation locally:

```bash
npm run storybook
```

Storybook imports the library sources directly and does not require a build of `dist/ui-kit`.

Generate the static Storybook website with:

```bash
npm run storybook:build
```

The output is written to `storybook-static/ui-kit`.

## Unit tests

Run the complete Vitest suite once:

```bash
npm test
```

Additional commands:

```bash
npm run test:watch
npm run test:coverage
npm run test:typecheck
```

The tests run directly against the library sources in memory and do not build or modify
`dist/ui-kit`. Coverage reports are generated in `coverage/`; the configured thresholds require
100% statements, branches, functions, and lines for the measured runtime code.

## Library development

Build the publishable package:

```bash
npm run build
```

The package is written to `dist/ui-kit`.

Use watch mode when a local consumer is linked to the generated package:

```bash
npm run watch
```

Watch mode continuously rebuilds `dist/ui-kit`, so it should not be run at the same time as tasks
that expect the linked output to remain unchanged.

## Icons

Source SVG files are stored in `icons/`. Import or update the generated TypeScript icon registry
with:

```bash
npm run icons:import
```

See the [icon importing guide](./projects/ui-kit/src/lib/components/icon/IMPORTING_ICONS.md) for
file naming and variant conventions.

## Quality analysis

Pull requests run unit tests, generate the LCOV report, and execute the SonarQube Cloud scanner
through [the test and coverage workflow](./.github/workflows/test-and-coverage.yml).

The two Sonar configuration files belong to different analysis modes:

- `sonar-project.properties` is read by the CI-based Sonar scanner and configures the project key
  and LCOV report.
- `.sonarcloud.properties` is read only by SonarQube Cloud Automatic Analysis.

Only one Sonar analysis mode should be active for the project. When using the scanner configured in
the GitHub workflow, CI analysis settings and exclusions must be defined in
`sonar-project.properties`.

## Publishing

Build the library, then publish the generated package:

```bash
npm run build
npm publish ./dist/ui-kit
```

Keep the leading `./` in the package path; otherwise npm may interpret `dist/ui-kit` as a remote
package reference.

## Continuous integration

- Pull requests run tests, coverage, and SonarQube Cloud checks.
- Pushes to `main` build and deploy Storybook to GitHub Pages.

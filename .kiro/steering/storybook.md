---
inclusion: fileMatch
fileMatchPattern: '{projects/ui-kit/stories/**,projects/ui-kit/.storybook/**}'
name: storybook
description: Regole per scrivere storie e configurare Storybook nel kit @bepower/ui-kit
---

# Storybook & stories — @bepower/ui-kit

Carico queste regole solo quando tocco `stories/**` o `.storybook/**`. Il mandato generale sta
in `ds-orchestrator.md`; le regole di implementazione del componente in `projects/ui-kit/AGENTS.md`.

## Principi

- Storybook importa i **sorgenti** della libreria (`../src/lib/...`), NON `dist/ui-kit`. Non
  introduco import dal pacchetto buildato.
- Stack: `@storybook/angular-vite`, addon `@storybook/addon-a11y` e `@storybook/addon-docs`.
  L'a11y addon è parte del banco di prova: una storia deve reggere il check a11y.
- `storybook-static/` è output generato: non lo edito a mano.

## Convenzioni di una story (riferimento: `ui-button.stories.ts`)

- Un file per componente: `stories/ui-<name>.stories.ts`.
- `meta`: `title: 'Components/<Name>'`, `component: UI<Name>`, `tags: ['autodocs']`,
  `decorators: [moduleMetadata({ imports: [...standalone components usati] })]`.
- `satisfies Meta<UI<Name>>` e `StoryObj<UI<Name>>` per typing stretto.
- Espongo **le variant pubbliche** e gli **stati d'interazione significativi** come story
  separate (es. Primary/Secondary/Outlined, Loading, Disabled, Expanded, IconOnly), non solo
  il default. Gli `args`/`argTypes` riflettono i signal input reali del componente; per le union
  uso `control: 'select'` con le stesse `options` dei literal del tipo.
- Fornisco `ariaLabel`/nomi accessibili realistici negli args: le storie documentano anche l'a11y.
- Nuove story pubbliche → aggiorno la doc del componente in `docs/components` e, se serve, la
  UI Elements Guide.

## Config (`.storybook/`)

- `main.ts`: `stories: ['../stories/**/*.stories.ts']`, `staticDirs: ['../public']`, alias
  `@bepower/ui-kit/base` → `src/lib/foundations/base.scss`. Se aggiungo asset statici o path,
  passo da qui, senza hardcodare percorsi altrove.
- `preview.ts`: provider Ionic standalone `provideIonicAngular({ animated: true, mode: 'ios' })`,
  viewport iniziale `iphone12mini`, `controls.expanded`. Mantengo il provider Ionic: i componenti
  wrappano primitive Ionic e senza provider non rendono correttamente.

## Verifica (dalla root del workspace)

- Interattivo: `npm run storybook`.
- Validazione statica: `npm run storybook:build` (output in `storybook-static/ui-kit`).
- Per una modifica UI visibile uso poi `web-verify` / `browser-recording` per catturare evidenze.
- Riporto quali check ho eseguito; i test unit non provano il rendering visivo né lo screen reader.

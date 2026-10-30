---
inclusion: fileMatch
fileMatchPattern: '{figma-plugin/**,scripts/*figma*}'
name: figma-plugin
description: Regole per il plugin Figma di generazione DS e i suoi script di build/inventory
---

# Plugin Figma — generazione libreria nativa (bepower-ui-kit)

Carico queste regole solo quando tocco il plugin o i suoi script di build. Il mandato generale
sta in `ds-orchestrator.md`.

## Principio: i sorgenti sono l'unica fonte di verità

`scripts/build-figma-plugin.mjs` + `scripts/figma-inventory.mjs` **derivano** tutto dai sorgenti
della libreria, non da liste parallele:

- **Token colore/numerici**: valutati da Sass via `meta.module-variables` su `foundations/colors`,
  `foundations/sizes`, `foundations/spacing`. I `rem` sono convertiti in px (`* 16`).
- **Tipografia**: ogni `@mixin` di `foundations/typography.scss` compilato per estrarre size,
  line-height, weight, underline, uppercase.
- **Mapping del bottone**: letto da `ui-button.scss`; `required()` **lancia** se il pattern non
  matcha più. Se tocco lo SCSS del bottone e cambio quei nomi di proprietà, aggiorno il pattern.
- **Input dei componenti**: estratti via TypeScript type checker dal barrel
  `components/index.ts` (solo `input()` / `input.required`, con union di literal come `values`).
- **Icone/pittogrammi**: da `icon-map.ts` + SVG in `icons/` e dai `values` di `pictogram.name` +
  SVG in `pictograms/`. Guardie: se registry e sorgenti divergono il build **fallisce** chiedendo
  `npm run icons:import` / `npm run pictograms:import`.

**Conseguenza operativa**: non aggiungo dati a mano nel bundle. Per esporre un nuovo token/variant
in Figma, lo aggiungo al **sorgente** (foundations, input del componente, registry) e rigenero.

## Build e artefatti

- Build dalla root workspace: `node scripts/build-figma-plugin.mjs`. Scrive `figma-plugin/dist/`
  (`code.js`, `manifest.json`, `build-info.json`, `tokens.json`).
- `figma-plugin/dist/` è **ignorata da Git**: modificare i soli sorgenti non rigenera il bundle.
- Target di transpile **ES2017** (sandbox Figma): niente optional chaining/object spread nel
  bundle distribuito. `status.html` è versionato e contiene il marker `/* TOKENS */`.
- Manifest: `id` fisso `bepower-ui-kit-repository-pilot`, `networkAccess.allowedDomains: ['none']`.
  **Non cambio l'id**: i dati privati che identificano i nodi sono legati al plugin; cambiarlo
  rompe il riconoscimento dei master.

## Regole non negoziabili

- Non rimuovo pagine/master/variabili per "aggiornare": romperebbe i collegamenti delle istanze.
  Il generatore aggiorna sul posto (atteso: "651 aggiornati, 0 creati" a catalogo invariato).
- Non modifico `figma-plugin/dist` a mano: è output generato. Edito i sorgenti
  (`components.js`, `composition.js`, `catalog.js`, `plugin.js`, `status.html`) e rigenero.
- Font dichiarato: famiglia da `foundations/base.scss` (`--ion-font-family`); il plugin non usa
  font sostitutivi. Se manca, il build lancia.
- `figma-plugin/plugin.test.mjs` copre il generatore: lo eseguo dopo modifiche al plugin.
- Pubblicazione libreria in Figma: manuale, lato designer. Io indico la procedura, non la eseguo.

## Direzione del flusso

Repo → Figma (il plugin genera nativi Figma dai sorgenti). Il plugin **non** legge il Code Layer
e **non** modifica i componenti Angular. La direzione Figma → componente è orchestrazione, non
compito del plugin.

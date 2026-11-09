# `ui-pictogram`

Consumer-facing documentation for the `ui-pictogram` component.

## Import

`ui-pictogram` is a standalone Angular component.

```ts
import { Component } from '@angular/core';
import { UIPictogram } from '@bepower/ui-kit';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [UIPictogram],
  template: `<ui-pictogram name="wallet" />`,
})
export class ExampleComponent {}
```

## Pictogram loading

Pictograms are compiled into the UI kit as TypeScript data URIs and loaded on demand. Original SVG colors are preserved. Consumers do not need asset-copy configuration.

## Inputs

### `name`

Selects a pictogram from the UI kit registry.

Type:

```ts
PictogramName;
```

Required: yes. There is no default value.

Supported values:

```ts
type PictogramName =
  | 'accesso-biometrico'
  | 'activity'
  | 'avvio-ricarica'
  | 'battery-25'
  | 'battery-50'
  | 'battery-75'
  | 'battery-over-75'
  | 'e-truck'
  | 'email-verificata'
  | 'favoriti'
  | 'gps'
  | 'info'
  | 'invita-amico'
  | 'loyalty'
  | 'metodo-pagamento'
  | 'negative'
  | 'nessuna-ricarica'
  | 'notifica'
  | 'positive'
  | 'profilo-aggiornato'
  | 'riprendi-registrazione'
  | 'wallet';
```

The contextual values use the circled artwork from the Foundation draft. `positive`, `negative`, and `info` are status pictograms. Feedback pictograms (`happy-face`, `neutral-face`, and `sad-face`) remain excluded because the draft marks them as future evolutions not yet approved for development.

## Usage guidelines

Pictograms communicate content, system states, outcomes, and user evaluations immediately and consistently. Choose the family by asking what the pictogram represents:

- **Contextual — “What is this screen about?”** Reinforces the content, functionality, or context of a screen. Examples: `email-verificata`, `avvio-ricarica`, and `nessuna-ricarica`.
- **Status — “What happened?”** Communicates an objective, verifiable system outcome or condition. Use `positive` for a completed operation, `negative` for a generic or system error, and `info` for an informational condition.
- **Feedback — “How does the user evaluate the experience?”** Represents a subjective choice expressed directly by the user. This family is documented in Foundation but is not available in `UIPictogram` yet; do not introduce local substitutes.

Decision rule: if the meaning is a system datum or outcome, use a Status pictogram. If it describes the screen or feature, use a Contextual pictogram. Only an explicit user evaluation belongs to Feedback.

### Do and don’t

- Do accompany the pictogram with text: `ui-pictogram` is decorative and must not carry meaning on its own.
- Do use `positive`, `negative`, or `info` for technical outcomes and objective system conditions.
- Don’t use feedback faces such as Happy, Neutral, or Sad to represent success, failure, or another technical outcome automatically.
- Don’t use Feedback pictograms in new flows until their implementation is explicitly approved.

Source: [Foundation — Pictograms guidelines](https://www.figma.com/design/EPZunrpuNi85EbwCWbQbSn/Foundation?node-id=4490-11647).

### `size`

Controls the square rendered size. Semantic sizes scale the same SVG asset through CSS; no size-specific pictogram files are loaded.

Type:

```ts
's' | 'm' | 'l';
```

Size mapping:

| Size | Rendered size |
| ---- | ------------- |
| `s`  | 40 × 40 px    |
| `m`  | 80 × 80 px    |
| `l`  | 160 × 160 px  |

Default:

```ts
'm';
```

## Accessibility

`ui-pictogram` is always decorative. Its internal image has an empty alternative text and `aria-hidden="true"`. Do not use it as the only way to communicate information.

## Example

```html
<ui-pictogram name="wallet" size="m" />
```

## Maintainer workflow

Source SVG files live in the repository-level `pictograms/` directory. See [Importing Pictograms](../../src/lib/components/pictogram/IMPORTING_PICTOGRAMS.md) for synchronization rules.

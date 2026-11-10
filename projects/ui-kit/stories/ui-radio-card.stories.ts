import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular-vite';
import { userEvent } from 'storybook/test';

import { UIRadioCard } from '../src/lib/components/radio-card/ui-radio-card';
import { UIRadioCardGroup } from '../src/lib/components/radio-card/ui-radio-card-group';

const meta = {
  title: 'Components/Radio Card',
  component: UIRadioCard,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [UIRadioCard, UIRadioCardGroup] })],
  parameters: { layout: 'padded' },
  args: {
    value: 'fast',
    title: "Titolo dell'opzione",
    description: 'Una breve descrizione che spiega cosa comporta questa scelta',
    disabled: false,
    invalid: false,
  },
  render: (args) => ({
    props: { ...args, selectedValue: null },
    template: `
      <div style="inline-size: 100%; min-inline-size: 0">
        <ui-radio-card-group ariaLabel="Metodo di ricarica" [(value)]="selectedValue">
          <ui-radio-card
            [value]="value"
            [title]="title"
            [description]="description"
            [disabled]="disabled"
            [invalid]="invalid"
            [errorText]="errorText"
          ></ui-radio-card>
        </ui-radio-card-group>
      </div>
    `,
  }),
} satisfies Meta<UIRadioCard>;

export default meta;
type Story = StoryObj<UIRadioCard>;

export const Default: Story = {};

export const FigmaReferenceWidth: Story = {
  render: (args) => ({
    props: { ...args, selectedValue: null },
    template: `
      <div style="inline-size: 327px; max-inline-size: 100%; min-inline-size: 0">
        <ui-radio-card-group ariaLabel="Metodo di ricarica" [(value)]="selectedValue">
          <ui-radio-card
            [value]="value"
            [title]="title"
            [description]="description"
          ></ui-radio-card>
        </ui-radio-card-group>
      </div>
    `,
  }),
};

export const NarrowViewport: Story = {
  args: {
    title: "Titolo dell'opzione che può andare su più righe",
    description:
      'Una descrizione lunga continua a essere leggibile e aumenta naturalmente l’altezza della card.',
  },
  parameters: { viewport: { defaultViewport: 'iphone12mini' } },
};

export const Selected: Story = {
  render: (args) => ({
    props: { ...args, selectedValue: args.value },
    template: `
      <div style="inline-size: 100%; min-inline-size: 0">
        <ui-radio-card-group ariaLabel="Metodo di ricarica" [(value)]="selectedValue">
          <ui-radio-card
            [value]="value"
            [title]="title"
            [description]="description"
          ></ui-radio-card>
        </ui-radio-card-group>
      </div>
    `,
  }),
};

export const Error: Story = {
  args: {
    invalid: true,
    errorText: 'Seleziona un metodo disponibile',
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Focus: Story = {
  play: async () => {
    await userEvent.tab();
  },
};

export const InteractiveGroup: Story = {
  render: () => ({
    props: { selectedValue: 'standard' },
    template: `
      <div style="inline-size: 100%; min-inline-size: 0">
        <ui-radio-card-group ariaLabel="Metodo di ricarica" [(value)]="selectedValue">
          <ui-radio-card
            value="fast"
            title="Ricarica rapida"
            description="Riduce il tempo necessario per completare la ricarica"
          ></ui-radio-card>
          <ui-radio-card
            value="standard"
            title="Ricarica standard"
            description="Utilizza la potenza disponibile normalmente"
          ></ui-radio-card>
          <ui-radio-card
            value="scheduled"
            title="Ricarica programmata"
            description="Avvia la ricarica nella fascia oraria scelta"
          ></ui-radio-card>
        </ui-radio-card-group>
        <p>Valore selezionato: {{ selectedValue }}</p>
      </div>
    `,
  }),
};

import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular-vite';
import { userEvent } from 'storybook/test';

import { UIRadioButton } from '../src/lib/components/radio-button/ui-radio-button';
import { UIRadioButtonGroup } from '../src/lib/components/radio-button/ui-radio-button-group';

const meta = {
  title: 'Components/Radio Button',
  component: UIRadioButton,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [UIRadioButton, UIRadioButtonGroup] })],
  parameters: { layout: 'padded' },
  args: {
    value: 'fast',
    label: 'Ricarica rapida',
    disabled: false,
    invalid: false,
  },
  render: (args) => ({
    props: { ...args, selectedValue: null },
    template: `
      <div style="inline-size: 100%; min-inline-size: 0">
        <ui-radio-button-group ariaLabel="Metodo di ricarica" [(value)]="selectedValue">
          <ui-radio-button
            [value]="value"
            [label]="label"
            [description]="description"
            [disabled]="disabled"
            [invalid]="invalid"
            [errorText]="errorText"
          ></ui-radio-button>
        </ui-radio-button-group>
      </div>
    `,
  }),
} satisfies Meta<UIRadioButton>;

export default meta;
type Story = StoryObj<UIRadioButton>;

export const Simple: Story = {};

export const WithDescription: Story = {
  args: {
    label: 'Ricarica rapida',
    description: 'Riduce il tempo necessario per completare la ricarica',
  },
};

export const Selected: Story = {
  render: (args) => ({
    props: { ...args, selectedValue: args.value },
    template: `
      <ui-radio-button-group ariaLabel="Metodo di ricarica" [(value)]="selectedValue">
        <ui-radio-button [value]="value" [label]="label" [description]="description"></ui-radio-button>
      </ui-radio-button-group>
    `,
  }),
};

export const Error: Story = {
  args: {
    invalid: true,
    errorText: 'Seleziona un metodo disponibile',
    description: 'Riduce il tempo necessario per completare la ricarica',
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
      <ui-radio-button-group ariaLabel="Metodo di ricarica" [(value)]="selectedValue">
        <ui-radio-button value="fast" label="Ricarica rapida"></ui-radio-button>
        <ui-radio-button
          value="standard"
          label="Ricarica standard"
          description="Utilizza la potenza disponibile normalmente"
        ></ui-radio-button>
      </ui-radio-button-group>
      <p>Valore selezionato: {{ selectedValue }}</p>
    `,
  }),
};

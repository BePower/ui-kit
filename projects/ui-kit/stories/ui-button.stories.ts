import { type Meta, moduleMetadata, type StoryObj,  } from '@storybook/angular-vite';

import { UIButton } from '../src/lib/components/button/ui-button';
import { UIIcon } from '../src/lib/components/icon/ui-icon';
import { UIP } from '../src/lib/components/p/ui-p';


const meta = {
  title: 'Components/Button',
  component: UIButton,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [UIButton, UIIcon, UIP] })],
  parameters: {
    layout: 'fullscreen'
  },
  args: {
    ariaLabel: 'Continua',
    disabled: false,
    expand: false,
    isLoading: false,
    size: 'default',
    variant: 'primary',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outlined'],
    },
    size: {
      control: 'select',
      options: ['default', 'icon', 'min-icon', 'inline'],
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-button
        [ariaHidden]="ariaHidden"
        [ariaLabel]="ariaLabel"
        [disabled]="disabled"
        [expand]="expand"
        [isLoading]="isLoading"
        [size]="size"
        [variant]="variant"
      >
        Continua
      </ui-button>
    `,
  }),
} satisfies Meta<UIButton>;

export default meta;
type Story = StoryObj<UIButton>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: {
    ariaLabel: 'Annulla',
    variant: 'secondary',
  },
};

export const Outlined: Story = {
  args: {
    ariaLabel: 'Scopri di più',
    variant: 'outlined',
  },
};

export const Expanded: Story = {
  args: {
    expand: true,
  },
  parameters: {
    layout: 'padded',
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const IconOnly: Story = {
  args: {
    ariaLabel: 'Aggiungi elemento',
    size: 'icon',
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-button [ariaLabel]="ariaLabel" [disabled]="disabled" size="icon">
        <ui-icon slot="icon-only" name="plus" fill="no-fill"></ui-icon>
      </ui-button>
    `,
  }),
};

export const InlineAction: Story = {
  args: {
    ariaLabel: undefined,
    size: 'inline',
    variant: 'secondary',
  },
  render: () => ({
    template: `
      <div style="max-inline-size: 340px">
        <ui-p>
          Scopri tutti i vantaggi disponibili.
          <ui-button size="inline" variant="secondary">Leggi i dettagli</ui-button>
        </ui-p>
      </div>
    `,
  }),
};

import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular-vite';

import { UITitle } from '../src/lib/components/title/ui-title';

const meta = {
  title: 'Components/Title',
  component: UITitle,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [UITitle] })],
  parameters: {
    layout: 'padded',
  },
  args: {
    color: 'default-grey',
    size: 'l',
  },
  argTypes: {
    color: {
      control: 'select',
      options: ['default-grey', 'primary', 'secondary', 'white', 'green'],
    },
    size: {
      control: 'inline-radio',
      options: ['xl', 'l', 'm', 's'],
    },
  },
  render: (args) => ({
    props: args,
    template: `<ui-title [ariaHidden]="ariaHidden" [ariaLabel]="ariaLabel" [color]="color" [size]="size">Titolo della sezione</ui-title>`,
  }),
} satisfies Meta<UITitle>;

export default meta;
type Story = StoryObj<UITitle>;

export const Playground: Story = {};

export const Scale: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 16px">
        <ui-title size="xl">Titolo XL — H1</ui-title>
        <ui-title size="l">Titolo L — H2</ui-title>
        <ui-title size="m">Titolo M — H3</ui-title>
        <ui-title size="s">Titolo S — H4</ui-title>
      </div>
    `,
  }),
};

export const AccessibleNameOverride: Story = {
  args: {
    ariaLabel: 'Titolo esteso per lo screen reader',
  },
};

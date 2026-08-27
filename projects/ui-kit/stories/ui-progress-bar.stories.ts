import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular-vite';

import { UIProgressBar } from '../src/lib/components/progress-bar/ui-progress-bar';

const meta = {
  title: 'Components/Progress bar',
  component: UIProgressBar,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [UIProgressBar] })],
  parameters: {
    layout: 'padded',
  },
  args: {
    ariaLabel: 'Avanzamento della procedura',
    ariaValueText: '2 di 4',
    value: 0.5,
  },
  argTypes: {
    value: {
      control: {
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-progress-bar
        [ariaHidden]="ariaHidden"
        [ariaLabel]="ariaLabel"
        [ariaValueText]="ariaValueText"
        [value]="value"
      ></ui-progress-bar>
    `,
  }),
} satisfies Meta<UIProgressBar>;

export default meta;
type Story = StoryObj<UIProgressBar>;

export const Step: Story = {};

export const Start: Story = {
  args: {
    ariaValueText: '1 di 4',
    value: 0.25,
  },
};

export const Complete: Story = {
  args: {
    ariaValueText: '4 di 4',
    value: 1,
  },
};

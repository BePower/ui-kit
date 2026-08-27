import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular-vite';

import { iconMap } from '../src/lib/components/icon/icon-map';
import { UIIcon } from '../src/lib/components/icon/ui-icon';
import type { IconName } from '../src/lib/interfaces/icon.interface';

const iconNames = Object.keys(iconMap).sort() as IconName[];

const meta = {
  title: 'Components/Icon',
  component: UIIcon,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [UIIcon] })],
  parameters: {
    layout: 'centered',
  },
  args: {
    color: 'default-grey',
    fill: 'no-fill',
    name: 'wallet',
    size: '24',
  },
  argTypes: {
    color: {
      control: 'select',
      options: ['default-grey', 'primary', 'secondary', 'white', 'green'],
    },
    fill: {
      control: 'inline-radio',
      options: ['fill', 'no-fill'],
    },
    name: {
      control: 'select',
      options: iconNames,
    },
    size: {
      control: 'inline-radio',
      options: ['16', '24', '36', '40', '48'],
    },
  },
  render: (args) => ({
    props: args,
    template: `<ui-icon [color]="color" [fill]="fill" [name]="name" [size]="size"></ui-icon>`,
  }),
} satisfies Meta<UIIcon>;

export default meta;
type Story = StoryObj<UIIcon>;

export const Playground: Story = {};

export const Scale: Story = {
  render: (args) => ({
     props: args,
    template: `
      <div style="display: flex; align-items: center; gap: 24px">
        <ui-icon [name]="name" [fill]="fill" size="16" [color]="color"></ui-icon>
        <ui-icon [name]="name" [fill]="fill" size="24" [color]="color"></ui-icon>
        <ui-icon [name]="name" [fill]="fill" size="36" [color]="color"></ui-icon>
        <ui-icon [name]="name" [fill]="fill" size="40" [color]="color"></ui-icon>
        <ui-icon [name]="name" [fill]="fill" size="48" [color]="color"></ui-icon>
      </div>
    `,
  }),
};

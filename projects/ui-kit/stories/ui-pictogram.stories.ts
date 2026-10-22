import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular-vite';

import { pictogramMap } from '../src/lib/components/pictogram/pictogram-map';
import { UIPictogram } from '../src/lib/components/pictogram/ui-pictogram';
import type { PictogramName } from '../src/lib/interfaces/pictogram.interface';

const pictogramNames = Object.keys(pictogramMap).sort() as PictogramName[];

const meta = {
  title: 'Components/Pictogram',
  component: UIPictogram,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [UIPictogram] })],
  parameters: {
    layout: 'centered',
  },
  args: {
    name: 'placeholder',
    size: '64',
  },
  argTypes: {
    name: {
      control: 'select',
      options: pictogramNames,
    },
    size: {
      control: 'inline-radio',
      options: ['48', '64', '96', '128'],
    },
  },
  render: (args) => ({
    props: args,
    template: `<ui-pictogram [name]="name" [size]="size"></ui-pictogram>`,
  }),
} satisfies Meta<UIPictogram>;

export default meta;
type Story = StoryObj<UIPictogram>;

export const Playground: Story = {};

export const Scale: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; align-items: end; gap: 24px">
        <ui-pictogram [name]="name" size="48"></ui-pictogram>
        <ui-pictogram [name]="name" size="64"></ui-pictogram>
        <ui-pictogram [name]="name" size="96"></ui-pictogram>
        <ui-pictogram [name]="name" size="128"></ui-pictogram>
      </div>
    `,
  }),
};

import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular-vite';

import { UIP } from '../src/lib/components/p/ui-p';
import { UIText } from '../src/lib/components/text/ui-text';

const meta = {
  title: 'Components/Text',
  component: UIText,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [UIP, UIText] })],
  parameters: {
    layout: 'padded',
  },
  args: {
    color: 'default-grey',
    variant: 'inherit',
  },
  argTypes: {
    color: {
      control: 'select',
      options: ['default-grey', 'primary', 'secondary', 'white', 'green'],
    },
    variant: {
      control: 'select',
      options: ['inherit', 'body-l', 'body-m', 'body-s', 'label-l', 'label-m', 'label-s'],
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-p>
        Questo testo contiene
        <ui-text [color]="color" [variant]="variant">un frammento inline</ui-text>.
      </ui-p>
    `,
  }),
} satisfies Meta<UIText>;

export default meta;
type Story = StoryObj<UIText>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 12px">
        <ui-p>Body L: <ui-text variant="body-l">testo di esempio</ui-text></ui-p>
        <ui-p>Body M: <ui-text variant="body-m">testo di esempio</ui-text></ui-p>
        <ui-p>Body S: <ui-text variant="body-s">testo di esempio</ui-text></ui-p>
        <ui-p>Label L: <ui-text variant="label-l">testo di esempio</ui-text></ui-p>
        <ui-p>Label M: <ui-text variant="label-m">testo di esempio</ui-text></ui-p>
        <ui-p>Label S: <ui-text variant="label-s">testo di esempio</ui-text></ui-p>
      </div>
    `,
  }),
};

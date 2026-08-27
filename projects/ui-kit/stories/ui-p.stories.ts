import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular-vite';

import { UIButton } from '../src/lib/components/button/ui-button';
import { UIP } from '../src/lib/components/p/ui-p';
import { UIText } from '../src/lib/components/text/ui-text';

const meta = {
  title: 'Components/Paragraph',
  component: UIP,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [UIButton, UIP, UIText] })],
  parameters: {
    layout: 'padded',
  },
  render: (args) => ({
    props: args,
    template: `<ui-p [ariaHidden]="ariaHidden">Questo è un paragrafo con tipografia body-m.</ui-p>`,
  }),
} satisfies Meta<UIP>;

export default meta;
type Story = StoryObj<UIP>;

export const Default: Story = {};

export const InlineTypography: Story = {
  render: () => ({
    template: `
      <ui-p>
        Testo standard con
        <ui-text color="green" variant="label-m">un’etichetta inline</ui-text>
        e <ui-text variant="body-s">un dettaglio secondario</ui-text>.
      </ui-p>
    `,
  }),
};

export const InlineAction: Story = {
  render: () => ({
    template: `
      <div style="max-inline-size: 360px">
        <ui-p>
          Accedi all’area dedicata per scoprire vantaggi e premi.
          <ui-button size="inline" variant="secondary">Consulta il manifesto</ui-button>.
        </ui-p>
      </div>
    `,
  }),
};

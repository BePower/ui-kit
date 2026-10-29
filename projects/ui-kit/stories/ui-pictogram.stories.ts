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
    docs: {
      description: {
        component: [
          'Use **Contextual** pictograms to reinforce what a screen or feature is about.',
          'Use **Status** pictograms (`positive`, `negative`, `info`) for objective, verifiable system outcomes.',
          '**Feedback** pictograms represent an explicit subjective evaluation by the user, but are not yet available in this component.',
          'Do not use feedback faces to represent technical success or failure. Pictograms are decorative and must accompany text.',
        ].join('\n\n'),
      },
    },
  },
  args: {
    name: 'wallet',
    size: 'm',
  },
  argTypes: {
    name: {
      control: 'select',
      options: pictogramNames,
    },
    size: {
      control: 'inline-radio',
      options: ['s', 'm', 'l'],
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

export const SemanticSizes: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; align-items: end; gap: 24px">
        <ui-pictogram [name]="name" size="s"></ui-pictogram>
        <ui-pictogram [name]="name" size="m"></ui-pictogram>
        <ui-pictogram [name]="name" size="l"></ui-pictogram>
      </div>
    `,
  }),
};

export const UsageGuidelines: Story = {
  parameters: {
    controls: { disable: true },
  },
  render: () => ({
    template: `
      <div style="display: grid; gap: 32px; max-width: 760px; font-family: var(--ion-font-family, sans-serif)">
        <header>
          <h2 style="margin: 0 0 8px">Choose by meaning</h2>
          <p style="margin: 0">
            Is it the screen context, an objective system outcome, or an explicit user evaluation?
          </p>
        </header>

        <section style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px">
          <article>
            <ui-pictogram name="email-verificata" size="m" />
            <h3>Contextual</h3>
            <p><strong>What is this screen about?</strong></p>
            <p>Reinforces content, functionality, or context, such as a verified email or charging flow.</p>
          </article>

          <article>
            <ui-pictogram name="positive" size="m" />
            <h3>Status</h3>
            <p><strong>What happened?</strong></p>
            <p>Communicates an objective, verifiable outcome. Use positive, negative, or info.</p>
          </article>

          <article>
            <h3>Feedback</h3>
            <p><strong>How does the user evaluate the experience?</strong></p>
            <p>Reserved for an explicit subjective choice. This family is not implemented yet.</p>
          </article>
        </section>

        <aside style="border-inline-start: 4px solid currentColor; padding-inline-start: 16px">
          <strong>Do:</strong> pair every decorative pictogram with explanatory text.<br />
          <strong>Don’t:</strong> use feedback faces to represent technical success or failure.
        </aside>
      </div>
    `,
  }),
};

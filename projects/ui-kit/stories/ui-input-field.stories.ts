import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular-vite';

import { UIIcon } from '../src/lib/components/icon/ui-icon';
import { UIInputField } from '../src/lib/components/input-field/ui-input-field';

const meta = {
  title: 'Components/Input Field',
  component: UIInputField,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [UIInputField, UIIcon] })],
  parameters: { layout: 'padded' },
  args: {
    label: 'Label',
    placeholder: 'Placeholder text',
    bottomText: 'Bottom text here',
    disabled: false,
    invalid: false,
    readonly: false,
    required: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-input-field
        style="display: block; inline-size: 100%"
        [label]="label"
        [placeholder]="placeholder"
        [bottomText]="bottomText"
        [errorText]="errorText"
        [disabled]="disabled"
        [invalid]="invalid"
        [readonly]="readonly"
        [required]="required"
      ></ui-input-field>
    `,
  }),
} satisfies Meta<UIInputField>;

export default meta;
type Story = StoryObj<UIInputField>;

export const Default: Story = {};

export const Filled: Story = {
  args: { value: 'Filled' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Error: Story = {
  args: { errorText: 'Bottom text here', value: 'Filled' },
};

export const WithIcons: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ui-input-field
        style="display: block; inline-size: 100%"
        label="Label"
        placeholder="Placeholder text"
        bottomText="Bottom text here"
      >
        <ui-icon slot="left" name="lens" fill="no-fill" size="24"></ui-icon>
        <ui-icon slot="right" name="info" fill="no-fill" size="24"></ui-icon>
      </ui-input-field>
    `,
  }),
};

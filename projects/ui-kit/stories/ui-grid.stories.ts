import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular-vite';

import { UICol } from '../src/lib/components/col/ui-col';
import type { UIColSize } from '../src/lib/components/col/ui-col';
import { UIGrid } from '../src/lib/components/grid/ui-grid';
import { UIRow } from '../src/lib/components/row/ui-row';
import { UIPage } from '../src/lib/components/page/ui-page';
import type { UIAlignment } from '../src/lib/interfaces/alignment.type';
import type {
  UIHorizontalSpacing,
  UISpacing,
  UIVerticalSpacing,
} from '../src/lib/interfaces/spacing.type';

type GridPlaygroundArgs = {
  uiColAlign: UIAlignment;
  uiColFirstSize: UIColSize;
  uiColHorizontal: UIHorizontalSpacing;
  uiColJustify: UIAlignment;
  uiColSecondSize: UIColSize;
  uiGridFixed: boolean;
  uiGridHorizontal: UIHorizontalSpacing;
  uiRowBottom: UIVerticalSpacing;
  uiRowGap: UISpacing;
  uiRowTop: UIVerticalSpacing;
};

const meta = {
  title: 'Components/Grid',
  component: UIGrid,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [UIGrid, UIRow, UICol, UIPage] })],
  parameters: {
    docs: {
      description: {
        component: [
          '### Reading the playground',
          '',
          'The playground shows the grid composition: **ui-grid → ui-row → ui-col**.',
          'The dashed border identifies the space available to each column;',
          'the coloured block inside makes the alignment rules visible.',
          '',
          '#### ui-grid',
          '',
          'It is the outer container. `uiGridHorizontal` applies the grid’s horizontal margin,',
          'while `uiGridFixed` enables Ionic’s maximum widths and centring at desktop breakpoints.',
          '',
          '#### ui-row',
          '',
          'It groups columns. `uiRowTop` and `uiRowBottom` add vertical spacing,',
          'while `uiRowGap` defines the gutter between columns without changing their proportions.',
          '',
          '#### ui-col',
          '',
          '`uiColFirstSize` and `uiColSecondSize` set how many of the grid’s 12 units',
          'each column occupies. `uiColHorizontal` adds horizontal inset to the column;',
          '`uiColJustify` and `uiColAlign` show how inner content is positioned',
          'within the area delimited by the border.',
        ].join('\n'),
      },
    },
    layout: 'fullscreen',
  },
  args: {
    uiColAlign: 'start',
    uiColFirstSize: '6',
    uiColHorizontal: 'none',
    uiColJustify: 'start',
    uiColSecondSize: '6',
    uiGridFixed: false,
    uiGridHorizontal: 'xs',
    uiRowBottom: 'none',
    uiRowGap: 'xxs',
    uiRowTop: 'none',
  },
  argTypes: {
    uiColAlign: {
      control: 'select',
      options: ['start', 'center', 'end'],
    },
    uiColFirstSize: {
      control: 'select',
      options: ['auto', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    },
    uiColHorizontal: {
      control: 'select',
      options: ['none', 'xxxs', 'xxs', 'xs', 's', 'm'],
    },
    uiColJustify: {
      control: 'select',
      options: ['start', 'center', 'end'],
    },
    uiColSecondSize: {
      control: 'select',
      options: ['auto', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
    },
    uiGridHorizontal: {
      control: 'select',
      options: ['none', 'xxxs', 'xxs', 'xs', 's', 'm'],
    },
    uiRowBottom: {
      control: 'select',
      options: ['none', 'xxxs', 'xxs', 'xs', 's', 'm', 'l'],
    },
    uiRowGap: {
      control: 'select',
      options: ['none', 'xxxs', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl'],
    },
    uiRowTop: {
      control: 'select',
      options: ['none', 'xxxs', 'xxs', 'xs', 's', 'm', 'l'],
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <ui-page background="grey" screenReaderTitle="Grid playground">
        <ui-grid [fixed]="uiGridFixed" [horizontal]="uiGridHorizontal">
          <ui-row [bottom]="uiRowBottom" [gap]="uiRowGap" [top]="uiRowTop">
            <ui-col
              [align]="uiColAlign"
              [horizontal]="uiColHorizontal"
              [justify]="uiColJustify"
              [size]="uiColFirstSize"
            >
              <div
                style="border: 1px dashed currentcolor; box-sizing: border-box; display: flex; min-block-size: 112px; width: 100%"
                [style.align-items]="uiColAlign"
                [style.justify-content]="uiColJustify"
              >
                <div style="background: blue; padding: 16px">
                  <strong>Column 1</strong>
                  <span style="display: block; margin-top: 8px">Size: {{ uiColFirstSize }}</span>
                </div>
              </div>
            </ui-col>
            <ui-col
              [align]="uiColAlign"
              [horizontal]="uiColHorizontal"
              [justify]="uiColJustify"
              [size]="uiColSecondSize"
            >
              <div
                style="border: 1px dashed currentcolor; box-sizing: border-box; display: flex; min-block-size: 112px; width: 100%"
                [style.align-items]="uiColAlign"
                [style.justify-content]="uiColJustify"
              >
                <div style="background: green; padding: 16px">
                  <strong>Column 2</strong>
                  <span style="display: block; margin-top: 8px">Size: {{ uiColSecondSize }}</span>
                </div>
              </div>
            </ui-col>
          </ui-row>
          <ui-row [gap]="uiRowGap">
            <ui-col
              [align]="uiColAlign"
              [horizontal]="uiColHorizontal"
              [justify]="uiColJustify"
              [size]="uiColFirstSize"
            >
              <div
                style="border: 1px dashed currentcolor; box-sizing: border-box; display: flex; min-block-size: 112px; width: 100%"
                [style.align-items]="uiColAlign"
                [style.justify-content]="uiColJustify"
              >
                <div style="background: red; padding: 16px">
                  <strong>Column 1</strong>
                  <span style="display: block; margin-top: 8px">Size: {{ uiColFirstSize }}</span>
                </div>
              </div>
            </ui-col>
            <ui-col
              [align]="uiColAlign"
              [horizontal]="uiColHorizontal"
              [justify]="uiColJustify"
              [size]="uiColSecondSize"
            >
              <div
                style="border: 1px dashed currentcolor; box-sizing: border-box; display: flex; min-block-size: 112px; width: 100%"
                [style.align-items]="uiColAlign"
                [style.justify-content]="uiColJustify"
              >
                <div style="background: yellow; padding: 16px">
                  <strong>Column 2</strong>
                  <span style="display: block; margin-top: 8px">Size: {{ uiColSecondSize }}</span>
                </div>
              </div>
            </ui-col>
          </ui-row>
        </ui-grid>
      </ui-page>
    `,
  }),
} satisfies Meta<GridPlaygroundArgs>;

export default meta;
type Story = StoryObj<GridPlaygroundArgs>;

export const Playground: Story = {};

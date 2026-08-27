import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular-vite';
import { IonApp } from '@ionic/angular/standalone';

import { UIP } from '../src/lib/components/p/ui-p';
import { type HeaderStep, UIPage } from '../src/lib/components/page/ui-page';
import { UITitle } from '../src/lib/components/title/ui-title';
import { UIButton } from '../src/lib/components/button/ui-button';

const defaultHeaderStep: HeaderStep = {
  ariaLabel: 'Avanzamento della procedura',
  currentStep: 2,
  label: 'di',
  totalSteps: 4,
};

type UIPageStoryArgs = {
  background: 'white' | 'grey' | 'light-green' | 'green' | 'yellow';
  condensedHeader: boolean;
  hasFooter: boolean;
  hasHeader: boolean;
  headerStep?: HeaderStep;
  headerType: 'white' | 'green' | 'tab' | 'step';
  title: string;
  translucent: boolean;
};

const meta = {
  title: 'Components/Page',
  component: UIPage,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [IonApp, UIPage, UIP, UITitle, UIButton] })],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    background: 'white',
    condensedHeader: false,
    hasFooter: false,
    hasHeader: true,
    headerStep: defaultHeaderStep,
    headerType: 'white',
    title: 'Titolo della pagina',
    translucent: false,
  },
  argTypes: {
    background: {
      control: 'select',
      options: ['white', 'grey', 'light-green', 'green', 'yellow'],
    },
    headerType: {
      control: 'select',
      options: ['white', 'green', 'tab', 'step'],
    },
    headerStep: {
      control: 'object',
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <ion-app style="block-size: 100dvh">
        <ui-page
          [background]="background"
          [condensedHeader]="condensedHeader"
          [hasFooter]="hasFooter"
          [hasHeader]="hasHeader"
          [headerStep]="headerStep"
          [headerType]="headerType"
          [title]="title"
          [translucent]="translucent"
        >
            <ui-title size="xl">Contenuto della pagina</ui-title>
            <ui-p>Questa story mostra la composizione di base di ui-page dentro ion-app.</ui-p>
            <ui-p>Scorri per verificare l’elevation dell’header e del footer.</ui-p>
            <ui-p>Il ciclo di vita del router e la status bar nativa non fanno parte di questo canvas.</ui-p>
            <ui-p>Il contenuto aggiuntivo permette di osservare il comportamento di scroll.</ui-p>
            <ui-p>Il footer riceve elevation solo quando copre ancora contenuto.</ui-p>
            <ui-p>Questa è una riga aggiuntiva per estendere il contenuto della story.</ui-p>
            <ui-p>Questa è un’altra riga aggiuntiva per estendere il contenuto della story.</ui-p>
            <ui-p>Fine del contenuto di esempio.</ui-p>
            <ui-button ariaLabel="prima call" footer variant="primary" expand>
              Call to action
            </ui-button>
            <ui-button ariaLabel="seconda call" footer variant="secondary" expand>
              Call to action
            </ui-button>

        </ui-page>
      </ion-app>
    `,
  }),
} satisfies Meta<UIPageStoryArgs>;

export default meta;
type Story = StoryObj<UIPageStoryArgs>;

export const Default: Story = {
  args: {
    hasHeader: true,
    headerType: 'step',
  },
};

export const GreenHeader: Story = {
  args: {
    headerType: 'green',
  },
};

export const StepHeader: Story = {
  args: {
    headerType: 'step',
  },
};

export const WithFooter: Story = {
  args: {
    hasFooter: true,
  },
};

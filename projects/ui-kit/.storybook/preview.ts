import { applicationConfig, type Preview } from '@storybook/angular-vite';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { INITIAL_VIEWPORTS } from 'storybook/viewport';

import './preview.scss';

const preview: Preview = {
  decorators: [
    applicationConfig({
      providers: [provideIonicAngular({ animated: false, mode: 'ios' })],
    }),
  ],
  parameters: {
    actions: {
      argTypesRegex: '^on[A-Z].*',
    },
    controls: {
      expanded: true,
    },
    a11y: {
      test: 'todo',
    },
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
   initialGlobals: {
    viewport: { value: 'iphone12mini', isRotated: false },
  },
};

export default preview;

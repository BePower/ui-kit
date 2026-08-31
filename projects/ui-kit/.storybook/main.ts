import type { StorybookConfig } from '@storybook/angular-vite';
import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';

const uiKitRoot = fileURLToPath(new URL('..', import.meta.url));
const uiKitBase = fileURLToPath(new URL('../src/lib/foundations/base.scss', import.meta.url));
const sourceSansRoot = fileURLToPath(new URL('../../../node_modules/source-sans', import.meta.url));

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.ts'],
  staticDirs: ['../public'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/angular-vite',
    options: {
      compodoc: false,
    },
  },
  viteFinal: async (config) =>
    mergeConfig(config, {
      resolve: {
        alias: {
          '@bepower/ui-kit/base': uiKitBase,
        },
      },
      server: {
        fs: {
          allow: [...(config.server?.fs?.allow ?? [uiKitRoot]), sourceSansRoot],
        },
      },
    }),
};

export default config;

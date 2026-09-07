import angular from '@analogjs/vite-plugin-angular';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Transform source files for TestBed in memory. Never build or resolve dist/ui-kit.
  plugins: [angular({ tsconfig: 'projects/ui-kit/tsconfig.spec.json', jit: true })],
  css: {
    preprocessorOptions: {
      scss: { loadPaths: ['projects/ui-kit/src/lib'] },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['testing/setup.ts'],
    include: ['projects/ui-kit/src/**/*.spec.ts'],
    restoreMocks: true,
    unstubGlobals: true,
    maxWorkers: 2,
    server: { deps: { inline: [/@ionic\//, /@stencil\//] } },
    coverage: {
      provider: 'v8',
      include: ['projects/ui-kit/src/lib/**/*.ts'],
      exclude: [
        '**/*.spec.ts',
        '**/*.stories.ts',
        '**/interfaces/**',
        '**/*.interface.ts',
        '**/icons/**',
      ],
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      reportsDirectory: 'coverage',
      thresholds: { lines: 95, statements: 95, functions: 95, branches: 90 },
    },
  },
});

import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';
import { collectInventory } from './figma-inventory.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const lib = `${root}projects/ui-kit/src/lib`;
const read = (path) => readFile(`${root}${path}`, 'utf8');
const data = { colors: {}, numbers: {}, typography: {}, button: {}, icons: {} };

// Ask Sass to evaluate its own modules, rather than reimplementing Sass resolution.
sass.compileString(
  `
  @use 'sass:meta';
  @use 'sass:math';
  @use 'foundations/colors';
  @use 'foundations/sizes';
  @use 'foundations/spacing';
  @each $name, $value in meta.module-variables('colors') {
    @if meta.type-of($value) == color { $_: capture($name, $value); }
  }
  @each $module in ('sizes', 'spacing') {
    @each $name, $value in meta.module-variables($module) {
      @if meta.type-of($value) == number {
        @if math.unit($value) == 'rem' { $_: capture($name, math.div($value, 1rem) * 16); }
        @else { $_: capture($name, $value); }
      }
    }
  }`,
  {
    loadPaths: [lib],
    functions: {
      'capture($name, $value)': ([name, value]) => {
        if (value instanceof sass.SassColor) {
          const rgb = value.toSpace('rgb');
          data.colors[name.text] = {
            r: rgb.channel('red') / 255,
            g: rgb.channel('green') / 255,
            b: rgb.channel('blue') / 255,
            a: rgb.alpha,
          };
        } else {
          data.numbers[name.text] = value.assertNumber().value;
        }
        return sass.sassNull;
      },
    },
  },
);

const typographySource = await read('projects/ui-kit/src/lib/foundations/typography.scss');
for (const [, name] of typographySource.matchAll(/@mixin ([\w-]+)\s*\{/g)) {
  const css = sass.compileString(
    `@use 'foundations/typography'; .sample { @include typography.${name}; }`,
    { loadPaths: [lib] },
  ).css;
  const property = (key) => css.match(new RegExp(`${key}: ([^;]+);`))?.[1];
  const px = (value) => parseFloat(value) * (value.endsWith('rem') ? 16 : 1);
  data.typography[name] = {
    size: px(property('font-size')),
    lineHeight: px(property('line-height')),
    weight: Number(property('font-weight')),
    underline: property('text-decoration-line') === 'underline',
    uppercase: property('text-transform') === 'uppercase',
  };
}
const buttonSource = await read('projects/ui-kit/src/lib/components/button/ui-button.scss');
const css = sass.compileString(buttonSource.replace("@use '@ionic/angular/css/core.css';", ''), {
  loadPaths: [lib],
}).css;
const required = (pattern) => {
  const value = css.match(pattern)?.[1];
  if (!value) throw new Error(`UIButton mapping no longer matches source: ${pattern}`);
  return parseFloat(value) * (value.endsWith('rem') ? 16 : 1);
};
data.button = {
  height: required(/min-height: ([^;]+);/),
  paddingX: required(/--padding-start: ([^;]+);/),
  paddingY: required(/--padding-top: ([^;]+);/),
  radius: required(/--border-radius: ([^;]+);/),
  disabledOpacity: required(/opacity: ([^;]+);/),
};
Object.assign(data, await collectInventory(root, read));
const fontSource = await read('projects/ui-kit/src/lib/foundations/base.scss');
data.fontFamily = fontSource.match(/--ion-font-family:\s*'([^']+)'/)?.[1];
if (!data.fontFamily) throw new Error('Missing foundation font family');
const output = `${root}figma-plugin/dist`;
await mkdir(output, { recursive: true });
await writeFile(
  `${output}/code.js`,
  `const DATA = ${JSON.stringify(data)};\n${await read('figma-plugin/components.js')}\n${await read('figma-plugin/catalog.js')}\n${await read('figma-plugin/plugin.js')}`,
);
await writeFile(
  `${output}/manifest.json`,
  JSON.stringify(
    {
      name: 'BePower UI Kit · repository pilot',
      id: 'bepower-ui-kit-repository-pilot',
      api: '1.0.0',
      main: 'code.js',
      editorType: ['figma'],
      documentAccess: 'dynamic-page',
      networkAccess: { allowedDomains: ['none'] },
    },
    null,
    2,
  ),
);
await writeFile(`${output}/tokens.json`, JSON.stringify(data, null, 2));
console.log('Figma plugin generated in figma-plugin/dist (manifest.json, code.js, tokens.json)');

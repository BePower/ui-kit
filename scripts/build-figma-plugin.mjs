import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import * as sass from 'sass';
import ts from 'typescript';
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
const sources = await Promise.all(
  ['figma-plugin/components.js', 'figma-plugin/catalog.js', 'figma-plugin/plugin.js'].map(read),
);
const rgba = (name) => {
  const { r, g, b, a } = data.colors[name];
  return `rgba(${[r, g, b].map((value) => Math.round(value * 255)).join(',')},${a})`;
};
const uiTokens = {
  space: `${data.numbers['spacing-xxs']}px`,
  border: `${data.numbers['size-20']}px`,
  font: JSON.stringify(data.fontFamily),
  bodySize: `${data.typography['p-s'].size}px`,
  bodyLine: `${data.typography['p-s'].lineHeight}px`,
  titleSize: `${data.typography['title-m'].size}px`,
  titleLine: `${data.typography['title-m'].lineHeight}px`,
  titleWeight: data.typography['title-m'].weight,
  background: rgba('color-background-white'),
  surface: rgba('color-background-grey'),
  foreground: rgba('color-grey-default-grey'),
  accent: rgba('color-primary-e-mobility-green'),
  error: rgba('color-error-allert-red'),
};
const statusTemplate = await read('figma-plugin/status.html');
if (!statusTemplate.includes('/* TOKENS */')) throw new Error('Missing status panel tokens marker');
const statusHtml = statusTemplate.replace(
  '/* TOKENS */',
  Object.entries(uiTokens)
    .map(([name, value]) => `--${name}: ${value};`)
    .join('\n'),
);
// Do not require the Figma sandbox to parse newer syntax just because Node accepts it.
const compiled = ts.transpileModule(
  `const DATA = ${JSON.stringify(data)};\nconst STATUS_HTML = ${JSON.stringify(statusHtml)};\n${sources.join('\n')}`,
  {
    fileName: 'plugin.js',
    compilerOptions: { target: ts.ScriptTarget.ES2017, module: ts.ModuleKind.None },
    reportDiagnostics: true,
  },
);
const errors = (compiled.diagnostics || []).filter(
  (item) => item.category === ts.DiagnosticCategory.Error,
);
if (errors.length) {
  throw new Error(
    ts.formatDiagnosticsWithColorAndContext(errors, {
      getCanonicalFileName: (name) => name,
      getCurrentDirectory: () => root,
      getNewLine: () => '\n',
    }),
  );
}
const body = compiled.outputText;
const buildId = createHash('sha256').update(body).digest('hex').slice(0, 12);
await writeFile(`${output}/code.js`, `const BUILD_ID = ${JSON.stringify(buildId)};\n${body}`);
await writeFile(`${output}/build-info.json`, JSON.stringify({ buildId, main: 'code.js' }, null, 2));
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
console.log(
  `BePower build ${buildId} generated in figma-plugin/dist. Import the manifest from this same local directory in Figma Desktop.`,
);

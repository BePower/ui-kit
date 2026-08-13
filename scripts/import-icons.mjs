#!/usr/bin/env node

import { mkdir, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, '..');
const importDirectory = resolve(projectRoot, 'icons');
const iconDirectory = resolve(
  projectRoot,
  'projects/ui-kit/src/lib/components/icon',
);
const generatedIconDirectory = resolve(iconDirectory, 'icons');
const assetDirectory = resolve(iconDirectory, 'assets');
const stagingDirectory = resolve(iconDirectory, '.icons-importing');
const iconMapPath = resolve(iconDirectory, 'icon-map.ts');
const iconMapInterfacePath = resolve(iconDirectory, 'icon-map.interface.ts');
const iconFileName = /^([a-z0-9]+(?:-[a-z0-9]+)*)_(fill|no-fill)\.svg$/;

const usage = `Usage: npm run icons:import [-- --dry-run]

Icons are imported only from <repository>/icons.`;

function fail(message) {
  console.error(`Icon import failed: ${message}`);
  process.exitCode = 1;
}

function normalizeFills(svg) {
  return svg.replace(/\bfill=(["'])(.*?)\1/gi, (attribute, quote, value) => {
    if (value.trim().toLowerCase() === 'none') {
      return attribute;
    }

    return `fill=${quote}currentColor${quote}`;
  });
}

function toCamelCase(name) {
  return name.replace(/-([a-z0-9])/g, (_, character) => character.toUpperCase());
}

function iconExportName(name, variant) {
  return `${toCamelCase(name)}${variant === 'fill' ? 'Fill' : 'NoFill'}`;
}

function generateIconModule({ name, variants }) {
  return ['fill', 'no-fill']
    .filter(variant => variants.has(variant))
    .map(
      variant =>
        `export const ${iconExportName(name, variant)} = '${variants.get(variant)}';`,
    )
    .join('\n')
    .concat('\n');
}

function generateIconMap(icons) {
  const entries = icons
    .map(({ name, variants }) => {
      const variantEntries = ['fill', 'no-fill']
        .filter(variant => variants.has(variant))
        .map(
          variant =>
            `    '${variant}': () =>
      import('./icons/${name}').then(
        ({ ${iconExportName(name, variant)} }) => ${iconExportName(name, variant)},
      ),`,
        )
        .join('\n');

      return `  '${name}': {\n${variantEntries}\n  },`;
    })
    .join('\n');

  return `import { IconMap } from './icon-map.interface';

export const iconMap: IconMap = {
${entries}
};
`;
}

function generateIconMapInterface(icons) {
  const iconNames = icons.map(({ name }) => `  | '${name}'`).join('\n');

  return `export type IconName =
${iconNames};

export type IconVariant = 'fill' | 'no-fill';

export type IconLoader = () => Promise<string>;

export type IconMap = {
  [key in IconName]: Partial<Record<IconVariant, IconLoader>>;
};
`;
}

async function main() {
  const argumentsList = process.argv.slice(2);
  const dryRun = argumentsList.includes('--dry-run');

  if (argumentsList.includes('--help') || argumentsList.includes('-h')) {
    console.log(usage);
    return;
  }

  if (argumentsList.some(argument => argument !== '--dry-run')) {
    fail(usage);
    return;
  }

  let directoryEntries;
  try {
    if (!(await stat(importDirectory)).isDirectory()) {
      fail(`"${importDirectory}" is not a directory`);
      return;
    }
    directoryEntries = await readdir(importDirectory, { withFileTypes: true });
  } catch {
    fail(`cannot read "${importDirectory}"`);
    return;
  }

  const invalidFiles = [];
  const importedIcons = new Map();

  for (const entry of directoryEntries.sort((first, second) =>
    first.name.localeCompare(second.name),
  )) {
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.svg')) {
      continue;
    }

    const match = entry.name.match(iconFileName);
    if (!match) {
      invalidFiles.push(entry.name);
      continue;
    }

    const [, name, variant] = match;
    const variants = importedIcons.get(name) ?? new Map();
    if (variants.has(variant)) {
      invalidFiles.push(`${entry.name} duplicates ${name}_${variant}.svg`);
      continue;
    }

    variants.set(variant, resolve(importDirectory, entry.name));
    importedIcons.set(name, variants);
  }

  if (invalidFiles.length > 0) {
    fail(
      `invalid file names:\n${invalidFiles.map(file => `- ${file}`).join('\n')}`,
    );
    return;
  }

  if (importedIcons.size === 0) {
    fail('no SVG files were found');
    return;
  }

  const icons = [...importedIcons]
    .map(([name, variants]) => ({ name, variants }))
    .sort((first, second) => first.name.localeCompare(second.name));

  const generatedIcons = [];
  for (const { name, variants } of icons) {
    const encodedVariants = new Map();
    for (const variant of ['fill', 'no-fill']) {
      const sourcePath = variants.get(variant);
      if (!sourcePath) {
        continue;
      }

      const svg = normalizeFills(await readFile(sourcePath, 'utf8'));
      encodedVariants.set(
        variant,
        `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,
      );
    }

    generatedIcons.push({ name, variants: encodedVariants });
  }

  if (dryRun) {
    console.log(
      `Validated ${[...generatedIcons].reduce((total, icon) => total + icon.variants.size, 0)} SVG variants for ${icons.length} icons.`,
    );
    return;
  }

  await rm(stagingDirectory, { recursive: true, force: true });
  await mkdir(stagingDirectory, { recursive: true });
  await Promise.all(
    generatedIcons.map(icon =>
      writeFile(resolve(stagingDirectory, `${icon.name}.ts`), generateIconModule(icon)),
    ),
  );

  await rm(generatedIconDirectory, { recursive: true, force: true });
  await rename(stagingDirectory, generatedIconDirectory);
  await rm(assetDirectory, { recursive: true, force: true });
  await writeFile(iconMapPath, generateIconMap(icons));
  await writeFile(iconMapInterfacePath, generateIconMapInterface(icons));

  console.log(
    `Imported ${[...generatedIcons].reduce((total, icon) => total + icon.variants.size, 0)} SVG variants for ${icons.length} icons.`,
  );
}

await main();

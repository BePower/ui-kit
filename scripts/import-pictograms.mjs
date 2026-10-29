#!/usr/bin/env node

import { mkdir, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptDirectory, '..');
const importDirectory = resolve(projectRoot, 'pictograms');
const pictogramDirectory = resolve(projectRoot, 'projects/ui-kit/src/lib/components/pictogram');
const generatedPictogramDirectory = resolve(pictogramDirectory, 'pictograms');
const stagingDirectory = resolve(pictogramDirectory, '.pictograms-importing');
const pictogramMapPath = resolve(pictogramDirectory, 'pictogram-map.ts');
const pictogramMapInterfacePath = resolve(pictogramDirectory, 'pictogram-map.interface.ts');
const interfacesDirectory = resolve(projectRoot, 'projects/ui-kit/src/lib/interfaces');
const pictogramInterfacePath = resolve(interfacesDirectory, 'pictogram.interface.ts');
const pictogramFileName = /^([a-z0-9]+(?:-[a-z0-9]+)*)\.svg$/;

const usage = `Usage: npm run pictograms:import [-- --dry-run]

Pictograms are imported only from <repository>/pictograms.`;

function fail(message) {
  console.error(`Pictogram import failed: ${message}`);
  process.exitCode = 1;
}

function toCamelCase(name) {
  return name.replace(/-([a-z0-9])/g, (_, character) => character.toUpperCase());
}

function pictogramExportName(name) {
  return `${toCamelCase(name)}Pictogram`;
}

function generatePictogramModule({ name, dataUri }) {
  return `export const ${pictogramExportName(name)} =\n  '${dataUri}';\n`;
}

function generatePictogramMap(pictograms) {
  const entries = pictograms
    .map(({ name }) => {
      const propertyName = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name) ? name : `'${name}'`;
      const exportName = pictogramExportName(name);
      return `  ${propertyName}: () =>
    import('./pictograms/${name}').then(
      ({ ${exportName} }) => ${exportName},
    ),`;
    })
    .join('\n');

  return `import type { PictogramMap } from './pictogram-map.interface';

export const pictogramMap: PictogramMap = {
${entries}
};
`;
}

function generatePictogramInterface(pictograms) {
  const names = pictograms.map(({ name }) => `  | '${name}'`).join('\n');

  return `export type PictogramName =
${names};

export type PictogramSize = 's' | 'm' | 'l';
`;
}

function generatePictogramMapInterface() {
  return `import type { PictogramName } from '../../interfaces/pictogram.interface';

export type PictogramLoader = () => Promise<string>;

export type PictogramMap = Record<PictogramName, PictogramLoader>;
`;
}

async function main() {
  const argumentsList = process.argv.slice(2);
  const dryRun = argumentsList.includes('--dry-run');

  if (argumentsList.includes('--help') || argumentsList.includes('-h')) {
    console.log(usage);
    return;
  }

  if (argumentsList.some((argument) => argument !== '--dry-run')) {
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
  const sourcePictograms = [];

  for (const entry of directoryEntries.sort((first, second) =>
    first.name.localeCompare(second.name),
  )) {
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith('.svg')) {
      continue;
    }

    const match = entry.name.match(pictogramFileName);
    if (!match) {
      invalidFiles.push(entry.name);
      continue;
    }

    sourcePictograms.push({ name: match[1], path: resolve(importDirectory, entry.name) });
  }

  if (invalidFiles.length > 0) {
    fail(`invalid file names:\n${invalidFiles.map((file) => `- ${file}`).join('\n')}`);
    return;
  }

  if (sourcePictograms.length === 0) {
    fail('no SVG files were found');
    return;
  }

  const pictograms = await Promise.all(
    sourcePictograms.map(async ({ name, path }) => ({
      name,
      dataUri: `data:image/svg+xml;base64,${Buffer.from(await readFile(path, 'utf8')).toString('base64')}`,
    })),
  );

  if (dryRun) {
    console.log(`Validated ${pictograms.length} SVG pictograms.`);
    return;
  }

  const { format, resolveConfig } = await import('prettier');
  const prettierOptions = {
    ...(await resolveConfig(pictogramMapPath)),
    parser: 'typescript',
  };
  const formatTypeScript = (source) => format(source, prettierOptions);

  await rm(stagingDirectory, { recursive: true, force: true });
  await mkdir(stagingDirectory, { recursive: true });
  await Promise.all(
    pictograms.map(async (pictogram) =>
      writeFile(
        resolve(stagingDirectory, `${pictogram.name}.ts`),
        await formatTypeScript(generatePictogramModule(pictogram)),
      ),
    ),
  );

  await rm(generatedPictogramDirectory, { recursive: true, force: true });
  await rename(stagingDirectory, generatedPictogramDirectory);
  await mkdir(interfacesDirectory, { recursive: true });
  await writeFile(pictogramMapPath, await formatTypeScript(generatePictogramMap(pictograms)));
  await writeFile(
    pictogramMapInterfacePath,
    await formatTypeScript(generatePictogramMapInterface()),
  );
  await writeFile(
    pictogramInterfacePath,
    await formatTypeScript(generatePictogramInterface(pictograms)),
  );

  console.log(`Imported ${pictograms.length} SVG pictograms.`);
}

await main();

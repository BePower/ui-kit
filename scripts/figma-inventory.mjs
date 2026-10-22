import ts from 'typescript';
import * as sass from 'sass';
import { readdir } from 'node:fs/promises';

// TypeScript resolves aliases (including Exclude) instead of maintaining a second input list.
export async function collectInventory(root, read) {
  const base = 'projects/ui-kit/src/lib';
  const barrel = ts.createSourceFile(
    'index.ts',
    await read(`${base}/components/index.ts`),
    ts.ScriptTarget.Latest,
    true,
  );
  const paths = barrel.statements
    .filter(ts.isExportDeclaration)
    .map((node) => `${base}/components/${node.moduleSpecifier.text.slice(2)}.ts`);
  const program = ts.createProgram(
    paths.map((path) => root + path),
    {
      target: ts.ScriptTarget.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      module: ts.ModuleKind.ESNext,
      skipLibCheck: true,
    },
  );
  const checker = program.getTypeChecker();
  const components = {};
  const styles = {};
  for (const path of paths) {
    const source = program.getSourceFile(root + path);
    const declaration = source.statements.find(ts.isClassDeclaration);
    const id = path.split('/').at(-2);
    const inputs = {};
    for (const member of declaration.members) {
      if (
        !ts.isPropertyDeclaration(member) ||
        !member.initializer ||
        !ts.isCallExpression(member.initializer)
      )
        continue;
      const call = member.initializer;
      if (!['input', 'input.required'].includes(call.expression.getText(source))) continue;
      const type = call.typeArguments?.[0];
      const resolved = type ? checker.getTypeFromTypeNode(type) : null;
      const values = (resolved?.isUnion() ? resolved.types : [resolved])
        .filter(Boolean)
        .filter((value) => value.isStringLiteral() || value.isNumberLiteral())
        .map((value) => value.value);
      inputs[member.name.getText(source)] = {
        type: type?.getText(source) || 'boolean',
        default: call.arguments[0]?.getText(source) || 'undefined',
        values,
        required: call.expression.getText(source) === 'input.required',
      };
    }
    components[id] = { className: declaration.name.text, source: path, inputs };
    const scss = (await read(path.replace(/\.ts$/, '.scss'))).replace(
      /@use ['"]@ionic\/[^'"]+['"];/g,
      '',
    );
    const css = sass.compileString(scss, { loadPaths: [root + base] }).css;
    styles[id] = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({
      selector: selector.trim(),
      declarations: Object.fromEntries(
        body
          .split(';')
          .map((item) => {
            const index = item.indexOf(':');
            return index < 0 ? null : [item.slice(0, index).trim(), item.slice(index + 1).trim()];
          })
          .filter(Boolean),
      ),
    }));
  }
  const registry = ts.createSourceFile(
    'icon-map.ts',
    await read(`${base}/components/icon/icon-map.ts`),
    ts.ScriptTarget.Latest,
    true,
  );
  const map = registry.statements
    .filter(ts.isVariableStatement)
    .flatMap((node) => node.declarationList.declarations)
    .find((node) => node.name.getText(registry) === 'iconMap').initializer;
  const icons = {};
  const files = new Set(await readdir(root + 'icons'));
  for (const entry of map.properties) {
    const name = entry.name.text;
    icons[name] = {};
    for (const variant of entry.initializer.properties) {
      const fill = variant.name.text;
      const filename = `${name}_${fill}.svg`;
      if (!files.has(filename)) throw new Error(`Registry SVG missing: ${filename}`);
      icons[name][fill] = await read(`icons/${filename}`);
    }
  }
  const svgCount = [...files].filter((file) => file.endsWith('.svg')).length;
  if (
    svgCount !==
    Object.values(icons).reduce((sum, variants) => sum + Object.keys(variants).length, 0)
  ) {
    throw new Error(
      'Icon sources and registry differ. Run npm run icons:import before generating Figma.',
    );
  }
  return { components, styles, icons };
}

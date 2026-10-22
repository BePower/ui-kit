import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
execFileSync(process.execPath, ['scripts/build-figma-plugin.mjs'], { cwd: root });
const source = readFileSync(new URL('dist/code.js', import.meta.url), 'utf8');
const data = JSON.parse(readFileSync(new URL('dist/tokens.json', import.meta.url), 'utf8'));
const { buildId } = JSON.parse(
  readFileSync(new URL('dist/build-info.json', import.meta.url), 'utf8'),
);

// Small in-memory Plugin API double. It checks lifecycle/identity, not Figma rendering.
function environment() {
  let sequence = 0;
  const makeId = () => `test:${++sequence}`;
  class Node {
    constructor(type) {
      this.id = makeId();
      this.type = type;
      this._children = [];
      this.parent = null;
      this.width = 100;
      this.height = 100;
      this.x = 0;
      this.y = 0;
      this.data = {};
      this.componentPropertyDefinitions = {};
      this.fills = type === 'VECTOR' ? [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }] : [];
    }
    get children() {
      return [...this._children];
    }
    appendChild(child) {
      child.remove();
      this._children.push(child);
      child.parent = this;
    }
    insertChild(index, child) {
      child.remove();
      this._children.splice(index, 0, child);
      child.parent = this;
    }
    remove() {
      if (this.parent) {
        this.parent._children = this.parent._children.filter((child) => child !== this);
        this.parent = null;
      }
    }
    findAll(predicate) {
      return this.children.flatMap((child) => [
        ...(predicate(child) ? [child] : []),
        ...child.findAll(predicate),
      ]);
    }
    findOne(predicate) {
      return this.findAll(predicate)[0] || null;
    }
    setPluginData(key, value) {
      this.data[key] = value;
    }
    getPluginData(key) {
      return this.data[key] || '';
    }
    resize(width, height) {
      assert.ok(width > 0 && height > 0);
      this.width = width;
      this.height = height;
    }
    rescale(scale) {
      this.resize(this.width * scale, this.height * scale);
      for (const node of this.children) node.rescale(scale);
    }
    async setTextStyleIdAsync(id) {
      assert.ok(
        styles.some((style) => style.id === id),
        'sample links to an existing style',
      );
      this.textStyleId = id;
    }
    addComponentProperty(name, type, defaultValue) {
      const id = `${name}#${makeId()}`;
      this.componentPropertyDefinitions[id] = { type, defaultValue };
      return id;
    }
    createInstance() {
      assert.equal(this.type, 'COMPONENT');
      const instance = new Node('INSTANCE');
      instance.mainComponent = this;
      instance.width = this.width;
      instance.height = this.height;
      return instance;
    }
  }
  const document = new Node('DOCUMENT');
  const styles = [];
  const collections = [];
  const variables = [];
  const notices = [];
  const initial = new Node('PAGE');
  document.appendChild(initial);
  const figma = {
    root: document,
    currentPage: initial,
    loadFontAsync: async () => {},
    loadAllPagesAsync: async () => {},
    getLocalTextStylesAsync: async () => [...styles],
    setCurrentPageAsync: async (page) => {
      figma.currentPage = page;
    },
    createTextStyle: () => {
      const style = { id: makeId() };
      styles.push(style);
      return style;
    },
    variables: {
      getLocalVariableCollectionsAsync: async () => [...collections],
      getLocalVariablesAsync: async () => [...variables],
      createVariableCollection: (name) => {
        const collection = { id: makeId(), name, defaultModeId: 'default' };
        collections.push(collection);
        return collection;
      },
      createVariable: (name, collection, type) => {
        const variable = {
          id: makeId(),
          name,
          variableCollectionId: collection.id,
          type,
          setValueForMode(mode, value) {
            this.value = value;
          },
        };
        variables.push(variable);
        return variable;
      },
      setBoundVariableForPaint: (paint, field, variable) => ({
        ...paint,
        boundVariables: { [field]: { type: 'VARIABLE_ALIAS', id: variable.id } },
      }),
    },
    createPage: () => {
      const page = new Node('PAGE');
      document.appendChild(page);
      return page;
    },
    createNodeFromSvg: (svg) => {
      assert.match(svg, /<svg/);
      const frame = new Node('FRAME');
      frame.resize(
        parseFloat(svg.match(/<svg[^>]*\bwidth="([^"]+)"/)?.[1] || '24'),
        parseFloat(svg.match(/<svg[^>]*\bheight="([^"]+)"/)?.[1] || '24'),
      );
      frame.appendChild(new Node('VECTOR'));
      const outline = new Node('VECTOR');
      outline.name = 'Unfilled path';
      outline.fills = [];
      frame.appendChild(outline);
      return frame;
    },
    combineAsVariants: (nodes, page) => {
      const set = new Node('COMPONENT_SET');
      page.appendChild(set);
      nodes.forEach((node) => set.appendChild(node));
      return set;
    },
    viewport: { scrollAndZoomIntoView: () => {} },
    notify: (message) => notices.push(message),
  };
  for (const [method, type] of [
    ['createFrame', 'FRAME'],
    ['createComponent', 'COMPONENT'],
    ['createText', 'TEXT'],
    ['createRectangle', 'RECTANGLE'],
  ]) {
    figma[method] = () => {
      const node = new Node(type);
      figma.currentPage.appendChild(node);
      return node;
    };
  }
  async function run() {
    return new Promise((resolve, reject) => {
      figma.closePlugin = (message) => {
        if (message) resolve(message);
        else reject(new Error(notices.join('\n')));
      };
      vm.runInNewContext(source, { figma }, { timeout: 10000 });
    });
  }
  return { figma, run, document, styles, variables, collections };
}

test('generated data retains repository mappings', () => {
  assert.match(buildId, /^[0-9a-f]{12}$/);
  assert.ok(source.startsWith(`const BUILD_ID = "${buildId}";`));
  assert.equal(data.fontFamily, 'Source Sans 3');
  assert.equal(data.button.height, 48);
  assert.equal(data.button.paddingX, 88);
  assert.equal(data.numbers['spacing-s'], 32);
  assert.equal(Object.keys(data.typography).length, 13);
  const svgs = readdirSync(new URL('../icons', import.meta.url)).filter((file) =>
    file.endsWith('.svg'),
  );
  assert.equal(
    Object.values(data.icons).reduce((sum, fills) => sum + Object.keys(fills).length, 0),
    svgs.length,
  );
  assert.deepEqual(
    Object.keys(data.icons).sort(),
    [...data.components.icon.inputs.name.values].sort(),
  );
  assert.equal(Object.keys(data.components).length, 11);
  assert.equal(data.components.row.inputs.gap.default, "'none'");
  assert.equal(data.components.title.inputs.size.default, "'l'");
  assert.deepEqual(data.components.icon.inputs.size.values, ['16', '24', '32', '36', '40', '48']);
});

test('catalog generation preserves master IDs, properties and external content on rerun', async () => {
  const env = environment();
  await env.run();
  const tagged = (id) =>
    env.document.findOne((node) => node.getPluginData('bepower-source') === id);
  const masters = env.document.findAll((node) => node.type === 'COMPONENT');
  const iconCount =
    Object.values(data.icons).reduce((sum, fills) => sum + Object.keys(fills).length, 0) * 6;
  assert.equal(
    masters.filter((node) => node.getPluginData('bepower-source').startsWith('icon/')).length,
    iconCount,
  );
  for (const [name, fills] of Object.entries(data.icons)) {
    for (const fill of Object.keys(fills)) {
      for (const size of data.components.icon.inputs.size.values.map(Number)) {
        const master = tagged(`icon/${name}/${fill}${size === 24 ? '' : `/${size}`}`);
        assert.ok(master, `${name} / ${fill} / ${size}`);
        assert.equal(master.width, size);
        assert.equal(master.height, size);
        assert.equal(master.children[0].width, size);
        const outline = master.findOne((node) => node.name === 'Unfilled path');
        assert.equal(outline.fills.length, 0, 'preserves fill=none');
        const filled = master.findOne(
          (node) => node.type === 'VECTOR' && node.name !== 'Unfilled path',
        );
        assert.ok(filled.fills[0].boundVariables.color.id, 'binds filled paths to color variables');
      }
    }
  }
  for (const id of Object.keys(data.components).filter((id) => !['button', 'icon'].includes(id))) {
    assert.ok(tagged(`components/${id}`), `exports native master set for ${id}`);
    assert.ok(tagged(`catalog/${id}`), `documents ${id}`);
  }
  assert.equal(tagged('buttons').children.length, 20);
  assert.equal(tagged('components/page').children.length, 50);
  assert.equal(tagged('components/bottom-sheet').children.length, 4);
  assert.equal(tagged('components/text').children.length, 7);
  assert.equal(tagged('components/title').children.length, 4);
  assert.equal(tagged('components/grid').children.length, 12);
  assert.equal(tagged('components/row').children.length, 10);
  assert.equal(tagged('components/col').children.length, 14);
  assert.equal(tagged('components/p').children.length, 3);
  assert.equal(tagged('components/progress-bar').children.length, 5);
  for (const [setId, defaultId] of [
    ['icons', 'icon/arrow/fill'],
    ['components/title', 'title/l'],
    ['components/row', 'row/none'],
    ['components/grid', 'grid/false/xs'],
  ]) {
    assert.equal(tagged(setId).children[0].getPluginData('bepower-source'), defaultId);
  }
  assert.equal(masters.length, iconCount + 129);
  const masterIds = masters.map((node) => node.id);
  const label = tagged('button/primary/default').findOne((node) => node.type === 'TEXT');
  const property = Object.keys(tagged('button/primary/default').componentPropertyDefinitions)[0];
  const board = tagged('foundations-board');
  const catalog = tagged('component-catalog');
  assert.ok(board && catalog);
  assert.equal(catalog.findAll((node) => node.type === 'INSTANCE').length, 20);
  assert.equal(
    tagged('icons-board').findAll((node) => node.type === 'INSTANCE').length,
    iconCount / 6,
  );
  const expectedPages = [
    '---- 👑 FOUNDATIONS ----',
    '_Color & Accessibility',
    '_Typography',
    '_Borders & Radius',
    '_Grids & Spacing',
    '_Icons',
    '_Shadow',
    '_Logo',
    '---- 🧩 COMPONENTS ----',
    '_Bottomsheet',
    '_Button',
    '_Col',
    '_Grid',
    '_P',
    '_Page',
    '_ProgressBar',
    '_Row',
    '_Text',
    '_Title',
  ];
  assert.deepEqual(
    env.document.children.slice(0, expectedPages.length).map((node) => node.name),
    expectedPages,
  );
  const texts = env.document.findAll((node) => node.type === 'TEXT');
  for (const name of Object.keys(data.colors)) {
    assert.ok(
      texts.some((node) => node.characters === name),
      `documents ${name}`,
    );
  }
  for (const [name, value] of Object.entries(data.numbers)) {
    assert.ok(
      texts.some((node) => node.characters === `${name} · ${value}px`),
      `documents ${name}`,
    );
  }
  assert.equal(
    texts.filter((node) => node.characters === 'Energia per ogni nuovo viaggio').length,
    Object.keys(data.typography).length,
  );
  const custom = env.figma.createFrame();
  custom.name = 'Note personali';
  const originalButton = tagged('button/primary/default');
  const external = originalButton.createInstance();
  env.figma.currentPage.appendChild(external);
  const counts = [env.variables.length, env.styles.length, env.collections.length];
  // Recreate the previous pilot's icon location to exercise the migration path.
  tagged('pilot-page').appendChild(tagged('icons'));
  tagged('pilot-page').name = 'BePower · Repository pilot';
  tagged('foundations-page').name = 'BePower · Foundations';
  await env.run();
  assert.deepEqual(
    env.document
      .findAll((node) => node.type === 'COMPONENT')
      .map((node) => node.id)
      .sort(),
    [...masterIds].sort(),
  );
  assert.equal(tagged('foundations-board').id, board.id);
  assert.equal(tagged('component-catalog').id, catalog.id);
  assert.equal(
    tagged('button/primary/default').findOne((node) => node.type === 'TEXT').id,
    label.id,
  );
  assert.equal(
    Object.keys(tagged('button/primary/default').componentPropertyDefinitions)[0],
    property,
  );
  assert.ok(custom.parent);
  assert.ok(external.parent);
  assert.equal(external.mainComponent.id, originalButton.id);
  assert.deepEqual([env.variables.length, env.styles.length, env.collections.length], counts);
  assert.equal(env.document.children.length, expectedPages.length + 1);
  assert.equal(tagged('component-catalog').findAll((node) => node.type === 'INSTANCE').length, 20);
  assert.equal(tagged('icons').parent.name, '_Icons');
  assert.equal(tagged('buttons').parent.name, '_Button');
  assert.deepEqual(
    env.document.children.slice(0, expectedPages.length).map((node) => node.name),
    expectedPages,
  );
});

test('migrates the original six buttons and two arrow masters without replacing them', async () => {
  const env = environment();
  const { figma } = env;
  const pilot = figma.currentPage;
  pilot.name = 'BePower · Repository pilot';
  pilot.setPluginData('bepower-source', 'pilot-page');
  const originals = [];
  const buttons = [];
  for (const variant of ['primary', 'secondary', 'outlined']) {
    for (const state of ['default', 'disabled']) {
      const node = figma.createComponent();
      node.setPluginData('bepower-source', `button/${variant}/${state}`);
      node.name = `variant=${variant}, state=${state}`;
      const label = figma.createText();
      node.appendChild(label);
      label.name = 'Label';
      label.characters = 'Continua';
      const property = node.addComponentProperty('Label', 'TEXT', 'Continua');
      label.componentPropertyReferences = { characters: property };
      originals.push({ node, id: node.id, label, labelId: label.id, property });
      buttons.push(node);
    }
  }
  const buttonSet = figma.combineAsVariants(buttons, pilot);
  buttonSet.setPluginData('bepower-source', 'buttons');
  const arrows = [];
  for (const fill of ['fill', 'no-fill']) {
    const node = figma.createComponent();
    node.setPluginData('bepower-source', `icon/arrow/${fill}`);
    node.name = `fill=${fill}`;
    originals.push({ node, id: node.id });
    arrows.push(node);
  }
  const arrowSet = figma.combineAsVariants(arrows, pilot);
  arrowSet.setPluginData('bepower-source', 'icons');
  const work = figma.createPage();
  work.name = 'My work';
  const buttonInstance = buttons[0].createInstance();
  const arrowInstance = arrows[0].createInstance();
  work.appendChild(buttonInstance);
  work.appendChild(arrowInstance);
  await env.run();
  await env.run();
  for (const original of originals) {
    assert.equal(original.node.id, original.id);
    assert.ok(original.node.parent, 'legacy master is still attached');
    if (original.label) {
      assert.equal(
        original.node.children.find((node) => node.type === 'TEXT').id,
        original.labelId,
      );
      assert.ok(original.node.componentPropertyDefinitions[original.property]);
    }
  }
  assert.equal(buttonInstance.mainComponent, buttons[0]);
  assert.equal(arrowInstance.mainComponent, arrows[0]);
  assert.equal(buttonInstance.parent, work);
  assert.equal(arrowInstance.parent, work);
  assert.equal(buttonSet.parent.name, '_Button');
  assert.equal(arrowSet.parent.name, '_Icons');
  assert.equal(buttonSet.children.length, 20);
  assert.equal(arrowSet.children.length, 12);
});

test('unavailable repository font fails before modifying the document', async () => {
  const env = environment();
  env.figma.loadFontAsync = async () => {
    throw new Error('Source Sans 3 is unavailable');
  };
  await assert.rejects(env.run(), /Source Sans 3 is unavailable/);
  assert.equal(env.document.children.length, 1);
  assert.equal(env.document.children[0].children.length, 0);
  assert.equal(env.variables.length, 0);
  assert.equal(env.styles.length, 0);
  assert.equal(env.document.getPluginData('bepower-last-build'), '');
});

test('run reports distinguish creation from updates and identify the executed bundle', async () => {
  const env = environment();
  const first = await env.run();
  assert.ok(first.includes(buildId));
  assert.match(first, /0 master aggiornati · 579 creati · nuovo bundle/);
  const ids = env.document
    .findAll((node) => node.type === 'COMPONENT')
    .map((node) => node.id)
    .sort();
  const second = await env.run();
  assert.ok(second.includes(buildId));
  assert.match(second, /579 master aggiornati · 0 creati · stesso bundle/);
  assert.equal(env.document.getPluginData('bepower-last-build'), buildId);
  assert.deepEqual(JSON.parse(env.document.getPluginData('bepower-last-report')), {
    buildId,
    created: 0,
    updated: 579,
  });
  assert.deepEqual(
    env.document
      .findAll((node) => node.type === 'COMPONENT')
      .map((node) => node.id)
      .sort(),
    ids,
  );
});

test('shell toolbars fill the viewport and preserve title/footer IDs when upgrading old layouts', async () => {
  const env = environment();
  await env.run();
  const role = (node, name) =>
    node.children.find((child) => child.getPluginData('bepower-role') === name);
  const tagged = (id) =>
    env.document.findOne((node) => node.getPluginData('bepower-source') === id);
  const buttonWidth = tagged('button/primary/default').width;
  const shells = env.document.findAll(
    (node) =>
      node.type === 'COMPONENT' &&
      /^(page|bottom-sheet)\//.test(node.getPluginData('bepower-source')),
  );
  assert.equal(shells.length, 54);
  function checkShells() {
    for (const shell of shells) {
      const id = shell.getPluginData('bepower-source');
      const isPage = id.startsWith('page/');
      const header = role(shell, 'Header');
      const footer = role(shell, 'Footer slot');
      const cta = footer.children.find((node) => node.type === 'INSTANCE');
      assert.equal(header.width, shell.width, `${id}: full-width header`);
      assert.equal(header.layoutAlign, 'STRETCH');
      assert.equal(header.counterAxisSizingMode, 'FIXED');
      assert.equal(footer.width, shell.width, `${id}: full-width footer background`);
      assert.equal(footer.layoutAlign, 'STRETCH');
      assert.equal(footer.counterAxisSizingMode, 'FIXED');
      assert.equal(footer.primaryAxisSizingMode, 'AUTO', 'footer hugs height, not width');
      assert.equal(footer.visible, id.endsWith('/true'));
      assert.equal(footer.paddingLeft, 24);
      assert.equal(footer.paddingRight, 24);
      assert.equal(footer.paddingTop, 16);
      assert.equal(footer.paddingBottom, isPage ? 0 : 16);
      assert.equal(cta.width, shell.width - 48);
      assert.equal(cta.primaryAxisSizingMode, 'FIXED');
      assert.equal(cta.layoutAlign, 'STRETCH');
      assert.ok(footer.fills[0].boundVariables.color.id);
      const body = role(shell, 'Body slot');
      assert.equal(body.layoutGrow, 1, 'body occupies remaining vertical space');
      assert.equal(body.layoutAlign, 'STRETCH');
      if (isPage) {
        const toolbar = role(header, 'Title toolbar');
        const title = role(toolbar, 'Title');
        assert.equal(header.paddingLeft, 0, 'padding belongs to the individual toolbars');
        assert.equal(toolbar.width, shell.width);
        assert.equal(toolbar.paddingLeft, 16);
        assert.equal(toolbar.paddingRight, 16);
        assert.equal(toolbar.paddingTop, 8);
        assert.equal(toolbar.paddingBottom, 16);
        assert.equal(title.textAlignHorizontal, 'CENTER');
        assert.equal(title.width, shell.width - 32);
        assert.equal(title.layoutAlign, 'STRETCH');
        assert.equal(
          header.children.filter((node) => node.getPluginData('bepower-role') === 'Title').length,
          0,
          'no duplicate title',
        );
        if (id.includes('/step/')) {
          const step = role(header, 'Step toolbar');
          assert.equal(step.width, shell.width);
          assert.equal(step.paddingLeft, 24);
          assert.equal(step.paddingRight, 24);
          assert.equal(step.paddingTop, 0);
          assert.equal(step.paddingBottom, 16);
          assert.equal(step.itemSpacing, 8);
          assert.equal(role(step, 'Step progress').width, shell.width - 48);
          assert.equal(role(step, 'Step label').textAlignHorizontal, 'RIGHT');
        }
      } else {
        assert.equal(header.primaryAxisAlignItems, 'MAX', 'close stays at the trailing edge');
        assert.equal(header.counterAxisAlignItems, 'CENTER');
        assert.equal(header.paddingLeft, 24);
        assert.equal(header.paddingRight, 24);
        assert.equal(header.paddingTop, 24);
        assert.equal(header.height, 64);
      }
    }
  }
  checkShells();
  const page = tagged('page/white/step/true');
  const header = role(page, 'Header');
  const toolbar = role(header, 'Title toolbar');
  const title = role(toolbar, 'Title');
  const references = title.componentPropertyReferences.characters;
  const footer = role(page, 'Footer slot');
  const cta = footer.children[0];
  const identities = [title.id, footer.id, cta.id];
  // Previous bundle placed title and step content directly in a padded header.
  header.appendChild(title);
  toolbar.remove();
  const step = role(header, 'Step toolbar');
  for (const child of step.children) header.appendChild(child);
  step.remove();
  header.paddingLeft = header.paddingRight = 16;
  footer.counterAxisSizingMode = 'AUTO';
  footer.resize(292, footer.height);
  cta.primaryAxisSizingMode = 'AUTO';
  cta.resize(244, cta.height);
  await env.run();
  checkShells();
  assert.deepEqual(
    [role(role(header, 'Title toolbar'), 'Title').id, footer.id, cta.id],
    identities,
  );
  assert.equal(
    role(role(header, 'Title toolbar'), 'Title').componentPropertyReferences.characters,
    references,
  );
  assert.equal(
    tagged('button/primary/default').width,
    buttonWidth,
    'CTA resizing never changes the shared master',
  );
});

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
execFileSync(process.execPath, ['scripts/build-figma-plugin.mjs'], { cwd: root });
const source = readFileSync(new URL('dist/code.js', import.meta.url), 'utf8');
const data = JSON.parse(readFileSync(new URL('dist/tokens.json', import.meta.url), 'utf8'));

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
      frame.appendChild(new Node('VECTOR'));
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
    await new Promise((resolve, reject) => {
      figma.closePlugin = (message) => {
        if (message) resolve();
        else reject(new Error(notices.join('\n')));
      };
      vm.runInNewContext(source, { figma }, { timeout: 10000 });
    });
  }
  return { figma, run, document, styles, variables, collections };
}

test('generated data retains repository mappings', () => {
  assert.equal(data.fontFamily, 'Source Sans 3');
  assert.equal(data.button.height, 48);
  assert.equal(data.button.paddingX, 88);
  assert.equal(data.numbers['spacing-s'], 32);
  assert.equal(Object.keys(data.typography).length, 13);
  assert.equal(Object.keys(data.icons).length, 2);
});

test('catalog generation preserves master IDs, properties and external content on rerun', async () => {
  const env = environment();
  await env.run();
  const tagged = (id) =>
    env.document.findOne((node) => node.getPluginData('bepower-source') === id);
  const masters = env.document.findAll((node) => node.type === 'COMPONENT');
  assert.equal(masters.length, 8);
  const masterIds = masters.map((node) => node.id);
  const label = tagged('button/primary/default').findOne((node) => node.type === 'TEXT');
  const property = Object.keys(tagged('button/primary/default').componentPropertyDefinitions)[0];
  const board = tagged('foundations-board');
  const catalog = tagged('component-catalog');
  assert.ok(board && catalog);
  assert.equal(catalog.findAll((node) => node.type === 'INSTANCE').length, 6);
  assert.equal(tagged('icons-board').findAll((node) => node.type === 'INSTANCE').length, 2);
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
    '_Button',
  ];
  assert.deepEqual(
    env.document.children.slice(0, 10).map((node) => node.name),
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
  const external = tagged('button/primary/default').createInstance();
  env.figma.currentPage.appendChild(external);
  const counts = [env.variables.length, env.styles.length, env.collections.length];
  // Recreate the previous pilot's icon location to exercise the migration path.
  tagged('pilot-page').appendChild(tagged('icons'));
  tagged('pilot-page').name = 'BePower · Repository pilot';
  tagged('foundations-page').name = 'BePower · Foundations';
  await env.run();
  assert.deepEqual(
    env.document.findAll((node) => node.type === 'COMPONENT').map((node) => node.id),
    masterIds,
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
  assert.equal(external.mainComponent.id, masterIds[2]);
  assert.deepEqual([env.variables.length, env.styles.length, env.collections.length], counts);
  assert.equal(env.document.children.length, 11);
  assert.equal(tagged('component-catalog').findAll((node) => node.type === 'INSTANCE').length, 6);
  assert.equal(tagged('icons').parent.name, '_Icons');
  assert.equal(tagged('buttons').parent.name, '_Button');
  assert.deepEqual(
    env.document.children.slice(0, 10).map((node) => node.name),
    expectedPages,
  );
});

/* global figma, DATA, BUILD_ID, STATUS_HTML, createCatalog, renderComponents, configureComposition */
// This file is bundled with repository-derived DATA by build-figma-plugin.mjs.
const prefix = 'BePower/';
const key = 'bepower-source';
const color = (name) => DATA.colors[name];
const paint = (name) => {
  const { a, ...rgb } = color(name);
  return [{ type: 'SOLID', color: rgb, opacity: a }];
};
const styleName = (name) => prefix + name.replaceAll('-', '/');

let latestStatus;
let panelReady = false;
let phase = 'Avvio';
let resolveUIReady;
const uiReady = new Promise((resolve) => {
  resolveUIReady = resolve;
});
let chunkStarted = Date.now();
let workUnits = 0;
async function checkpoint(force = false) {
  if (!force && ++workUnits < 20 && Date.now() - chunkStarted < 12) return;
  // A resolved Promise alone does not let Figma paint or deliver iframe messages.
  await new Promise((resolve) => setTimeout(resolve, 0));
  workUnits = 0;
  chunkStarted = Date.now();
}
function status(state, message) {
  latestStatus = { type: 'status', buildId: BUILD_ID, state, message };
  if (panelReady) figma.ui.postMessage(latestStatus);
}
figma.ui.onmessage = (message) => {
  if (message && message.type === 'ready') {
    panelReady = true;
    if (latestStatus) figma.ui.postMessage(latestStatus);
    resolveUIReady();
  }
};
figma.showUI(STATUS_HTML, {
  width: DATA.numbers['size-480'] * 10,
  height: DATA.numbers['size-320'] * 10,
  title: 'BePower · Aggiornamento',
});
function progress(message) {
  phase = message;
  status('running', message);
}
async function run() {
  progress('Connessione alla finestra diagnostica…');
  await uiReady;
  await checkpoint(true);
  progress('Caricamento Source Sans 3…');
  const previousBuild = figma.root.getPluginData('bepower-last-build');
  const counts = { created: 0, updated: 0 };
  // Fail before modifying the document if the exact repository font is unavailable.
  await figma.loadFontAsync({ family: DATA.fontFamily, style: 'Regular' });
  await figma.loadFontAsync({ family: DATA.fontFamily, style: 'SemiBold' });
  progress('Aggiornamento variabili e stili…');
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const collection =
    collections.find((item) => item.name === 'BePower · repository') ||
    figma.variables.createVariableCollection('BePower · repository');
  const variables = await figma.variables.getLocalVariablesAsync();
  function variable(name, type, value) {
    const fullName = name.replaceAll('-', '/');
    const existing = variables.find(
      (item) => item.variableCollectionId === collection.id && item.name === fullName,
    );
    const item = existing || figma.variables.createVariable(fullName, collection, type);
    item.setValueForMode(collection.defaultModeId, value);
    return item;
  }
  const colorVariables = {};
  for (const [name, { a, ...rgb }] of Object.entries(DATA.colors)) {
    colorVariables[name] = variable(name, 'COLOR', { ...rgb, a });
    await checkpoint();
  }
  for (const [name, value] of Object.entries(DATA.numbers)) {
    variable(name, 'FLOAT', value);
    await checkpoint();
  }
  const textStyles = await figma.getLocalTextStylesAsync();
  for (const [name, type] of Object.entries(DATA.typography)) {
    const style =
      textStyles.find((item) => item.name === styleName(name)) || figma.createTextStyle();
    style.name = styleName(name);
    style.fontName = {
      family: DATA.fontFamily,
      style: type.weight === 600 ? 'SemiBold' : 'Regular',
    };
    style.fontSize = type.size;
    style.lineHeight = { unit: 'PIXELS', value: type.lineHeight };
    style.textDecoration = type.underline ? 'UNDERLINE' : 'NONE';
    style.textCase = type.uppercase ? 'UPPER' : 'ORIGINAL';
    if (!textStyles.some((item) => item.id === style.id)) textStyles.push(style);
    await checkpoint();
  }

  progress('Caricamento delle pagine Figma…');
  await figma.loadAllPagesAsync();
  progress('Indicizzazione dei master esistenti…');
  // One traversal per run, never recurse into instances or scan all pages per master.
  const managed = new Map();
  const pending = [...figma.root.children];
  while (pending.length) {
    const node = pending.pop();
    if (node.type === 'INSTANCE') continue;
    if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
      const id = node.getPluginData(key);
      if (id) {
        const indexKey = `${node.type}:${id}`;
        if (managed.has(indexKey))
          throw new Error(
            `Identificativo duplicato: ${id}. Non cancellare i master; condividi questo errore.`,
          );
        managed.set(indexKey, node);
      }
    }
    if ('children' in node) pending.push(...node.children);
    await checkpoint();
  }
  let page = figma.root.children.find((item) => item.getPluginData(key) === 'pilot-page');
  if (!page) {
    page = figma.createPage();
    page.name = 'BePower · Repository pilot';
    page.setPluginData(key, 'pilot-page');
  }
  await figma.setCurrentPageAsync(page);
  function component(id, name) {
    let node = managed.get(`COMPONENT:${id}`);
    if (!node) {
      node = figma.createComponent();
      page.appendChild(node);
      node.setPluginData(key, id);
      managed.set(`COMPONENT:${id}`, node);
      counts.created++;
    } else {
      counts.updated++;
    }
    node.name = name;
    node.description = 'Generated from @bepower/ui-kit. Edit the repository, then regenerate.';
    return node;
  }
  function bindFill(node, name) {
    node.fills = [
      figma.variables.setBoundVariableForPaint(paint(name)[0], 'color', colorVariables[name]),
    ];
  }
  function bindStroke(node, name) {
    node.strokes = [
      figma.variables.setBoundVariableForPaint(paint(name)[0], 'color', colorVariables[name]),
    ];
  }
  function exposeProperty(master, node, name, type, value, field) {
    // Slot content is freely editable and cannot be bound to its parent's properties.
    for (let parent = node.parent; parent; parent = parent.parent) {
      if (parent.type === 'SLOT') return node.componentPropertyReferences?.[field];
      if (parent.type === 'COMPONENT') break;
    }
    // Figma only exposes definitions on the set once a component becomes a variant.
    const owner = master.parent?.type === 'COMPONENT_SET' ? master.parent : master;
    const definitions = owner.componentPropertyDefinitions;
    const reference = node.componentPropertyReferences?.[field];
    const matches = (key) => key && key.startsWith(`${name}#`) && definitions[key]?.type === type;
    // Keep each existing reference, even if the set contains several legacy Label IDs.
    let property = matches(reference) ? reference : Object.keys(definitions).find(matches);
    if (!property) property = owner.addComponentProperty(name, type, value);
    if (reference !== property) {
      node.componentPropertyReferences = {
        ...node.componentPropertyReferences,
        [field]: property,
      };
    }
    return property;
  }
  function exposeText(master, text, name, value) {
    return exposeProperty(master, text, name, 'TEXT', value, 'characters');
  }
  function variants(nodes, id, name, x) {
    let set = managed.get(`COMPONENT_SET:${id}`);
    if (!set) set = figma.combineAsVariants(nodes, page);
    managed.set(`COMPONENT_SET:${id}`, set);
    nodes.forEach((node, index) => set.insertChild(index, node));
    set.setPluginData(key, id);
    set.name = name;
    set.x = x;
    set.y = 0;
    set.layoutMode = 'VERTICAL';
    set.primaryAxisSizingMode = 'AUTO';
    set.counterAxisSizingMode = 'AUTO';
    set.itemSpacing = DATA.numbers['spacing-s'];
    set.paddingTop = set.paddingBottom = DATA.numbers['spacing-s'];
    set.paddingLeft = set.paddingRight = DATA.numbers['spacing-s'];
    return set;
  }
  const iconSets = [];
  const defaultIconSize = Number(DATA.components.icon.inputs.size.default.replace(/['"]/g, ''));
  const iconSizes = [
    defaultIconSize,
    ...DATA.components.icon.inputs.size.values
      .map(Number)
      .filter((size) => size !== defaultIconSize),
  ];
  for (const [name, fills] of Object.entries(DATA.icons)) {
    progress(`Aggiornamento icona: ${name}`);
    await checkpoint(true);
    const icons = [];
    for (const [fill, svg] of Object.entries(fills)) {
      for (const size of iconSizes) {
        const id = `icon/${name}/${fill}${size === 24 ? '' : `/${size}`}`;
        const node = component(id, `fill=${fill}, size=${size}`);
        const vector = figma.createNodeFromSvg(svg);
        for (const child of vector.findAll((item) => item.type === 'VECTOR')) {
          // Match icons:import: recolor filled paths, preserve fill=none and stroke attributes.
          if (Array.isArray(child.fills) && child.fills.length)
            bindFill(child, 'color-grey-default-grey');
        }
        vector.rescale(size / vector.width);
        vector.x = vector.y = 0;
        node.children.forEach((child) => child.remove());
        node.resize(size, size);
        node.fills = [];
        node.appendChild(vector);
        icons.push(node);
        await checkpoint();
      }
    }
    iconSets.push(
      variants(icons, name === 'arrow' ? 'icons' : `icons/${name}`, `UIIcon / ${name}`, 0),
    );
  }
  progress('Aggiornamento UIButton…');
  const buttons = [];
  for (const variant of ['primary', 'secondary', 'outlined']) {
    for (const state of ['default', 'disabled']) {
      const node = component(
        `button/${variant}/${state}`,
        `variant=${variant}, state=${state}, size=default`,
      );
      node.layoutMode = 'HORIZONTAL';
      node.primaryAxisSizingMode = 'AUTO';
      node.counterAxisSizingMode = 'FIXED';
      node.primaryAxisAlignItems = 'CENTER';
      node.counterAxisAlignItems = 'CENTER';
      node.paddingLeft = node.paddingRight = DATA.button.paddingX;
      node.paddingTop = node.paddingBottom = DATA.button.paddingY;
      node.resize(Math.max(node.width, 1), DATA.button.height);
      node.cornerRadius = variant === 'secondary' ? 0 : DATA.button.radius;
      node.opacity = state === 'disabled' ? DATA.button.disabledOpacity : 1;
      node.fills = [];
      node.strokes = [];
      if (variant === 'primary') bindFill(node, 'color-primary-yellow-eni');
      if (variant === 'outlined') {
        node.strokes = paint('color-grey-default-grey');
        node.strokeWeight = 1;
      }
      // Retain the label node and component property IDs on subsequent updates.
      let label =
        node.children.find((child) => child.type === 'TEXT') ||
        node.children
          .find((child) => child.getPluginData('bepower-role') === 'Button content')
          ?.children.find((child) => child.type === 'TEXT' && child.name === 'Label');
      if (!label) {
        label = figma.createText();
        node.appendChild(label);
      }
      label.name = 'Label';
      const type = DATA.typography[variant === 'secondary' ? 'button-text-link' : 'button-cta'];
      label.fontName = { family: DATA.fontFamily, style: 'SemiBold' };
      label.fontSize = type.size;
      label.lineHeight = { unit: 'PIXELS', value: type.lineHeight };
      label.textDecoration = type.underline ? 'UNDERLINE' : 'NONE';
      label.characters = 'Continua';
      label.textAutoResize = 'WIDTH_AND_HEIGHT';
      bindFill(label, 'color-grey-default-grey');
      exposeText(node, label, 'Label', 'Continua');
      node.minWidth = label.width + node.paddingLeft + node.paddingRight;
      node.resize(Math.max(node.width, node.minWidth), DATA.button.height);
      node.primaryAxisSizingMode = 'FIXED';
      buttons.push(node);
      await checkpoint();
    }
  }
  const buttonSet = variants(buttons, 'buttons', 'UIButton', 0);
  progress('Aggiornamento componenti e shell…');
  await checkpoint(true);
  const library = await renderComponents({
    component,
    variants,
    bindFill,
    bindStroke,
    textStyles,
    iconSets,
    buttonSet,
    checkpoint,
    exposeText,
    exposeProperty,
  });
  progress('Configurazione della gerarchia e dei contenuti sostituibili…');
  const composition = await configureComposition({
    component,
    library,
    buttonSet,
    iconSets,
    exposeProperty,
    checkpoint,
  });
  progress('Aggiornamento catalogo e foundations…');
  await checkpoint(true);
  const catalog = await createCatalog({
    page,
    iconSets,
    buttonSet,
    library,
    bindFill,
    textStyles,
    checkpoint,
    composition,
  });
  page.selection = [catalog];
  figma.viewport.scrollAndZoomIntoView(page.selection);
  // Record only successful runs. A failed/partial update must not look like a completed build.
  figma.root.setPluginData('bepower-last-build', BUILD_ID);
  figma.root.setPluginData('bepower-last-report', JSON.stringify({ buildId: BUILD_ID, ...counts }));
  status(
    'complete',
    `Completato.\n${counts.updated} master aggiornati · ${counts.created} creati\n${previousBuild === BUILD_ID ? 'stesso bundle' : 'nuovo bundle'}\n\nPuoi chiudere questa finestra.`,
  );
}

run().catch((error) => {
  status(
    'error',
    `Errore durante: ${phase}\n\n${error.message}\n\nL’aggiornamento non è completato. Non cancellare gli asset: condividi questo messaggio. Puoi poi chiudere questa finestra.`,
  );
});

/* global figma, DATA, createCatalog, renderComponents */
// This file is bundled with repository-derived DATA by build-figma-plugin.mjs.
const prefix = 'BePower/';
const key = 'bepower-source';
const color = (name) => DATA.colors[name];
const paint = (name) => {
  const { a, ...rgb } = color(name);
  return [{ type: 'SOLID', color: rgb, opacity: a }];
};
const styleName = (name) => prefix + name.replaceAll('-', '/');

async function run() {
  // Fail before modifying the document if the exact repository font is unavailable.
  await figma.loadFontAsync({ family: DATA.fontFamily, style: 'Regular' });
  await figma.loadFontAsync({ family: DATA.fontFamily, style: 'SemiBold' });
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
  }
  for (const [name, value] of Object.entries(DATA.numbers)) variable(name, 'FLOAT', value);
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
  }

  await figma.loadAllPagesAsync();
  let page = figma.root.children.find((item) => item.getPluginData(key) === 'pilot-page');
  if (!page) {
    page = figma.createPage();
    page.name = 'BePower · Repository pilot';
    page.setPluginData(key, 'pilot-page');
  }
  await figma.setCurrentPageAsync(page);
  const findManaged = (predicate) =>
    figma.root.children.map((target) => target.findOne(predicate)).find(Boolean);
  function component(id, name) {
    let node = findManaged((item) => item.type === 'COMPONENT' && item.getPluginData(key) === id);
    if (!node) {
      node = figma.createComponent();
      page.appendChild(node);
      node.setPluginData(key, id);
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
  function variants(nodes, id, name, x) {
    let set = findManaged(
      (item) => item.type === 'COMPONENT_SET' && item.getPluginData(key) === id,
    );
    if (!set) set = figma.combineAsVariants(nodes, page);
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
      }
    }
    iconSets.push(
      variants(icons, name === 'arrow' ? 'icons' : `icons/${name}`, `UIIcon / ${name}`, 0),
    );
  }
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
      let label = node.children.find((child) => child.type === 'TEXT');
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
      bindFill(label, 'color-grey-default-grey');
      let property = Object.keys(node.componentPropertyDefinitions).find((name) =>
        name.startsWith('Label#'),
      );
      if (!property) property = node.addComponentProperty('Label', 'TEXT', 'Continua');
      label.componentPropertyReferences = { characters: property };
      buttons.push(node);
    }
  }
  const buttonSet = variants(buttons, 'buttons', 'UIButton', 0);
  const library = await renderComponents({
    component,
    variants,
    bindFill,
    textStyles,
    iconSets,
    buttonSet,
  });
  const catalog = await createCatalog({
    page,
    iconSets,
    buttonSet,
    library,
    bindFill,
    textStyles,
  });
  page.selection = [catalog];
  figma.viewport.scrollAndZoomIntoView(page.selection);
  figma.closePlugin('BePower updated: all exported components and registered icon variants.');
}

run().catch((error) => {
  figma.notify(`BePower: ${error.message}`, {
    error: true,
  });
  figma.closePlugin();
});

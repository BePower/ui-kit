/* global figma, DATA */
// Native SLOT properties allow arbitrary children inside an instance, unlike INSTANCE_SWAP.
async function configureComposition({
  component,
  library,
  buttonSet,
  iconSets,
  exposeProperty,
  checkpoint,
}) {
  const roleKey = 'bepower-role';
  const tag = 'bepower-source';
  const n = DATA.numbers;
  const sets = new Map(library.map((item) => [item.id, item.set]));
  const role = (parent, name) =>
    parent.children.find((node) => node.getPluginData(roleKey) === name);
  const variant = (id, source) =>
    sets.get(id).children.find((node) => node.getPluginData(tag) === source);
  const paragraph = variant('p', 'p/start');
  const column = variant('col', 'col/equal');
  const row = variant('row', 'row/xxs');
  const grid = variant('grid', 'grid/false/xs');
  const button = buttonSet.children.find(
    (node) => node.getPluginData(tag) === 'button/primary/default',
  );
  const icon = iconSets
    .find((set) => set.name === 'UIIcon / plus')
    .children.find((node) => node.getPluginData(tag) === 'icon/plus/no-fill');
  if (typeof button.createSlot !== 'function') {
    throw new Error(
      'Questo runtime Figma non supporta gli slot nativi. Aggiorna Figma Desktop e verifica la disponibilità di Slots; nessun fallback a colonne o swap fissi.',
    );
  }
  function owner(master) {
    return master.parent?.type === 'COMPONENT_SET' ? master.parent : master;
  }
  function fit(instance, width) {
    instance.layoutAlign = 'STRETCH';
    if (instance.layoutMode === 'HORIZONTAL') instance.primaryAxisSizingMode = 'FIXED';
    if (instance.layoutMode === 'VERTICAL') instance.counterAxisSizingMode = 'FIXED';
    instance.resize(Math.max(width, n['size-10']), instance.height);
  }
  function frame(master, name) {
    let node = role(master, name);
    if (!node) {
      node = figma.createFrame();
      master.appendChild(node);
      node.setPluginData(roleKey, name);
    }
    node.name = name;
    node.fills = [];
    return node;
  }
  function openSlot(master, node, name, direction = 'VERTICAL', description = '') {
    const propertyOwner = owner(master);
    node.layoutMode = direction;
    const settings = {
      minChildren: 0,
      maxChildren: null,
      allowPreferredValuesOnly: false,
      stretchChildOnInsert: true,
      displayEmptyByDefault: false,
    };
    // Official API: attaching slotContentId converts an existing frame, preserving its ID.
    const property = exposeProperty(master, node, name, 'SLOT', '', 'slotContentId');
    propertyOwner.editComponentProperty(property, { description, slotSettings: settings });
    node.name = name;
    node.layoutAlign = 'STRETCH';
    if (direction === 'HORIZONTAL') {
      node.primaryAxisSizingMode = 'FIXED';
      node.counterAxisSizingMode = 'AUTO';
    } else {
      node.primaryAxisSizingMode = 'AUTO';
      node.counterAxisSizingMode = 'FIXED';
    }
    return node;
  }
  function clearLegacySwap(instance) {
    const current = instance.componentPropertyReferences;
    if (!current || !('mainComponent' in current)) return;
    const refs = { ...current };
    delete refs.mainComponent;
    // Existing default children may already be in a Slot after a partial run.
    // Clean legacy bindings while outside it, then restore the same node and position.
    let ancestor = instance.parent;
    let inSlot = false;
    while (ancestor && ancestor.type !== 'COMPONENT') {
      if (ancestor.type === 'SLOT') inSlot = true;
      ancestor = ancestor.parent;
    }
    if (!inSlot) {
      instance.componentPropertyReferences = refs;
      return;
    }
    if (!ancestor) throw new Error('Impossibile migrare un riferimento fuori dal master.');
    const parent = instance.parent;
    const index = parent.children.indexOf(instance);
    ancestor.appendChild(instance);
    try {
      instance.componentPropertyReferences = refs;
    } finally {
      parent.insertChild(index, instance);
    }
  }
  async function defaultInstance(parent, name, source, width) {
    let instance = role(parent, name);
    if (!instance) {
      instance = source.createInstance();
      parent.appendChild(instance);
      instance.setPluginData(roleKey, name);
    }
    const current = await instance.getMainComponentAsync();
    if (!current || current.id !== source.id) instance.swapComponent(source);
    instance.name = source.parent.type === 'COMPONENT_SET' ? source.parent.name : source.name;
    clearLegacySwap(instance);
    fit(instance, width);
    await checkpoint();
    return instance;
  }
  function hideLegacy(master, node) {
    for (const text of node.children.filter((child) => child.type === 'TEXT')) {
      text.visible = false;
      exposeProperty(master, text, 'Show legacy placeholder', 'BOOLEAN', false, 'visible');
    }
  }
  async function content(master, node, source, name, fixedHeight = false) {
    hideLegacy(master, node);
    openSlot(
      master,
      node,
      name,
      'VERTICAL',
      'Contenuto libero: aggiungi, duplica, riordina o rimuovi istanze senza Detach.',
    );
    if (fixedHeight) node.primaryAxisSizingMode = 'FIXED';
    await defaultInstance(node, 'Projected component', source, node.width);
  }
  for (const id of ['title', 'text', 'p', 'progress-bar']) {
    for (const master of sets.get(id).children) {
      master.counterAxisSizingMode = 'FIXED';
      for (const child of master.children) {
        child.layoutAlign = 'STRETCH';
        if (child.type === 'TEXT') child.textAutoResize = 'HEIGHT';
      }
    }
  }
  for (const master of sets.get('col').children) {
    await content(master, role(master, 'Content slot'), paragraph, 'Content');
  }
  for (const master of sets.get('row').children) {
    const gap = n[`spacing-${master.getPluginData(tag).slice('row/'.length)}`];
    const width = master.width;
    master.layoutMode = 'VERTICAL';
    master.primaryAxisSizingMode = 'AUTO';
    master.counterAxisSizingMode = 'FIXED';
    master.itemSpacing = 0;
    const columns = openSlot(
      master,
      frame(master, 'Columns'),
      'Columns',
      'HORIZONTAL',
      'Colonne libere: due solo come esempio iniziale, nessun numero massimo.',
    );
    columns.resize(width, columns.height);
    columns.itemSpacing = gap;
    columns.layoutWrap = 'WRAP';
    columns.counterAxisSpacing = 0;
    for (const index of [1, 2]) {
      const old = role(master, `Column ${index}`);
      const migrated = old && role(old, 'Projected component');
      if (migrated && !role(columns, `Default column ${index}`)) {
        columns.appendChild(migrated);
        migrated.setPluginData(roleKey, `Default column ${index}`);
      }
      if (old) {
        old.visible = false;
        exposeProperty(master, old, 'Show legacy columns', 'BOOLEAN', false, 'visible');
      }
      const instance = await defaultInstance(
        columns,
        `Default column ${index}`,
        column,
        (width - gap) / 2,
      );
      instance.layoutGrow = 1;
    }
  }
  for (const master of sets.get('grid').children) {
    await content(master, role(master, 'Content slot'), row, 'Rows');
  }
  for (const id of ['page', 'bottom-sheet']) {
    for (const master of sets.get(id).children) {
      await content(master, role(master, 'Body slot'), grid, 'Body', true);
      const footer = role(master, 'Footer slot');
      openSlot(
        master,
        footer,
        'Footer',
        'VERTICAL',
        'Footer libero: inserisci più pulsanti, testi o composizioni.',
      );
      const cta = footer.children.find((node) => node.type === 'INSTANCE');
      if (cta) clearLegacySwap(cta);
    }
  }
  for (const master of buttonSet.children) {
    const source = master.getPluginData(tag);
    if (source.endsWith('/icon') || source.endsWith('/min-icon')) {
      exposeProperty(
        master,
        role(master, 'Icon slot'),
        'Icon',
        'INSTANCE_SWAP',
        icon.id,
        'mainComponent',
      );
    } else {
      const label =
        master.children.find((node) => node.type === 'TEXT' && node.name === 'Label') ||
        role(master, 'Button content')?.children.find(
          (node) => node.type === 'TEXT' && node.name === 'Label',
        );
      const body = frame(master, 'Button content');
      // Label remains a normal component property. Slot content is edited directly.
      if (label) {
        if (label.parent !== master) master.insertChild(0, label);
        exposeProperty(master, label, 'Label', 'TEXT', label.characters, 'characters');
        label.visible = true;
        exposeProperty(master, label, 'Show label', 'BOOLEAN', true, 'visible');
      }
      openSlot(
        master,
        body,
        'Content',
        'HORIZONTAL',
        'Contenuto del pulsante: testo e istanze liberamente componibili.',
      );
      body.layoutAlign = 'INHERIT';
      body.primaryAxisSizingMode = 'AUTO';
      body.counterAxisSizingMode = 'AUTO';
      body.itemSpacing = n['size-80'];
      body.visible = false;
      exposeProperty(master, body, 'Show custom content', 'BOOLEAN', false, 'visible');
      for (const [name, atStart] of [
        ['Leading icon', true],
        ['Trailing icon', false],
      ]) {
        let instance = role(master, name);
        if (!instance) {
          instance = icon.createInstance();
          master.appendChild(instance);
          instance.setPluginData(roleKey, name);
        }
        exposeProperty(master, instance, name, 'INSTANCE_SWAP', icon.id, 'mainComponent');
        instance.visible = false;
        exposeProperty(master, instance, `Show ${name.toLowerCase()}`, 'BOOLEAN', false, 'visible');
        if (atStart) master.insertChild(0, instance);
      }
      master.itemSpacing = n['size-80'];
    }
  }
  const example = component('composition/content', 'Composition / Content');
  example.description =
    'Optional composition example; native slots do not require a content wrapper.';
  example.layoutMode = 'VERTICAL';
  example.primaryAxisSizingMode = 'AUTO';
  example.counterAxisSizingMode = 'FIXED';
  example.resize(n['size-320'] * 10, example.height);
  example.fills = [];
  example.itemSpacing = n['spacing-xxs'];
  for (const [name, source] of [
    ['UITitle', variant('title', 'title/m')],
    ['UIP', paragraph],
    ['UIText', variant('text', 'text/label-m')],
    ['UIProgressBar', variant('progress-bar', 'progress-bar/0.5')],
    ['UIButton', button],
  ]) {
    await defaultInstance(example, name, source, example.width);
  }
  return {
    example,
    page: variant('page', 'page/white/white/true'),
    sheet: variant('bottom-sheet', 'bottom-sheet/true/true'),
  };
}

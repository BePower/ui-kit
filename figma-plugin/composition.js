/* global DATA */
// Content is an INSTANCE_SWAP, not permission to insert arbitrary layers into an instance.
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

  function fit(instance, width) {
    instance.layoutAlign = 'STRETCH';
    if (instance.layoutMode === 'HORIZONTAL') {
      instance.primaryAxisSizingMode = 'FIXED';
    } else if (instance.layoutMode === 'VERTICAL') {
      instance.counterAxisSizingMode = 'FIXED';
    }
    instance.resize(Math.max(width, n['size-10']), instance.height);
  }
  async function mount(master, parent, roleName, source, propertyName, width) {
    let instance = role(parent, roleName);
    if (!instance) {
      instance = source.createInstance();
      parent.appendChild(instance);
      instance.setPluginData(roleKey, roleName);
    }
    const current = await instance.getMainComponentAsync();
    if (!current || current.id !== source.id) instance.swapInstance(source);
    instance.name = source.name.includes('=') ? setsFor(source).name : source.name;
    fit(instance, width);
    exposeProperty(master, instance, propertyName, 'INSTANCE_SWAP', source.id, 'mainComponent');
    await checkpoint();
    return instance;
  }
  function setsFor(source) {
    return source.parent.type === 'COMPONENT_SET' ? source.parent : source;
  }
  function hideLegacy(master, frame) {
    for (const node of frame.children.filter((node) => node.type === 'TEXT')) {
      // Retain the original text node/property IDs for existing consumers.
      node.visible = false;
      exposeProperty(master, node, 'Show legacy placeholder', 'BOOLEAN', false, 'visible');
    }
  }
  async function content(master, frame, source, propertyName, hug = true) {
    hideLegacy(master, frame);
    if (hug) frame.primaryAxisSizingMode = 'AUTO';
    frame.counterAxisSizingMode = 'FIXED';
    const instance = await mount(
      master,
      frame,
      'Projected component',
      source,
      propertyName,
      frame.width,
    );
    return instance;
  }

  // Typography and progress remain leaf components, but resize with their containers.
  for (const id of ['title', 'text', 'p', 'progress-bar']) {
    for (const master of sets.get(id).children) {
      master.counterAxisSizingMode = 'FIXED';
      for (const child of master.children) {
        child.layoutAlign = 'STRETCH';
        if (child.type === 'TEXT') child.textAutoResize = 'HEIGHT';
      }
    }
  }
  // Bottom-up configuration prevents recursive component dependencies.
  for (const master of sets.get('col').children) {
    await content(master, role(master, 'Content slot'), paragraph, 'Content component');
  }
  for (const master of sets.get('row').children) {
    master.primaryAxisSizingMode = 'FIXED';
    master.counterAxisSizingMode = 'AUTO';
    for (const index of [1, 2]) {
      const frame = role(master, `Column ${index}`);
      frame.layoutGrow = 1;
      await content(master, frame, column, `Column ${index} component`);
    }
  }
  for (const master of sets.get('grid').children) {
    await content(master, role(master, 'Content slot'), row, 'Rows component');
  }
  for (const id of ['page', 'bottom-sheet']) {
    for (const master of sets.get(id).children) {
      await content(master, role(master, 'Body slot'), grid, 'Body component', false);
      const footer = role(master, 'Footer slot');
      const cta = footer.children.find((node) => node.type === 'INSTANCE');
      exposeProperty(master, cta, 'Footer component', 'INSTANCE_SWAP', button.id, 'mainComponent');
    }
  }
  for (const master of buttonSet.children) {
    const source = master.getPluginData(tag);
    if (source.endsWith('/icon') || source.endsWith('/min-icon')) {
      const instance = role(master, 'Icon slot');
      exposeProperty(master, instance, 'Icon', 'INSTANCE_SWAP', icon.id, 'mainComponent');
    } else {
      for (const [name, atStart] of [
        ['Leading icon', true],
        ['Trailing icon', false],
      ]) {
        const instance = await mount(master, master, name, icon, name, n['size-240']);
        instance.layoutAlign = 'INHERIT';
        instance.visible = false;
        exposeProperty(master, instance, `Show ${name.toLowerCase()}`, 'BOOLEAN', false, 'visible');
        if (atStart) master.insertChild(0, instance);
      }
      master.itemSpacing = n['size-80'];
    }
  }
  // A content component the designer can choose in a column's Content component property.
  const example = component('composition/content', 'Composition / Content');
  example.description =
    'Consumer-owned composition example: UITitle, UIP, UIText, UIProgressBar and UIButton. Select it in a Content component instance-swap property.';
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
    let instance = role(example, name);
    if (!instance) {
      instance = source.createInstance();
      example.appendChild(instance);
      instance.setPluginData(roleKey, name);
    }
    instance.name = name;
    fit(instance, example.width);
  }
  return {
    example,
    page: variant('page', 'page/white/white/true'),
    sheet: variant('bottom-sheet', 'bottom-sheet/true/true'),
  };
}

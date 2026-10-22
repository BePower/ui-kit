/* global figma, DATA */
// Visual adapters for exported Angular primitives. Runtime semantics stay in Angular/Ionic.
async function renderComponents({
  component,
  variants,
  bindFill,
  textStyles,
  iconSets,
  buttonSet,
  checkpoint,
  exposeText: expose,
}) {
  const n = DATA.numbers;
  const tag = 'bepower-source';
  const library = [];
  const width = n['size-360'] * 10; // Example viewport, not an application width contract.
  const height = n['size-320'] * 20;
  function values(id, name) {
    const input = DATA.components[id].inputs[name];
    const initial = input.default.replace(/['"]/g, '');
    return [...input.values].sort((a, b) => (a === initial ? -1 : b === initial ? 1 : 0));
  }
  function child(parent, role, type) {
    let node = parent.children.find((item) => item.getPluginData('bepower-role') === role);
    if (!node && type === 'TEXT' && role === 'Label') {
      node = parent.children
        .find((item) => item.getPluginData('bepower-role') === 'Button content')
        ?.children.find((item) => item.getPluginData('bepower-role') === role);
    }
    if (!node) {
      node = type === 'TEXT' ? figma.createText() : figma.createFrame();
      node.setPluginData('bepower-role', role);
      parent.appendChild(node);
    }
    node.name = role;
    return node;
  }
  function frame(parent, role, direction = 'VERTICAL') {
    const node = child(parent, role, 'FRAME');
    node.fills = [];
    node.layoutMode = direction;
    node.primaryAxisSizingMode = 'AUTO';
    node.counterAxisSizingMode = 'AUTO';
    node.itemSpacing = 0;
    return node;
  }
  function fixed(node, w, h) {
    node.primaryAxisSizingMode = 'FIXED';
    node.counterAxisSizingMode = 'FIXED';
    node.resize(w, h);
  }
  function fullWidth(node, w = width) {
    node.counterAxisSizingMode = 'FIXED';
    node.resize(w, node.height);
    node.layoutAlign = 'STRETCH';
  }
  function moveRoles(parent, destination, roles) {
    for (const role of roles) {
      const node = parent.children.find((item) => item.getPluginData('bepower-role') === role);
      if (node) destination.appendChild(node);
    }
  }
  async function text(parent, role, value, style = 'p-m', w) {
    const node = child(parent, role, 'TEXT');
    const found = textStyles.find((item) => item.name === `BePower/${style.replaceAll('-', '/')}`);
    await node.setTextStyleIdAsync(found.id);
    node.characters = value;
    node.textAutoResize = w ? 'HEIGHT' : 'WIDTH_AND_HEIGHT';
    if (w) node.resize(w, node.height);
    bindFill(node, 'color-grey-default-grey');
    await checkpoint();
    return node;
  }
  function master(id, name) {
    const node = component(id, name);
    node.layoutMode = 'VERTICAL';
    node.primaryAxisSizingMode = 'AUTO';
    node.counterAxisSizingMode = 'AUTO';
    node.fills = [];
    node.itemSpacing = 0;
    return node;
  }
  function cssNumber(id, selector, property) {
    const value = DATA.styles[id].find(
      (rule) =>
        rule.selector.split(',').some((item) => item.trim() === selector) &&
        rule.declarations[property] !== undefined,
    )?.declarations[property];
    if (!value || !Number.isFinite(parseFloat(value))) {
      throw new Error(`Update ${id} Figma adapter: missing ${selector} / ${property}`);
    }
    return parseFloat(value) * (value.endsWith('rem') ? 16 : 1);
  }
  function register(id, title, nodes, note) {
    const set = variants(nodes, `components/${id}`, title, 0);
    set.description = `${DATA.components[id].source}\n${note}`;
    library.push({ id, title, set, note });
  }
  function icon(parent, role, name, fill, size) {
    const set = iconSets.find((item) => item.name === `UIIcon / ${name}`);
    const sourceId = `icon/${name}/${fill}${size === 24 ? '' : `/${size}`}`;
    const source = set.children.find((item) => item.getPluginData(tag) === sourceId);
    let instance = parent.children.find((item) => item.getPluginData('bepower-role') === role);
    if (!instance) {
      instance = source.createInstance();
      instance.setPluginData('bepower-role', role);
      parent.appendChild(instance);
    }
    return instance;
  }
  async function slot(parent, role, w, h) {
    const body = frame(parent, role);
    fixed(body, w, h);
    const label = await text(
      body,
      'Content',
      w < n['size-800'] ? 'Slot' : 'Contenuto del consumer',
      'p-m',
      w,
    );
    return { body, label };
  }
  function footerButton(parent) {
    let instance = parent.children.find((item) => item.type === 'INSTANCE');
    if (!instance) {
      const source = buttonSet.children.find(
        (item) => item.getPluginData(tag) === 'button/primary/default',
      );
      instance = source.createInstance();
      parent.appendChild(instance);
    }
    // The CTA demonstrates `expand`; resize the instance, never its shared master.
    instance.primaryAxisSizingMode = 'FIXED';
    instance.resize(width - parent.paddingLeft - parent.paddingRight, DATA.button.height);
    instance.layoutAlign = 'STRETCH';
    instance.layoutGrow = 0;
    return instance;
  }
  function footer(parent, id, selector, visible, background) {
    const node = frame(parent, 'Footer slot');
    fullWidth(node);
    node.visible = visible;
    node.layoutGrow = 0;
    node.paddingLeft = cssNumber(id, selector, '--padding-start');
    node.paddingRight = cssNumber(id, selector, '--padding-end');
    node.paddingTop = cssNumber(id, selector, '--padding-top');
    node.paddingBottom = cssNumber(id, selector, '--padding-bottom');
    node.itemSpacing = n['size-160'];
    bindFill(node, background);
    footerButton(node);
    return node;
  }
  for (const size of DATA.components.button.inputs.size.values.filter(
    (value) => value !== 'default',
  )) {
    for (const variant of DATA.components.button.inputs.variant.values) {
      if (size === 'inline' && variant !== 'secondary') continue;
      for (const state of ['default', 'disabled']) {
        const node = master(
          `button/${variant}/${state}/${size}`,
          `variant=${variant}, state=${state}, size=${size}`,
        );
        node.layoutMode = 'HORIZONTAL';
        node.primaryAxisAlignItems = 'CENTER';
        node.counterAxisAlignItems = 'CENTER';
        node.opacity = state === 'disabled' ? DATA.button.disabledOpacity : 1;
        node.cornerRadius =
          size === 'icon'
            ? cssNumber('button', ':host(.icon) ion-button', '--border-radius')
            : size === 'inline'
              ? 0
              : DATA.button.radius;
        node.strokes = [];
        if (variant === 'primary') bindFill(node, 'color-primary-yellow-eni');
        if (variant === 'outlined') {
          const { a, ...rgb } = DATA.colors['color-grey-default-grey'];
          node.strokes = [{ type: 'SOLID', color: rgb, opacity: a }];
          node.strokeWeight = 1;
        }
        if (size === 'inline') {
          const label = await text(node, 'Label', 'Scopri di più', 'button-text-link');
          expose(node, label, 'Label', 'Scopri di più');
        } else {
          const padding =
            size === 'icon' ? cssNumber('button', ':host(.icon) ion-button', '--padding-start') : 0;
          node.paddingLeft = node.paddingRight = node.paddingTop = node.paddingBottom = padding;
          icon(node, 'Icon slot', 'plus', 'no-fill', 24);
          if (size === 'icon') fixed(node, DATA.button.height, DATA.button.height);
        }
        if (node.parent !== buttonSet) buttonSet.appendChild(node);
      }
    }
  }
  const titles = [];
  for (const size of values('title', 'size')) {
    const node = master(`title/${size}`, `size=${size}`);
    const label = await text(node, 'Text', 'Titolo della sezione', `title-${size}`);
    expose(node, label, 'Text', 'Titolo della sezione');
    titles.push(node);
  }
  register(
    'title',
    'UITitle',
    titles,
    'size: xl/l/m/s → h1/h2/h3/h4. Colore modificabile tramite variabili. ariaLabel/ariaHidden restano responsabilità del prodotto.',
  );

  const texts = [];
  for (const variant of DATA.components.text.inputs.variant.values) {
    const type = variant === 'inherit' ? 'p-m' : variant.replace('body-', 'p-');
    const node = master(`text/${variant}`, `variant=${variant}`);
    const label = await text(node, 'Text', 'Testo di esempio', type);
    expose(node, label, 'Text', 'Testo di esempio');
    texts.push(node);
  }
  register(
    'text',
    'UIText',
    texts,
    'Tutte le varianti tipografiche. inherit è mostrato nel contesto p-m: Figma non eredita il font dal DOM. Colore tramite variabili.',
  );

  const paragraphs = [];
  for (const align of ['start', 'center', 'end']) {
    const node = master(`p/${align}`, `align=${align}`);
    const label = await text(
      node,
      'Text',
      'Un paragrafo per raccontare il prossimo viaggio.',
      'p-m',
      width,
    );
    label.textAlignHorizontal = { start: 'LEFT', center: 'CENTER', end: 'RIGHT' }[align];
    expose(node, label, 'Text', 'Un paragrafo per raccontare il prossimo viaggio.');
    paragraphs.push(node);
  }
  register(
    'p',
    'UIP',
    paragraphs,
    'Paragrafo p-m, align start/center/end. Start/end sono mostrati in direzione LTR; verificare RTL nell’app.',
  );

  const progressHeight = cssNumber('progress-bar', ':host ion-progress-bar', 'height');
  const progressRadius = cssNumber('progress-bar', ':host ion-progress-bar', 'border-radius');
  async function progress(parent, role, value, w) {
    const track = frame(parent, role);
    fixed(track, w, progressHeight);
    track.layoutMode = 'NONE';
    track.cornerRadius = progressRadius;
    const background = frame(track, 'Track');
    background.layoutMode = 'NONE';
    background.resize(w, progressHeight);
    background.x = background.y = 0;
    background.cornerRadius = progressRadius;
    background.constraints = { horizontal: 'STRETCH', vertical: 'MIN' };
    bindFill(background, 'color-primary-accessible-green');
    background.opacity = 0.2; // Ionic track approximation, documented in the catalog.
    const bar = frame(track, 'Value');
    bar.layoutMode = 'NONE';
    bar.visible = value > 0;
    bar.resize(Math.max(w * value, 0.01), progressHeight);
    bar.x = bar.y = 0;
    bar.cornerRadius = progressRadius;
    bar.constraints = { horizontal: 'SCALE', vertical: 'MIN' };
    bindFill(bar, 'color-primary-accessible-green');
    return track;
  }
  const bars = [];
  for (const value of [0, 0.25, 0.5, 0.75, 1]) {
    const node = master(`progress-bar/${value}`, `value=${value}`);
    await progress(node, 'Progress', value, width);
    bars.push(node);
  }
  register(
    'progress-bar',
    'UIProgressBar',
    bars,
    'Campioni statici 0/25/50/75/100%. In Angular value è continuo. Altezza/raggio da Sass, colore tertiary. Track al 20% come approssimazione Ionic. ariaLabel richiesto salvo ariaHidden.',
  );

  const horizontal = values('grid', 'horizontal');
  const grids = [];
  for (const fixedWidth of [false, true]) {
    for (const inset of horizontal) {
      const node = master(
        `grid/${fixedWidth}/${inset}`,
        `fixed=${fixedWidth}, horizontal=${inset}`,
      );
      const padding = n[`spacing-${inset}`];
      node.paddingLeft = node.paddingRight = padding;
      node.counterAxisSizingMode = 'FIXED';
      node.resize(width, node.height);
      await slot(node, 'Content slot', width - padding * 2, n['size-800']);
      grids.push(node);
    }
  }
  register(
    'grid',
    'UIGrid',
    grids,
    'Tutti gli inset horizontal e fixed true/false. Esempio largo 360px: fixed ha lo stesso aspetto su mobile. Breakpoint e CSS Ionic non vengono eseguiti in Figma. Il testo è contenuto consumer di esempio.',
  );
  const rows = [];
  for (const gap of values('row', 'gap')) {
    const node = master(`row/${gap}`, `gap=${gap}`);
    node.layoutMode = 'HORIZONTAL';
    node.itemSpacing = n[`spacing-${gap}`];
    const columnWidth = (width - node.itemSpacing) / 2;
    await slot(node, 'Column 1', columnWidth, n['size-800']);
    await slot(node, 'Column 2', columnWidth, n['size-800']);
    rows.push(node);
  }
  register(
    'row',
    'UIRow',
    rows,
    'Tutti i gap, top/bottom=none. Figma usa auto layout come approssimazione visiva; Angular applica mezzi gutter e margini negativi, non CSS gap. Top/bottom modificabili come padding, non varianti cartesiane.',
  );
  const cols = [];
  for (const size of ['equal', 'auto', ...Array.from({ length: 12 }, (_, i) => String(i + 1))]) {
    const node = master(`col/${size}`, `size=${size}`);
    const w =
      size === 'equal' ? width / 2 : size === 'auto' ? width / 2 : (width * Number(size)) / 12;
    await slot(node, 'Content slot', w, n['size-800']);
    cols.push(node);
  }
  register(
    'col',
    'UICol',
    cols,
    'Span 1–12, equal (size omesso) e auto. Auto usa contenuto campione largo 180px. Allineamento, justify e inset sono modificabili con auto layout; dipendono dal contenitore. Non emula le percentuali CSS.',
  );

  const sheets = [];
  for (const close of [true, false]) {
    for (const hasFooter of [false, true]) {
      const node = master(
        `bottom-sheet/${close}/${hasFooter}`,
        `showCloseButton=${close}, hasFooter=${hasFooter}`,
      );
      fixed(node, width, height / 2);
      node.topLeftRadius = node.topRightRadius = n['size-240'];
      node.bottomLeftRadius = node.bottomRightRadius = 0;
      node.clipsContent = true;
      bindFill(node, 'color-background-white');
      const header = frame(node, 'Header', 'HORIZONTAL');
      header.primaryAxisAlignItems = 'MAX';
      header.counterAxisAlignItems = 'CENTER';
      header.paddingLeft = header.paddingRight = cssNumber(
        'bottom-sheet',
        '.header-toolbar',
        '--padding-start',
      );
      header.paddingTop = cssNumber('bottom-sheet', '.header-toolbar', '--padding-top');
      header.paddingBottom = 0;
      fixed(
        header,
        width,
        cssNumber('bottom-sheet', '.header-toolbar', '--min-height') + header.paddingTop,
      );
      header.layoutAlign = 'STRETCH';
      header.layoutGrow = 0;
      bindFill(header, 'color-background-white');
      const closeIcon = icon(header, 'Close', 'close', 'no-fill', 32);
      closeIcon.visible = close;
      for (const vector of closeIcon.findAll((item) => item.type === 'VECTOR')) {
        if (Array.isArray(vector.fills) && vector.fills.length)
          bindFill(vector, 'color-primary-e-mobility-green');
      }
      const body = await slot(node, 'Body slot', width, n['size-800'] * 2);
      body.body.layoutGrow = 1;
      body.body.layoutAlign = body.label.layoutAlign = 'STRETCH';
      expose(node, body.label, 'Content', 'Contenuto del consumer');
      footer(node, 'bottom-sheet', 'ion-footer ion-toolbar', hasFooter, 'color-background-white');
      sheets.push(node);
    }
  }
  register(
    'bottom-sheet',
    'UIBottomSheet',
    sheets,
    'Tutte le combinazioni showCloseButton/hasFooter. Shell statica 360×320 (metà viewport campione 640); in app l’altezza cresce fino alla safe area. Body e footer sono contenuto consumer. Close label, focus, scrolling, backdrop e dismiss sono gestiti dal servizio Ionic, non dal componente Figma.',
  );

  const backgrounds = {
    white: 'color-background-white',
    grey: 'color-background-grey',
    green: 'color-background-e-mobility-green-16',
    yellow: 'color-background-yellow-eni-8',
    'light-green': 'color-background-light-green-24',
  };
  const pages = [];
  for (const background of DATA.components.page.inputs.background.values) {
    for (const headerType of ['none', ...DATA.components.page.inputs.headerType.values]) {
      for (const hasFooter of [false, true]) {
        const node = master(
          `page/${background}/${headerType}/${hasFooter}`,
          `background=${background}, header=${headerType}, hasFooter=${hasFooter}`,
        );
        fixed(node, width, height);
        bindFill(node, backgrounds[background]);
        const header = frame(node, 'Header');
        header.visible = headerType !== 'none';
        fullWidth(header);
        header.layoutGrow = 0;
        header.paddingLeft = header.paddingRight = header.paddingTop = header.paddingBottom = 0;
        const toolbar = frame(header, 'Title toolbar');
        fullWidth(toolbar);
        // Migrate the existing title node so its instance property/overrides keep their IDs.
        moveRoles(header, toolbar, ['Title']);
        toolbar.paddingLeft = cssNumber('page', ':host ion-header ion-toolbar', '--padding-start');
        toolbar.paddingRight = cssNumber('page', ':host ion-header ion-toolbar', '--padding-end');
        toolbar.paddingTop = cssNumber('page', ':host ion-header ion-toolbar', '--padding-top');
        toolbar.paddingBottom = cssNumber(
          'page',
          ':host ion-header ion-toolbar',
          '--padding-bottom',
        );
        bindFill(
          toolbar,
          headerType === 'green' ? 'color-primary-e-mobility-green' : backgrounds[background],
        );
        const title = await text(
          toolbar,
          'Title',
          'Titolo pagina',
          'title-s',
          width - toolbar.paddingLeft - toolbar.paddingRight,
        );
        title.textAlignHorizontal = 'CENTER';
        title.layoutAlign = 'STRETCH';
        bindFill(
          title,
          headerType === 'green'
            ? 'color-grey-white'
            : headerType === 'tab'
              ? 'color-primary-e-mobility-green'
              : 'color-grey-default-grey',
        );
        expose(node, title, 'Title', 'Titolo pagina');
        if (headerType === 'step') {
          const step = frame(header, 'Step toolbar');
          fullWidth(step);
          moveRoles(header, step, ['Step progress', 'Step label']);
          const selector = 'ion-header ion-toolbar.header-step-toolbar';
          step.paddingLeft = cssNumber('page', selector, '--padding-start');
          step.paddingRight = cssNumber('page', selector, '--padding-end');
          step.paddingTop = cssNumber('page', selector, '--padding-top');
          step.paddingBottom = cssNumber('page', selector, '--padding-bottom');
          step.itemSpacing = n['size-80'];
          const available = width - step.paddingLeft - step.paddingRight;
          const track = await progress(step, 'Step progress', 0.5, available);
          track.layoutAlign = 'STRETCH';
          const label = await text(step, 'Step label', '2 di 4', 'label-l', available);
          label.textAlignHorizontal = 'RIGHT';
          label.layoutAlign = 'STRETCH';
        }
        const body = await slot(node, 'Body slot', width, n['size-800'] * 4);
        body.body.layoutGrow = 1;
        body.body.layoutAlign = body.label.layoutAlign = 'STRETCH';
        expose(node, body.label, 'Content', 'Contenuto del consumer');
        footer(node, 'page', ':host ion-footer ion-toolbar', hasFooter, backgrounds[background]);
        pages.push(node);
      }
    }
  }
  register(
    'page',
    'UIPage',
    pages,
    'Tutti i background × header none/white/green/tab/step × hasFooter. Viewport campione 360×640. header=none corrisponde a hasHeader=false; gli altri a hasHeader=true + headerType. Content e CTA sono slot consumer dimostrativi. Non simula condensedHeader, translucent, safe area, navigazione, azioni header o elevazione da scroll. Titolo accessibile richiesto nel codice.',
  );
  const covered = new Set(['button', 'icon', ...library.map((item) => item.id)]);
  for (const id of Object.keys(DATA.components)) {
    if (!covered.has(id)) throw new Error(`Exported component has no Figma adapter: ${id}`);
  }
  return library;
}

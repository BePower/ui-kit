/* global figma, DATA */
// Visual adapters for exported Angular primitives. Runtime semantics stay in Angular/Ionic.
async function renderComponents({
  page,
  getComponentSet,
  component,
  variants,
  bindFill,
  bindStroke,
  textStyles,
  iconSets,
  buttonSet,
  checkpoint,
  exposeText: expose,
  exposeProperty,
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
  function register(id, title, nodes, note, dataId = id) {
    const set = variants(nodes, `components/${id}`, title, 0);
    set.description = `${DATA.components[dataId].source}\n${note}`;
    library.push({ id, title, set, note, dataId });
    return set;
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
    // Do not recreate placeholder text inside slots that are already in use.
    if (body.type === 'SLOT')
      return {
        body,
        label: body.children.find(
          (node) => node.type === 'TEXT' && node.getPluginData('bepower-role') === 'Content',
        ),
      };
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
    instance.counterAxisSizingMode = 'FIXED';
    instance.primaryAxisAlignItems = 'CENTER';
    instance.counterAxisAlignItems = 'CENTER';
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
          node.paddingLeft = node.paddingRight = node.paddingTop = node.paddingBottom = 0;
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
  const pictograms = [];
  const statusPictograms = new Set(['positive', 'negative', 'info']);
  for (const name of DATA.components.pictogram.inputs.name.values) {
    const svg = DATA.pictograms[name];
    if (!svg) throw new Error(`UIPictogram source missing: ${name}`);
    const family = statusPictograms.has(name) ? 'Status' : 'Contextual';
    const usage =
      family === 'Status'
        ? 'Esito o condizione oggettiva del sistema.'
        : 'Contenuto, funzionalità o contesto della schermata.';
    for (const size of values('pictogram', 'size')) {
      const renderedSize = cssNumber('pictogram', `img.size-${size}`, 'width');
      const node = master(`pictogram/${name}/${size}`, `name=${name}, size=${size}`);
      node.description = `${family} · ${usage} Decorativo: accompagna sempre un testo.`;
      node.layoutMode = 'NONE';
      fixed(node, renderedSize, renderedSize);
      const vector = figma.createNodeFromSvg(svg);
      vector.rescale(renderedSize / vector.width);
      vector.x = vector.y = 0;
      node.children.forEach((item) => item.remove());
      node.appendChild(vector);
      pictograms.push(node);
      await checkpoint();
    }
  }
  register(
    'pictogram',
    'UIPictogram',
    pictograms,
    'Pittogrammi decorativi. Contextual per il contesto della schermata; Status per esiti oggettivi. Feedback non disponibile. Guida completa nella pagina _Pictogram.',
  );

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
    for (const top of values('row', 'top')) {
      for (const bottom of values('row', 'bottom')) {
        // Preserve existing masters and their instances for the original gap-only variants.
        const id =
          top === 'none' && bottom === 'none' ? `row/${gap}` : `row/${gap}/${top}/${bottom}`;
        const node = master(id, `gap=${gap}, top=${top}, bottom=${bottom}`);
        // Keep the same axes and width contract across variants. The Columns slot
        // owns the horizontal layout; row padding only contributes to its height.
        node.layoutMode = 'VERTICAL';
        node.primaryAxisSizingMode = 'AUTO';
        node.counterAxisSizingMode = 'FIXED';
        node.layoutAlign = 'STRETCH';
        node.layoutGrow = 0;
        node.minWidth = 0;
        node.resize(width, node.height);
        node.itemSpacing = 0;
        node.paddingTop = n[`spacing-${top}`];
        node.paddingBottom = n[`spacing-${bottom}`];
        const columnWidth = (width - n[`spacing-${gap}`]) / 2;
        if (!node.children.some((child) => child.getPluginData('bepower-role') === 'Columns')) {
          await slot(node, 'Column 1', columnWidth, n['size-800']);
          await slot(node, 'Column 2', columnWidth, n['size-800']);
        }
        rows.push(node);
      }
    }
  }
  register(
    'row',
    'UIRow',
    rows,
    'Tutte le combinazioni gap/top/bottom dagli input Angular. Top e bottom applicano i token spacing come padding verticale. Figma usa auto layout come approssimazione visiva; Angular applica mezzi gutter e margini negativi, non CSS gap.',
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
      body.body.layoutAlign = 'STRETCH';
      if (body.label) body.label.layoutAlign = 'STRETCH';
      if (body.label) expose(node, body.label, 'Content', 'Contenuto del consumer');
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
        body.body.layoutAlign = 'STRETCH';
        if (body.label) body.label.layoutAlign = 'STRETCH';
        if (body.label) expose(node, body.label, 'Content', 'Contenuto del consumer');
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

  const radioButtonStates = [
    { id: 'simple-default', name: 'Simple / Default', presentation: 'simple' },
    { id: 'simple-selected', name: 'Simple / Selected', presentation: 'simple' },
    { id: 'simple-error', name: 'Simple / Error', presentation: 'simple' },
    { id: 'simple-disabled', name: 'Simple / Disabled', presentation: 'simple' },
    { id: 'simple-focus', name: 'Simple / Focus', presentation: 'simple' },
    { id: 'description-default', name: 'With description / Default', presentation: 'description' },
    {
      id: 'description-selected',
      name: 'With description / Selected',
      presentation: 'description',
    },
    { id: 'description-error', name: 'With description / Error', presentation: 'description' },
    {
      id: 'description-disabled',
      name: 'With description / Disabled',
      presentation: 'description',
    },
    { id: 'description-focus', name: 'With description / Focus', presentation: 'description' },
  ];
  const radioButtons = [];
  for (const state of radioButtonStates) {
    const hasDescription = state.presentation === 'description';
    const isError = state.id.endsWith('-error');
    const isDisabled = state.id.endsWith('-disabled');
    const isSelected = state.id.endsWith('-selected');
    const isFocus = state.id.endsWith('-focus');
    const node = master(`radio-button/${state.id}`, `Property 1=${state.name}`);
    const radioWidth = hasDescription ? 232 : 210;
    const radioHeight = hasDescription ? 60 : 24;
    fixed(node, radioWidth, radioHeight);
    node.layoutMode = 'HORIZONTAL';
    node.primaryAxisAlignItems = 'MIN';
    node.counterAxisAlignItems = hasDescription ? 'MIN' : 'CENTER';
    node.itemSpacing = n['size-80'];
    node.fills = [];
    node.strokes = [];

    const radioArea = frame(node, 'Radio', 'HORIZONTAL');
    fixed(radioArea, n['size-240'], n['size-240']);
    radioArea.primaryAxisAlignItems = 'CENTER';
    radioArea.counterAxisAlignItems = 'CENTER';

    const circle = frame(radioArea, 'Radio circle');
    fixed(circle, n['size-180'], n['size-180']);
    circle.layoutMode = 'NONE';
    circle.cornerRadius = n['size-180'] / 2;
    circle.strokeAlign = 'INSIDE';
    circle.strokeWeight = n['size-15'];
    circle.fills = [];
    bindFill(
      circle,
      isError
        ? 'color-error-lavender-blush'
        : isDisabled
          ? 'color-background-grey'
          : 'color-background-white',
    );
    bindStroke(
      circle,
      isSelected
        ? 'color-primary-e-mobility-green'
        : isError
          ? 'color-error-allert-red'
          : isDisabled
            ? 'color-grey-default-grey-72'
            : 'color-grey-default-grey',
    );

    const dot = frame(circle, 'Selected dot');
    fixed(dot, n['size-120'], n['size-120']);
    dot.layoutMode = 'NONE';
    dot.x = dot.y = (n['size-180'] - n['size-120']) / 2;
    dot.cornerRadius = n['size-120'] / 2;
    dot.visible = isSelected;
    bindFill(dot, 'color-primary-e-mobility-green');

    const copy = frame(node, 'Copy');
    const copyWidth = hasDescription ? 200 : 178;
    copy.primaryAxisSizingMode = 'FIXED';
    copy.counterAxisSizingMode = 'FIXED';
    copy.resize(copyWidth, radioHeight);
    copy.itemSpacing = 0;
    const label = await text(
      copy,
      hasDescription ? 'Title' : 'Label',
      hasDescription ? 'Titolo dell’opzione' : 'Etichetta dell’opzione',
      hasDescription ? 'label-l' : 'p-m',
      copyWidth,
    );
    label.layoutAlign = 'STRETCH';
    bindFill(
      label,
      isError
        ? 'color-error-ruby-red'
        : isDisabled
          ? 'color-grey-default-grey-72'
          : 'color-grey-default-grey',
    );
    let description;
    if (hasDescription) {
      description = await text(
        copy,
        'Description',
        'Una breve descrizione dell’opzione',
        'p-s',
        copyWidth,
      );
      description.layoutAlign = 'STRETCH';
      bindFill(description, 'color-grey-default-grey-72');
    }

    const focusRing = frame(node, 'Focus ring');
    fixed(focusRing, radioWidth + 8, radioHeight + 8);
    focusRing.layoutMode = 'NONE';
    focusRing.layoutPositioning = 'ABSOLUTE';
    focusRing.x = focusRing.y = -n['size-40'];
    focusRing.cornerRadius = n['size-40'];
    focusRing.strokeAlign = 'INSIDE';
    focusRing.strokeWeight = n['size-20'];
    focusRing.fills = [];
    focusRing.visible = isFocus;
    bindStroke(focusRing, 'color-grey-default-grey');
    radioButtons.push(node);
  }
  const radioButtonSet = register(
    'radio-button',
    'UIRadioButton',
    radioButtons,
    'Varianti Simple e With description, ciascuna con stati Default/Selected/Error/Disabled/Focus. Il radio button non è una radio card: nessuna superficie, bordo, padding o radius. Focus ring con radius 4px e offset 4px. In Angular ion-radio-group gestisce selezione singola, frecce, Space e roving tabindex.',
  );
  for (const node of radioButtons) {
    const copy = child(node, 'Copy', 'FRAME');
    const title = copy.children.find((item) => item.getPluginData('bepower-role') === 'Title');
    const label = copy.children.find((item) => item.getPluginData('bepower-role') === 'Label');
    const description = copy.children.find(
      (item) => item.getPluginData('bepower-role') === 'Description',
    );
    expose(
      radioButtonSet,
      label || title,
      label ? 'Label' : 'Title',
      label ? 'Etichetta dell’opzione' : 'Titolo dell’opzione',
    );
    if (description)
      expose(radioButtonSet, description, 'Description', 'Una breve descrizione dell’opzione');
  }

  const radioCardContents = [
    { id: 'full', name: 'Title + Description', title: true, description: true },
    { id: 'title-only', name: 'Title only', title: true, description: false },
    { id: 'description-only', name: 'Description only', title: false, description: true },
  ];
  const radioCardStates = [
    { id: 'default', name: 'Default' },
    { id: 'selected', name: 'Selected' },
    { id: 'error', name: 'Error' },
    { id: 'disabled', name: 'Disabled' },
    { id: 'focus', name: 'Focus' },
  ];
  const radioCards = [];
  const radioCardTitleOnly = [];
  const radioCardDescriptionOnly = [];
  for (const content of radioCardContents) {
    for (const state of radioCardStates) {
      const fullContent = content.id === 'full';
      const cardHeight = fullContent ? 98 : content.title ? 58 : 68;
      const copyHeight = fullContent ? 66 : content.title ? 26 : 36;
      const sourceId = fullContent
        ? `radio-card/${state.id}`
        : `radio-card/${content.id}/${state.id}`;
      const node = master(
        sourceId,
        fullContent ? `State=${state.name}` : `Content=${content.name}, State=${state.name}`,
      );
      fixed(node, 327, cardHeight);
      node.layoutMode = 'HORIZONTAL';
      node.layoutAlign = 'STRETCH';
      node.minWidth = 0;
      node.counterAxisSizingMode = 'AUTO';
      node.minHeight = cardHeight;
      node.primaryAxisAlignItems = 'MIN';
      node.counterAxisAlignItems = 'CENTER';
      node.paddingLeft = node.paddingRight = n['size-160'];
      node.paddingTop = node.paddingBottom = n['size-160'];
      node.itemSpacing = n['size-160'];
      node.cornerRadius = n['size-160'];
      node.strokeAlign = 'INSIDE';
      node.strokeWeight = ['selected', 'error'].includes(state.id) ? n['size-20'] : n['size-10'];
      bindFill(node, state.id === 'disabled' ? 'color-background-grey' : 'color-background-white');
      bindStroke(
        node,
        state.id === 'selected'
          ? 'color-primary-e-mobility-green'
          : state.id === 'error'
            ? 'color-error-allert-red'
            : 'color-grey-default-grey',
      );

      const radioArea = frame(node, 'Radio', 'HORIZONTAL');
      fixed(radioArea, n['size-240'], n['size-240']);
      radioArea.primaryAxisAlignItems = 'CENTER';
      radioArea.counterAxisAlignItems = 'CENTER';

      const circle = frame(radioArea, 'Radio circle');
      fixed(circle, n['size-180'], n['size-180']);
      circle.layoutMode = 'NONE';
      circle.cornerRadius = n['size-180'] / 2;
      circle.strokeAlign = 'INSIDE';
      circle.strokeWeight = n['size-15'];
      bindFill(
        circle,
        state.id === 'error'
          ? 'color-error-lavender-blush'
          : state.id === 'disabled'
            ? 'color-background-grey'
            : 'color-background-white',
      );
      bindStroke(
        circle,
        state.id === 'selected'
          ? 'color-primary-e-mobility-green'
          : state.id === 'error'
            ? 'color-error-allert-red'
            : state.id === 'disabled'
              ? 'color-grey-default-grey-72'
              : 'color-grey-default-grey',
      );

      const dot = frame(circle, 'Selected dot');
      fixed(dot, n['size-120'], n['size-120']);
      dot.layoutMode = 'NONE';
      dot.x = dot.y = (n['size-180'] - n['size-120']) / 2;
      dot.cornerRadius = n['size-120'] / 2;
      dot.visible = state.id === 'selected';
      bindFill(dot, 'color-primary-e-mobility-green');

      const copy = frame(node, 'Copy');
      copy.primaryAxisSizingMode = 'AUTO';
      copy.counterAxisSizingMode = 'FIXED';
      copy.layoutGrow = 1;
      copy.minWidth = 0;
      copy.resize(255, copyHeight);
      copy.itemSpacing = n['size-40'];
      for (const [role, enabled, value, style] of [
        ['Title', content.title, "Titolo dell'opzione", 'title-s'],
        [
          'Description',
          content.description,
          'Una breve descrizione che spiega cosa comporta questa scelta',
          'p-s',
        ],
      ]) {
        if (!enabled) {
          // Remove hidden text left by older bundles of the single-content cards.
          copy.children.find((item) => item.getPluginData('bepower-role') === role)?.remove();
          continue;
        }
        const label = await text(copy, role, value, style, 255);
        label.visible = true;
        label.layoutAlign = 'STRETCH';
        bindFill(
          label,
          state.id === 'error'
            ? 'color-error-ruby-red'
            : role === 'Description' || state.id === 'disabled'
              ? 'color-grey-default-grey-72'
              : 'color-grey-default-grey',
        );
      }

      const focusRing = frame(node, 'Focus ring');
      fixed(focusRing, 335, cardHeight + 8);
      focusRing.layoutMode = 'NONE';
      focusRing.layoutPositioning = 'ABSOLUTE';
      focusRing.x = focusRing.y = -n['size-40'];
      focusRing.cornerRadius = n['size-200'];
      focusRing.strokeAlign = 'INSIDE';
      focusRing.strokeWeight = n['size-20'];
      focusRing.fills = [];
      focusRing.visible = state.id === 'focus';
      bindStroke(focusRing, 'color-grey-default-grey');

      if (fullContent) radioCards.push(node);
      else if (content.title) radioCardTitleOnly.push(node);
      else radioCardDescriptionOnly.push(node);
    }
  }
  for (const node of [...radioCards, ...radioCardTitleOnly, ...radioCardDescriptionOnly]) {
    const currentPage =
      node.parent?.type === 'PAGE'
        ? node.parent
        : node.parent?.parent?.type === 'PAGE'
          ? node.parent.parent
          : null;
    if (currentPage !== page) page.appendChild(node);
  }
  const radioCardNote =
    'Varianti Title + Description, Title only e Description only con stati Default/Selected/Error/Disabled/Focus. In Angular focus, selezione ed errore sono dimensioni indipendenti; ion-radio-group gestisce selezione singola, frecce, Space e roving tabindex.';
  const radioCardSet = register('radio-card', 'UIRadioCard', radioCards, radioCardNote);
  const radioCardTitleOnlySet = register(
    'radio-card/title-only',
    'UIRadioCard / Title only',
    radioCardTitleOnly,
    'Varianti Title only della Radio Card. Il titolo è il nome accessibile; la superficie e gli stati restano quelli della Radio Card.',
    'radio-card',
  );
  const radioCardDescriptionOnlySet = register(
    'radio-card/description-only',
    'UIRadioCard / Description only',
    radioCardDescriptionOnly,
    'Varianti Description only della Radio Card. La descrizione diventa il nome accessibile; la superficie e gli stati restano quelli della Radio Card.',
    'radio-card',
  );
  function exposeRadioCardText(set, nodes) {
    for (const node of nodes) {
      const copy = child(node, 'Copy', 'FRAME');
      const title = copy.children.find((item) => item.name === 'Title');
      const description = copy.children.find((item) => item.name === 'Description');
      if (title) expose(set, title, 'Title', "Titolo dell'opzione");
      if (description)
        expose(
          set,
          description,
          'Description',
          'Una breve descrizione che spiega cosa comporta questa scelta',
        );
    }
  }
  exposeRadioCardText(radioCardSet, radioCards);
  exposeRadioCardText(radioCardTitleOnlySet, radioCardTitleOnly);
  exposeRadioCardText(radioCardDescriptionOnlySet, radioCardDescriptionOnly);

  const inputStates = [
    { id: 'default', name: 'Default', value: 'Placeholder text' },
    { id: 'typing', name: 'Typing', value: '|' },
    { id: 'filled', name: 'Compilato', value: 'Filled' },
    { id: 'disabled', name: 'Disabled', value: 'Placeholder text' },
    { id: 'error', name: 'Error', value: 'Filled' },
  ];
  const inputFields = [];
  for (const state of inputStates) {
    const node = master(`input-field/${state.id}`, `state=${state.name}`);
    node.counterAxisSizingMode = 'FIXED';
    node.resize(327, node.height);
    node.itemSpacing = n['size-80'];

    const label = await text(node, 'Label', 'Label', 'label-m', 327);
    label.layoutAlign = 'STRETCH';
    bindFill(
      label,
      state.id === 'error'
        ? 'color-error-ruby-red'
        : state.id === 'disabled'
          ? 'color-grey-default-grey-72'
          : 'color-grey-default-grey',
    );

    const field = frame(node, 'Field', 'HORIZONTAL');
    fixed(field, 327, 42);
    field.layoutAlign = 'STRETCH';
    field.primaryAxisAlignItems = 'MIN';
    field.counterAxisAlignItems = 'CENTER';
    field.paddingLeft = field.paddingRight = n['size-160'];
    field.paddingTop = field.paddingBottom = n['size-80'];
    field.itemSpacing = n['size-80'];
    field.cornerRadius = n['size-80'];
    field.strokeWeight = state.id === 'typing' ? n['size-20'] : n['size-10'];
    bindFill(
      field,
      state.id === 'error'
        ? 'color-error-lavender-blush'
        : state.id === 'disabled'
          ? 'color-grey-light-grey'
          : 'color-background-white',
    );
    bindStroke(
      field,
      state.id === 'error'
        ? 'color-error-allert-red'
        : state.id === 'disabled'
          ? 'color-grey-default-grey-72'
          : 'color-grey-default-grey',
    );

    const left = icon(field, 'Left icon', 'heart', 'no-fill', 24);
    left.visible = false;
    const value = await text(field, 'Text', state.value, 'p-m');
    value.layoutGrow = 1;
    value.layoutAlign = 'STRETCH';
    bindFill(
      value,
      state.id === 'error'
        ? 'color-error-ruby-red'
        : state.id === 'disabled' || state.id === 'default'
          ? 'color-grey-default-grey-72'
          : 'color-grey-default-grey',
    );
    const right = icon(field, 'Right icon', 'heart', 'no-fill', 24);
    right.visible = false;

    const bottom = await text(node, 'Bottom text', 'Bottom text here', 'p-s', 327);
    bottom.layoutAlign = 'STRETCH';
    bottom.visible = false;
    bindFill(bottom, state.id === 'error' ? 'color-error-ruby-red' : 'color-grey-default-grey-72');
    node.minWidth =
      field.paddingLeft +
      field.paddingRight +
      left.width +
      right.width +
      field.itemSpacing * 2 +
      n['size-10'];
    inputFields.push(node);
  }
  const inputSet = register(
    'input-field',
    'UIInputField',
    inputFields,
    'Stati Default/Typing/Compilato/Disabled/Error dal riferimento Foundation. Nel consumer Angular focus e contenuto determinano Typing/Compilato; disabled ed errorText/invalid determinano gli altri stati. Label, testo inferiore e icone sono configurabili; il codice usa un input nativo e supporta Angular Forms.',
  );
  for (let index = 0; index < inputFields.length; index++) {
    const node = inputFields[index];
    const state = inputStates[index];
    const label = child(node, 'Label', 'TEXT');
    const field = child(node, 'Field', 'FRAME');
    const value = child(field, 'Text', 'TEXT');
    const bottom = child(node, 'Bottom text', 'TEXT');
    const left = field.children.find((item) => item.getPluginData('bepower-role') === 'Left icon');
    const right = field.children.find(
      (item) => item.getPluginData('bepower-role') === 'Right icon',
    );
    expose(inputSet, label, 'Label', 'Label');
    expose(
      inputSet,
      value,
      ['default', 'disabled'].includes(state.id) ? 'Placeholder' : 'Value',
      value.characters,
    );
    expose(inputSet, bottom, 'Bottom text value', 'Bottom text here');
    exposeProperty(inputSet, label, 'Title', 'BOOLEAN', true, 'visible');
    exposeProperty(inputSet, value, 'Placeholder text', 'BOOLEAN', true, 'visible');
    exposeProperty(inputSet, bottom, 'Bottom text', 'BOOLEAN', false, 'visible');
    exposeProperty(inputSet, left, 'Left icon', 'BOOLEAN', false, 'visible');
    exposeProperty(inputSet, right, 'Right icon', 'BOOLEAN', false, 'visible');
    const leftMaster = await left.getMainComponentAsync();
    const rightMaster = await right.getMainComponentAsync();
    exposeProperty(
      inputSet,
      left,
      'Left icon choice',
      'INSTANCE_SWAP',
      leftMaster.id,
      'mainComponent',
    );
    exposeProperty(
      inputSet,
      right,
      'Right icon choice',
      'INSTANCE_SWAP',
      rightMaster.id,
      'mainComponent',
    );
  }

  const covered = new Set(['button', 'icon', ...library.map((item) => item.id)]);
  for (const id of Object.keys(DATA.components)) {
    if (!covered.has(id)) throw new Error(`Exported component has no Figma adapter: ${id}`);
  }
  return library;
}

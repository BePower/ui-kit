/* global figma, DATA */
// Only tagged documentation frames are rebuilt; masters and user-created layers stay intact.
async function createCatalog({ page, iconSet, buttonSet, bindFill, textStyles }) {
  const tag = 'bepower-source';
  const space = DATA.numbers;
  const gutter = space['spacing-s'];
  const width = space['size-800'] * 10;
  const column = (width - gutter) / 2;

  function stack(parent, name, direction = 'VERTICAL') {
    const frame = figma.createFrame();
    frame.name = name;
    frame.fills = [];
    frame.layoutMode = direction;
    frame.primaryAxisSizingMode = 'AUTO';
    frame.counterAxisSizingMode = 'AUTO';
    frame.itemSpacing = space['spacing-xxs'];
    parent.appendChild(frame);
    return frame;
  }
  async function text(parent, content, type = 'p-m', textWidth = width) {
    const node = figma.createText();
    parent.appendChild(node);
    node.name = content.split('\n')[0];
    const style = textStyles.find((item) => item.name === `BePower/${type.replaceAll('-', '/')}`);
    await node.setTextStyleIdAsync(style.id);
    node.characters = content;
    node.textAutoResize = 'HEIGHT';
    node.resize(textWidth, node.height);
    bindFill(node, 'color-grey-default-grey');
    return node;
  }
  function root(targetPage, id, name) {
    let frame = targetPage.children.find(
      (node) => node.type === 'FRAME' && node.getPluginData(tag) === id,
    );
    if (!frame) {
      frame = stack(targetPage, name);
      frame.setPluginData(tag, id);
    } else {
      frame.children.forEach((node) => node.remove());
    }
    frame.name = name;
    frame.layoutMode = 'VERTICAL';
    frame.primaryAxisSizingMode = 'AUTO';
    frame.counterAxisSizingMode = 'AUTO';
    frame.itemSpacing = space['spacing-xl'];
    frame.paddingTop = frame.paddingBottom = gutter;
    frame.paddingLeft = frame.paddingRight = gutter;
    bindFill(frame, 'color-background-white');
    return frame;
  }
  async function heading(parent, eyebrow, title, description) {
    const header = stack(parent, title);
    const accent = figma.createRectangle();
    header.appendChild(accent);
    accent.resize(space['size-480'], space['size-40']);
    bindFill(accent, 'color-primary-yellow-eni');
    await text(header, eyebrow, 'label-s');
    await text(header, title, 'title-xl');
    await text(header, description);
  }
  async function section(parent, title, description) {
    const frame = stack(parent, title);
    frame.itemSpacing = space['spacing-xs'];
    await text(frame, title, 'title-l');
    if (description) await text(frame, description, 'p-s');
    return frame;
  }
  const hex = ({ r, g, b, a }) =>
    '#' +
    [r, g, b, ...(a < 1 ? [a] : [])]
      .map((value) =>
        Math.round(value * 255)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
      .toUpperCase();

  let foundations = figma.root.children.find(
    (node) => node.getPluginData(tag) === 'foundations-page',
  );
  if (!foundations) {
    foundations = figma.createPage();
    foundations.name = 'BePower · Foundations';
    foundations.setPluginData(tag, 'foundations-page');
  }
  const board = root(foundations, 'foundations-board', 'Foundations / Repository reference');
  await heading(
    board,
    'BEPOWER / DESIGN SYSTEM',
    'Foundations',
    'Token valutati dal Sass di @bepower/ui-kit. Modifica il repository e rigenera: questa tavola è un riferimento, non una seconda fonte di verità.',
  );
  const colors = await section(
    board,
    '01 / Colori',
    'Colori solidi collegati alle variabili locali. Il valore esadecimale include alpha dove presente. Gradienti esclusi dal pilota.',
  );
  const entries = Object.entries(DATA.colors);
  for (let i = 0; i < entries.length; i += 2) {
    const row = stack(colors, 'Color tokens', 'HORIZONTAL');
    row.itemSpacing = gutter;
    for (const [name, value] of entries.slice(i, i + 2)) {
      const card = stack(row, name);
      const swatch = figma.createRectangle();
      card.appendChild(swatch);
      swatch.resize(column, space['size-800']);
      swatch.cornerRadius = space['size-80'];
      bindFill(swatch, name);
      await text(card, name, 'label-m', column);
      await text(card, hex(value), 'p-s', column);
    }
  }
  const typography = await section(
    board,
    '02 / Tipografia',
    `${DATA.fontFamily} · Stili testo collegati ai mixin del repository.`,
  );
  for (const [name, type] of Object.entries(DATA.typography)) {
    const sample = stack(typography, name);
    await text(sample, `${name} · ${type.size}/${type.lineHeight}px · ${type.weight}`, 'label-s');
    await text(sample, 'Energia per ogni nuovo viaggio', name);
  }
  const spacing = await section(
    board,
    '03 / Spaziature',
    'Scala spacing del repository, in pixel. I valori rem sono valutati con base 16px.',
  );
  const sizes = await section(
    board,
    '04 / Dimensioni',
    'Scala size condivisa. Le barre visualizzano la misura reale; il valore zero non ha barra.',
  );
  for (const [name, value] of Object.entries(DATA.numbers)) {
    const row = stack(name.startsWith('spacing-') ? spacing : sizes, name, 'HORIZONTAL');
    row.counterAxisAlignItems = 'CENTER';
    await text(row, `${name} · ${value}px`, 'p-s', column);
    if (value > 0) {
      const bar = figma.createRectangle();
      row.appendChild(bar);
      bar.resize(value, space['size-160']);
      bindFill(bar, 'color-primary-e-mobility-green');
    }
  }

  const catalog = root(page, 'component-catalog', 'Catalogo / Componenti e utilizzo');
  // Leave the original master sets where they are; new documentation starts below them.
  catalog.x = Math.min(iconSet.x, buttonSet.x);
  catalog.y = Math.max(iconSet.y + iconSet.height, buttonSet.y + buttonSet.height) + gutter;
  await heading(
    catalog,
    'BEPOWER / COMPONENT LIBRARY',
    'Componenti',
    'Esempi come istanze native dei master sopra questa tavola. Trascina i componenti da Assets, non copiare le tavole di documentazione.',
  );
  const buttonSection = await section(
    catalog,
    '01 / UIButton',
    'size=default · Primary: azione principale. Secondary: azione testuale sottolineata. Outlined: azione alternativa con bordo.',
  );
  const tableHeader = stack(buttonSection, 'Stati', 'HORIZONTAL');
  tableHeader.itemSpacing = gutter;
  await text(tableHeader, 'Default', 'label-l', column);
  await text(tableHeader, 'Disabled', 'label-l', column);
  for (const variant of ['primary', 'secondary', 'outlined']) {
    await text(buttonSection, variant, 'label-m');
    const row = stack(buttonSection, variant, 'HORIZONTAL');
    row.itemSpacing = gutter;
    for (const state of ['default', 'disabled']) {
      const cell = stack(row, `${variant} / ${state}`);
      cell.counterAxisSizingMode = 'FIXED';
      cell.resize(column, cell.height);
      const master = buttonSet.children.find(
        (node) => node.getPluginData(tag) === `button/${variant}/${state}`,
      );
      cell.appendChild(master.createInstance());
    }
  }
  await text(
    buttonSection,
    'Proprietà istanza: variant, state, Label.\nNel codice: variant, disabled, ariaLabel. state è una proprietà Figma, non un input Angular. Fornisci sempre un nome accessibile nel prodotto; il testo Figma non sostituisce ariaLabel.',
    'p-s',
  );
  await text(
    buttonSection,
    'Copertura: default e disabled. Non inclusi: loading, focus, hover, pressed, expand, inline, slot icone e altre dimensioni. Bordo outlined: approssimazione Ionic da confrontare con Storybook.',
    'p-s',
  );
  const iconSection = await section(
    catalog,
    '02 / UIIcon',
    'name=arrow · size=24 · Due varianti tratte dagli SVG esistenti. Il colore placeholder degli SVG è sostituito da default-grey.',
  );
  const iconRow = stack(iconSection, 'Varianti icona', 'HORIZONTAL');
  iconRow.itemSpacing = gutter;
  for (const master of iconSet.children.filter((node) => node.type === 'COMPONENT')) {
    const cell = stack(iconRow, master.name);
    cell.appendChild(master.createInstance());
    await text(cell, master.name, 'label-m', column);
  }
  await text(
    iconSection,
    'Nel codice: name, fill, size, color. Il pilota espone solo fill nelle istanze Figma. Non usare la sola icona per comunicare un significato senza un nome accessibile nel controllo che la contiene.',
    'p-s',
  );
  const workflow = await section(catalog, '03 / Aggiornamento e pubblicazione');
  await text(
    workflow,
    '1. Modifica token, stili o SVG nel repository.\n2. Esegui node scripts/build-figma-plugin.mjs.\n3. Avvia il plugin in Design mode nello stesso file.\n4. Controlla master, istanze e tavole, poi pubblica manualmente la libreria in Figma.\n5. Abilita la libreria negli altri file e accetta gli aggiornamenti.',
  );
  await text(
    workflow,
    'Le tavole generate vengono ricostruite a ogni esecuzione. Tieni note e contenuti personali fuori da questi frame. I master conservano gli identificativi; nessuna pubblicazione o sincronizzazione automatica.',
    'p-s',
  );
  return catalog;
}

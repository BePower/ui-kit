/* global figma, DATA */
// Only tagged documentation frames are rebuilt; masters and user-created layers stay intact.
async function createCatalog({
  page,
  iconSets,
  buttonSet,
  library,
  bindFill,
  textStyles,
  checkpoint,
  composition,
}) {
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
    await checkpoint();
    return node;
  }
  function root(targetPage, id, name) {
    let frame = figma.root.children
      .flatMap((target) => target.children)
      .find((node) => node.type === 'FRAME' && node.getPluginData(tag) === id);
    if (!frame) {
      frame = stack(targetPage, name);
      frame.setPluginData(tag, id);
    } else {
      frame.children.forEach((node) => node.remove());
      if (frame.parent !== targetPage) targetPage.appendChild(frame);
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

  function managedPage(id, name) {
    let target = figma.root.children.find((node) => node.getPluginData(tag) === id);
    if (!target) {
      target = figma.createPage();
      target.setPluginData(tag, id);
    }
    target.name = name;
    return target;
  }
  const foundationsHeader = managedPage('foundations-header', '---- 👑 FOUNDATIONS ----');
  const foundations = managedPage('foundations-page', '_Color & Accessibility');
  const typographyPage = managedPage('typography-page', '_Typography');
  const bordersPage = managedPage('borders-page', '_Borders & Radius');
  const spacingPage = managedPage('spacing-page', '_Grids & Spacing');
  const iconsPage = managedPage('icons-page', '_Icons');
  const shadowPage = managedPage('shadow-page', '_Shadow');
  const logoPage = managedPage('logo-page', '_Logo');
  const componentsHeader = managedPage('components-header', '---- 🧩 COMPONENTS ----');
  const compositionPage = managedPage('composition-page', '_Composition');
  page.name = '_Button';
  const componentPages = new Map(
    library.map((item) => [
      item.id,
      managedPage(
        `component-page/${item.id}`,
        `_${item.title.slice(2).replace('BottomSheet', 'Bottomsheet')}`,
      ),
    ]),
  );
  const allComponentPages = [page, ...componentPages.values()].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const ordered = [
    foundationsHeader,
    foundations,
    typographyPage,
    bordersPage,
    spacingPage,
    iconsPage,
    shadowPage,
    logoPage,
    componentsHeader,
    ...allComponentPages,
    compositionPage,
  ];
  ordered.forEach((target, index) => figma.root.insertChild(index, target));
  if (composition.example.parent !== compositionPage)
    compositionPage.appendChild(composition.example);
  composition.example.x = 0;
  composition.example.y = 0;
  const compositionBoard = root(compositionPage, 'composition-board', 'Composizione / Guida');
  compositionBoard.x = composition.example.width + gutter;
  await heading(
    compositionBoard,
    'BEPOWER / COMPOSITION',
    'Gerarchia di componenti',
    'Slot nativi aperti, senza numero massimo di figli. Espandi UIPage o UIBottomSheet nei Layers: Body → UIGrid → Rows → UIRow → Columns → UICol → Content. I due elementi iniziali sono esempi, non un limite.',
  );
  await text(
    compositionBoard,
    'Per personalizzare, seleziona lo slot nei Layers e trascina al suo interno istanze da Assets, oppure duplica, riordina e rimuovi quelle presenti. Body e Footer accettano molti elementi; Rows molte righe; Columns molte colonne. Non serve Detach né un componente wrapper.',
  );
  await text(
    compositionBoard,
    'Composition / Content è solo un esempio opzionale: puoi inserire direttamente UITitle, UIP, UIText, UIProgressBar e UIButton negli slot. Nei pulsanti abilita Show custom content per usare Content e nascondi Show label se necessario; gli swap delle icone restano disponibili.',
  );
  const compositionSamples = await section(compositionBoard, 'Esempi da esplorare nei Layers');
  const pageSample = composition.page.createInstance();
  compositionSamples.appendChild(pageSample);
  const body = pageSample.children.find((node) => node.type === 'SLOT' && node.name === 'Body');
  const sampleGrid = body.children.find(
    (node) => node.type === 'INSTANCE' && node.name === 'UIGrid',
  );
  const sampleRows = sampleGrid.children.find(
    (node) => node.type === 'SLOT' && node.name === 'Rows',
  );
  const rowSource = library
    .find((item) => item.id === 'row')
    .set.children.find((node) => node.getPluginData(tag) === 'row/xxs');
  for (let index = 0; index < 2; index++) {
    const instance = rowSource.createInstance();
    instance.name = 'UIRow';
    sampleRows.appendChild(instance);
  }
  const sampleRow = sampleRows.children.find((node) => node.type === 'INSTANCE');
  const sampleColumns = sampleRow.children.find(
    (node) => node.type === 'SLOT' && node.name === 'Columns',
  );
  const colSource = library
    .find((item) => item.id === 'col')
    .set.children.find((node) => node.getPluginData(tag) === 'col/equal');
  const thirdColumn = colSource.createInstance();
  thirdColumn.name = 'UICol';
  thirdColumn.layoutGrow = 1;
  sampleColumns.appendChild(thirdColumn);
  const footerSlot = pageSample.children.find(
    (node) => node.type === 'SLOT' && node.name === 'Footer',
  );
  footerSlot.appendChild(
    buttonSet.children
      .find((node) => node.getPluginData(tag) === 'button/secondary/default')
      .createInstance(),
  );
  compositionSamples.appendChild(composition.sheet.createInstance());
  await text(
    compositionBoard,
    'I vecchi testi Content restano conservati come placeholder nascosti: Show legacy placeholder li rende visibili. I master si aggiornano dal repository; crea composizioni personali fuori dalle tavole generate.',
    'p-s',
  );
  // Move the existing set, never recreate it: external instances retain their master IDs.
  let iconY = 0;
  let rowHeight = 0;
  iconSets.forEach((set, index) => {
    if (set.parent !== iconsPage) iconsPage.appendChild(set);
    if (index % 5 === 0 && index > 0) {
      iconY += rowHeight + gutter;
      rowHeight = 0;
    }
    set.x = (index % 5) * (space['size-800'] * 2 + gutter);
    set.y = iconY;
    rowHeight = Math.max(rowHeight, set.height);
  });
  buttonSet.x = 0;
  buttonSet.y = 0;
  const intro = root(foundationsHeader, 'foundations-intro', 'Foundations / Indice');
  await heading(
    intro,
    'BEPOWER / DESIGN SYSTEM',
    'Foundations',
    'Colori, tipografia, bordi, spaziature e icone nelle pagine dedicate. I token provengono dal repository. Le sezioni non esportate sono indicate esplicitamente.',
  );
  const componentsIntro = root(componentsHeader, 'components-intro', 'Components / Indice');
  await heading(
    componentsIntro,
    'BEPOWER / COMPONENT LIBRARY',
    'Components',
    'Tutti i componenti esportati da @bepower/ui-kit hanno una pagina dedicata. Le icone sono in Foundations / _Icons. Alert non è presente nel repository e non viene inventato.',
  );
  for (const item of library) {
    const target = componentPages.get(item.id);
    if (item.set.parent !== target) target.appendChild(item.set);
    item.set.x = item.set.y = 0;
    const documentation = root(target, `catalog/${item.id}`, `${item.title} / Catalogo`);
    documentation.y = item.set.height + gutter;
    await heading(documentation, 'BEPOWER / COMPONENT LIBRARY', item.title, item.note);
    await text(documentation, `Origine: ${DATA.components[item.id].source}`, 'p-s');
    await text(documentation, 'Input Angular (estratti dal codice)', 'title-l');
    for (const [name, input] of Object.entries(DATA.components[item.id].inputs)) {
      await text(
        documentation,
        `${name}: ${input.type} · default ${input.default}${input.required ? ' · required' : ''}`,
        'p-s',
      );
    }
    const examples = await section(documentation, 'Esempi come istanze');
    for (const master of item.set.children.filter((node) => node.type === 'COMPONENT')) {
      await text(examples, master.name, 'label-m');
      examples.appendChild(master.createInstance());
    }
    await text(componentsIntro, `${target.name} · ${item.set.children.length} varianti`, 'p-m');
  }
  await text(
    componentsIntro,
    '_Button · master esistenti conservati. _Icons · tutti i nomi, fill disponibili e sei dimensioni.',
    'p-m',
  );
  const board = root(foundations, 'foundations-board', 'Foundations / Repository reference');
  await heading(
    board,
    'BEPOWER / DESIGN SYSTEM',
    'Color & Accessibility',
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
    root(typographyPage, 'typography-board', 'Typography'),
    '02 / Tipografia',
    `${DATA.fontFamily} · Stili testo collegati ai mixin del repository.`,
  );
  for (const [name, type] of Object.entries(DATA.typography)) {
    const sample = stack(typography, name);
    await text(sample, `${name} · ${type.size}/${type.lineHeight}px · ${type.weight}`, 'label-s');
    await text(sample, 'Energia per ogni nuovo viaggio', name);
  }
  const spacing = await section(
    root(spacingPage, 'spacing-board', 'Grids & Spacing'),
    '03 / Spaziature',
    'Scala spacing del repository, in pixel. I valori rem sono valutati con base 16px.',
  );
  const sizes = await section(
    spacing.parent,
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
  await text(
    spacing.parent,
    'Le primitive Grid, Row e Col sono disponibili nelle rispettive pagine Components. Le scale sopra sono token di misura; i breakpoint responsive di Ionic non sono eseguiti in Figma.',
    'p-s',
  );
  await text(
    colors,
    'Accessibility: i colori non garantiscono contrasto sufficiente in ogni combinazione. Verifica testo/sfondo e stati reali prima della pubblicazione; questa pagina non è un audit WCAG.',
    'p-s',
  );
  const borders = root(bordersPage, 'borders-board', 'Borders & Radius');
  await heading(
    borders,
    'BEPOWER / FOUNDATIONS',
    'Borders & Radius',
    'Misure attualmente esportate dal bottone, non una nuova scala globale di border token.',
  );
  const radiusSample = figma.createRectangle();
  borders.appendChild(radiusSample);
  radiusSample.resize(space['size-800'], space['size-800']);
  radiusSample.cornerRadius = DATA.button.radius;
  bindFill(radiusSample, 'color-primary-yellow-eni');
  await text(borders, `UIButton / default · radius ${DATA.button.radius}px`, 'label-m');
  await text(
    borders,
    'Outlined: bordo da 1px come approssimazione Ionic. Altri bordi e raggi non sono ancora esportati.',
    'p-s',
  );
  for (const [target, id, title, note] of [
    [
      shadowPage,
      'shadow-board',
      'Shadow',
      'Sezione predisposta. Le ombre di foundations/shadows.scss non sono ancora esportate dal pilota; nessun effetto Figma viene inventato.',
    ],
    [
      logoPage,
      'logo-board',
      'Logo',
      'Sezione predisposta. Il pilota non include ancora un asset logo approvato; nessun marchio viene ricostruito o sostituito.',
    ],
  ]) {
    await heading(root(target, id, title), 'BEPOWER / FOUNDATIONS', title, note);
  }

  const catalog = root(page, 'component-catalog', 'Catalogo / Componenti e utilizzo');
  // Leave the original master sets where they are; new documentation starts below them.
  catalog.x = buttonSet.x;
  catalog.y = buttonSet.y + buttonSet.height + gutter;
  await heading(
    catalog,
    'BEPOWER / COMPONENT LIBRARY',
    'UIButton',
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
    'Copertura: tutte le size, default e disabled. Icon/min-icon mostrano plus come contenuto consumer di esempio; inline è valido solo per secondary. Non inclusi: loading animato, focus, hover, pressed ed expand come varianti. Bordo outlined: approssimazione Ionic da confrontare con Storybook.',
    'p-s',
  );
  const compactButtons = await section(catalog, 'Altre dimensioni');
  for (const master of buttonSet.children.filter(
    (node) => node.type === 'COMPONENT' && !node.name.endsWith('size=default'),
  )) {
    await text(compactButtons, master.name, 'label-m');
    compactButtons.appendChild(master.createInstance());
  }
  const iconBoard = root(iconsPage, 'icons-board', 'Icons / UIIcon');
  iconBoard.x = 0;
  iconBoard.y = iconY + rowHeight + gutter;
  const iconSection = await section(
    iconBoard,
    '02 / UIIcon',
    `${Object.keys(DATA.icons).length} nomi dal registro, tutti i fill disponibili e size 16/24/32/36/40/48. Ogni nome ha un set dedicato; i colori pieni seguono il trattamento dell’importer e sono collegati a default-grey.`,
  );
  for (const set of iconSets) {
    await text(iconSection, set.name, 'label-m');
    const iconRow = stack(iconSection, set.name, 'HORIZONTAL');
    iconRow.itemSpacing = gutter;
    for (const master of set.children.filter(
      (node) => node.type === 'COMPONENT' && node.name.includes('size=24'),
    )) {
      const cell = stack(iconRow, master.name);
      cell.appendChild(master.createInstance());
      await text(cell, master.name, 'label-m', column);
    }
  }
  await text(
    iconSection,
    'Ogni set espone fill e size. Non vengono creati fill mancanti nel registro. Il colore si cambia tramite variabili/override, non moltiplicando le varianti. Non usare la sola icona per comunicare un significato senza un nome accessibile nel controllo che la contiene.',
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

# Pilota repository → Figma

Il repository `@bepower/ui-kit` rimane la fonte di verità. Questo plugin locale genera
elementi **nativi Figma**, senza dipendere dal Code Layer e senza modificare i componenti Angular.

## Generazione e importazione

Dal workspace, dopo il normale `npm ci`:

```bash
node scripts/build-figma-plugin.mjs
```

1. Apri **Figma Desktop**, preferibilmente un file vuoto per la prima prova, in modalità
   **Design**, non Dev Mode. Servono permessi di modifica sul file.
2. Assicurati che **Source Sans 3 Regular e SemiBold** siano disponibili in Figma.
   È la famiglia dichiarata in `foundations/base.scss`; il plugin non usa un font sostitutivo.
3. Apri Plugins → Development → Import plugin from manifest.
4. Seleziona `figma-plugin/dist/manifest.json` e avvia il plugin.
5. Troverai le pagine organizzate nei gruppi **FOUNDATIONS** e **COMPONENTS** descritti sotto,
   le variabili nella collezione
   **BePower · repository** e gli stili testo con prefisso **BePower/**.
6. Verifica il risultato e pubblica manualmente la libreria con gli strumenti Figma.
   La pubblicazione e l'abilitazione della libreria in altri file dipendono dal piano e dai permessi.

### Come rilanciare un aggiornamento senza cancellare gli asset

Figma Desktop esegue il `code.js` **sul tuo computer**, nella cartella da cui hai importato
il manifest. Non legge automaticamente il repository o il workspace di Make. Il bundle
generato qui e quello importato sul computer sono due copie distinte finché non le aggiorni.
Inoltre `figma-plugin/dist` è ignorata da Git: aggiornare i soli sorgenti non rigenera il bundle.

1. Aggiorna sul computer i sorgenti modificati qui (scarica/esporta nuovamente il progetto,
   se necessario), nella copia locale che usi per il plugin.
2. Da quella cartella del repository esegui:

   ```bash
   node scripts/build-figma-plugin.mjs
   ```

3. Il terminale stampa **BePower build `<id>`**. Lo stesso ID è in
   `figma-plugin/dist/build-info.json`.
4. Verifica che il plugin locale importato in Figma usi il manifest di **questa cartella**,
   non un vecchio download o un'altra copia di `dist`. Se serve, importa il manifest aggiornato
   da Plugins → Development → Import plugin from manifest. Mantieni invariato l'ID del plugin.
5. Apri il **file libreria originale**, in modalità Design, e avvia
   Plugins → Development → **BePower UI Kit · repository pilot**.
6. Si apre subito la finestra **BePower · Aggiornamento**, con ID del bundle e fase corrente.
   A fine esecuzione mostra master aggiornati e creati e **resta aperta** finché la chiudi
   con la X di Figma. Gli errori rimangono leggibili nella stessa finestra. Con il catalogo
   attuale già completo, un secondo avvio deve indicare **651 aggiornati, 0 creati**.
   Nuovi componenti aggiunti ai sorgenti possono legittimamente aumentare il numero dei creati.

Non rimuovere pagine, master o variabili per aggiornare. La rimozione rompe i collegamenti
delle istanze. Non eliminare o cambiare l'ID nel manifest: i dati privati che identificano
i nodi sono associati al plugin.

Se non compare l'ID atteso, controlla la copia locale e il manifest, poi chiudi un'eventuale
esecuzione ancora aperta e rilancia dal menu Development, anziché dai plugin recenti.
Se non si apre neppure la finestra, apri la console dei plugin dal menu Plugins → Development
→ Show/Hide console e condividi l'errore: il codice potrebbe essersi fermato prima dell'avvio
della UI. Il messaggio del terminale conferma soltanto la generazione del bundle.
`stesso bundle` significa che hai rieseguito lo stesso codice/dati dell'ultimo avvio riuscito;
non significa che il plugin abbia saltato l'aggiornamento.

Se l'ID corrisponde e i master originali sono corretti ma un'istanza personale non cambia,
controlla gli override locali prima di ripristinarli: non vengono cancellati indiscriminatamente.
Se molti master risultano nuovamente **creati** nonostante quelli originali siano ancora presenti,
verifica file e ID del plugin: i metadati dei nodi potrebbero non essere riconosciuti,
per esempio dopo aver registrato il codice come un nuovo plugin con un altro ID.
Se invece il master resta errato, condividi ID del bundle, conteggi, eventuale errore e link
al master interessato; non ricreare la libreria per nascondere il problema.

### Finestra diagnostica

L'errore `Cannot set component property references on slot sublayer` indica un tentativo
di collegare un figlio dello slot alle proprietà del padre. Questi collegamenti non vengono
creati né riscritti nei contenuti liberi. La pulizia dei vecchi swap avviene temporaneamente
fuori dallo slot, ripristinando lo stesso nodo e la sua posizione; non modifica le istanze
personali. Label dei pulsanti resta invece fuori dallo slot, come proprietà testo funzionante.

L'errore `set_componentPropertyReferences ... Expected object, received null` era causato
dalla pulizia dei vecchi riferimenti INSTANCE_SWAP. Il getter può restituire `null`, ma
il setter richiede un oggetto: il generatore ora evita scritture inutili e usa `{}` quando
rimuove l'ultimo riferimento, preservando eventuali riferimenti di visibilità.

L'errore `Can only get component property definitions of a component set or non-variant component`
indica una lettura delle definizioni dal singolo master già inserito in un set. Il generatore
ora legge e aggiunge le proprietà sul set per le varianti, sul componente per i master standalone.
Riutilizza prima il riferimento testo esistente (anche se il set contiene più ID legacy con lo
stesso nome) e usa solo definizioni di tipo TEXT. Questo vale per Label, Text, Title e Content.
Non serve eliminare gli asset: rigenera il bundle aggiornato e rieseguilo nello stesso file.

Il plugin mostra avanzamento per font, stili, pagine, icone, componenti e catalogo.
La finestra non si chiude automaticamente né al successo né all'errore. Non chiuderla mentre
l'aggiornamento è in corso. In caso di errore alcuni nodi potrebbero già essere aggiornati,
ma il documento non viene registrato come aggiornamento completato.

La UI valida il contenuto dei messaggi del bridge Figma senza richiedere `event.source === parent`:
il bridge può inoltrare eventi con source nullo o differente. La connessione viene ritentata
finché arriva uno stato valido; dopo cinque secondi senza risposta compare un avviso locale.
L'aggiornamento del documento parte solo dopo la connessione della finestra.

I master vengono indicizzati una volta, senza attraversare le istanze né cercare ogni volta
in tutte le pagine. La generazione viene suddivisa in blocchi con pause effettive dell'event loop,
per consentire a Figma di aggiornare la finestra e ricevere input. Il lavoro completo può
comunque richiedere tempo su file grandi: questa ottimizzazione non garantisce un tempo totale
fisso. Se compaiono identificativi duplicati, l'esecuzione si ferma per evitare aggiornamenti
ambigui, senza eliminare i master.

Il bundle è compilato verso ES2017 con TypeScript per non distribuire optional chaining
e object spread direttamente al sandbox. È una precauzione di compatibilità, non una
conferma della causa di un errore su una particolare installazione.
La UI è incorporata in `dist/code.js`: il manifest mantiene lo stesso ID e non serve
registrare un nuovo plugin. `figma-plugin/status.html` è un sorgente versionato; `dist/`
resta generata localmente.

Negli **altri file** che consumano una libreria pubblicata, rilanciare il plugin non basta:
prima pubblica l'aggiornamento dal file libreria e poi accettalo nei file utilizzatori.

Componenti, set, variabili e stili vengono riutilizzati tramite identificativi o nomi stabili.
Non rinominare le variabili o gli stili generati; evita modifiche manuali ai master generati.
Le istanze esistenti continuano a riferirsi agli stessi componenti. Il nodo Label e la proprietà
testo vengono mantenuti; i vettori dell'icona vengono invece ricostruiti, quindi eventuali override
sui loro livelli interni non sono garantiti. Le voci rimosse dal repository non vengono eliminate
automaticamente da Figma.

## Catalogo e tavole Foundations

Le tavole vengono generate con auto layout, tipografia del repository e colori collegati
alle variabili. I campioni tipografici sono collegati agli stili testo locali; le barre mostrano
le dimensioni reali dei token numerici. Le tavole sono documentazione, non nuovi componenti
da pubblicare: gli esempi del catalogo sono istanze dei master già esistenti.

### Organizzazione delle pagine

```text
---- 👑 FOUNDATIONS ----
_Color & Accessibility
_Typography
_Borders & Radius
_Grids & Spacing
_Icons
_Shadow
_Logo
---- 🧩 COMPONENTS ----
_Bottomsheet
_Button
_Col
_Grid
_P
_Page
_ProgressBar
_Row
_Text
_Title
_Composition
```

Le intestazioni sono normali pagine Figma usate come separatori, come nel riferimento.
Il generatore riordina solo le pagine gestite, posizionandole prima delle pagine personali;
queste ultime mantengono contenuti e ordine relativo.
La precedente pagina del pilota viene rinominata `_Button`, quella Foundations diventa
`_Color & Accessibility`. Il set UIIcon esistente viene spostato in `_Icons` senza ricrearlo.
Le altre tavole sono ripartite nelle pagine dedicate. I vecchi frame generati sono aggiornati,
non archiviati come copie.

`_Borders & Radius` documenta il raggio esportato da UIButton, non una nuova scala globale.
`_Grids & Spacing` mostra le scale numeriche; le primitive di layout sono nelle pagine
`_Grid`, `_Row` e `_Col`. I breakpoint Ionic non vengono eseguiti in Figma.
`_Color & Accessibility` contiene indicazioni, non una certificazione di contrasto WCAG.
`_Shadow` e `_Logo` sono sezioni esplicitamente predisposte, senza effetti o marchi inventati.
Bottomsheet è ora un componente reale del catalogo. Alert non è esportato dal repository
e non viene inventato.

Ogni componente ha master, esempi come istanze, copertura e limiti. L'inventario degli input,
tipi, valori finiti e default viene estratto dal TypeScript originale tramite il compiler API,
inclusi alias come `Exclude<UISpacing, ...>`. Gli stili vengono valutati da Sass.
Il barrel dei componenti definisce la copertura: un nuovo export senza adattatore produce
un errore, anziché essere ignorato.
Gli identificativi delle due pagine originali, dei master, dei set e della proprietà Label restano invariati.

Solo i frame marcati dal plugin come tavole di documentazione vengono ricostruiti a ogni
esecuzione. Non inserire note personali dentro questi frame: usa livelli separati o un'altra pagina.
Le altre pagine e i livelli non generati non vengono rimossi. Le istanze dimostrative del
catalogo vengono ricreate; le istanze d'uso esterne alle tavole non vengono ricreate.

Prima di pubblicare, verifica in Figma Desktop i campioni, i collegamenti alle variabili,
la selezione degli stili testo e un'istanza già esistente. Il generatore non pubblica la libreria.

Per verificare il generatore e la stabilità degli identificativi con un doppio in memoria
delle API Figma:

```bash
node --test figma-plugin/plugin.test.mjs
```

Il test genera anche `dist/`. Verifica due esecuzioni consecutive, assenza di duplicazioni,
preservazione di master, proprietà Label e contenuti esterni alle tavole.
Non sostituisce la verifica visiva e delle API reali in Figma Desktop.

## Errore «The manifest editorType does not include "dev"»

Il plugin è stato avviato in **Dev Mode**, mentre il manifest dichiara `editorType: ["figma"]`.
Questo è intenzionale: il generatore deve creare e aggiornare componenti, variabili e stili
nell'editor Design, non nella modalità di ispezione per sviluppatori.

Disattiva Dev Mode con il relativo interruttore nell'interfaccia Figma, torna alla modalità
Design e avvia di nuovo il plugin da Plugins → Development. La voce **Development** del menu
indica un plugin locale e non richiede Dev Mode. Se non puoi modificare il file, richiedi
i permessi necessari oppure prova in un nuovo file modificabile.

Non aggiungere `"dev"` al manifest per aggirare l'errore: non abilita la generazione
di componenti in Dev Mode. Non occorre rigenerare il plugin per questo messaggio.

## Copertura del pilota

| Elemento                | Origine                                                | Output                                                                                        |
| ----------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Colori solidi           | `foundations/colors.scss`                              | Variabili COLOR, anche con alpha                                                              |
| Dimensioni e spaziature | `foundations/sizes.scss`, `spacing.scss`               | Variabili FLOAT, rem convertiti con la base 16px del repository                               |
| Tipografia              | mixin senza parametri in `foundations/typography.scss` | Stili testo, line-height e decorazioni                                                        |
| UIIcon                  | `icon-map.ts`, `icons/*.svg`, input size               | 50 set, 75 SVG × 6 size = 450 componenti vettoriali                                           |
| UIPictogram             | `pictogram-map.ts`, `pictograms/*.svg`, input size     | 1 set, 22 SVG × 3 size semantiche = 66 componenti; colori originali preservati                |
| UIButton                | TypeScript, Sass e mixin tipografici                   | 20 varianti: 3 variant × default/icon/min-icon × 2 stati; inline solo secondary × 2 stati     |
| UIBottomSheet           | TypeScript e Sass                                      | 4 combinazioni showCloseButton × hasFooter, proprietà Content                                 |
| UIPage                  | TypeScript e Sass                                      | 50 combinazioni: 5 background × 5 header (incluso none) × 2 footer, proprietà Title e Content |
| UIProgressBar           | TypeScript e Sass                                      | 5 campioni statici: 0, 0.25, 0.5, 0.75, 1                                                     |
| UITitle                 | input size e mixin title                               | 4 size, proprietà Text                                                                        |
| UIText                  | input variant e mixin tipografici                      | 7 variant, proprietà Text                                                                     |
| UIP                     | Sass p-m e align                                       | 3 allineamenti, proprietà Text                                                                |
| UIGrid                  | input horizontal, fixed e token spacing                | 12 combinazioni di inset e fixed                                                              |
| UIRow                   | input gap e token spacing                              | 10 gap, top/bottom inizialmente none                                                          |
| UICol                   | contratto Ionic size                                   | Span 1–12, equal e auto; 14 campioni                                                          |

Totale attuale: **650 master in 62 set**, corrispondenti ai **13 componenti** del barrel,
più **un componente standalone di esempio** `Composition / Content` (**651 master totali**).
Il numero dei componenti Angular non coincide con quello dei master Figma: ogni variante
è un master nel proprio set.

### Icone

Ogni nome ha un set UIIcon con assi **fill** e **size** (16/24/32/36/40/48). Un fill esiste
solo se presente nel registro: per esempio arrow-left non riceve un fill inventato.
Il generatore verifica che registro e SVG siano allineati; se non lo sono, esegui il normale
`npm run icons:import` e rigenera. Non modifica il registro durante l'export Figma.

Il colore si configura tramite variabili o override sul vettore, non con un ulteriore
prodotto cartesiano di varianti. Come nell'importer Angular, i path pieni ricevono il colore
semantico, mentre fill=none e attributi stroke vengono preservati.
Le icone sono distribuite in cinque colonne sulla canvas e il catalogo mostra i campioni
a 24px. I master originali arrow a 24px e il loro set conservano gli identificativi.

### Pittogrammi

`UIPictogram` è un unico component set con assi **name** e **size** (`s`, `m`, `l`). Le size
sono ricavate dal CSS del componente e corrispondono a 40/80/160px. Il plugin importa una sola
sorgente SVG per nome e la ridimensiona nei master Figma, senza duplicare asset per taglia né
sostituire i colori originali con variabili. Il generatore verifica che il tipo `PictogramName`,
il registry e gli SVG in `pictograms/` siano allineati.

Sass valuta i token e i mixin originali: i valori non vengono mantenuti in una seconda palette.
Il bottone primario usa **yellow-eni**, non il verde: è il mapping Ionic definito dal repository.
Il colore dei vettori è quello semantico default-grey, non il placeholder magenta degli SVG.
I riempimenti dei componenti sono collegati alle variabili colore.

## Limiti espliciti

- È un adattatore Figma del contratto visivo, non l'esecuzione di Angular/Ionic in Figma.
  Nomi delle varianti, mapping semantici e struttura dei componenti sono il piccolo strato
  di adattamento da aggiornare se cambia l'API della libreria.
- Tutti i componenti hanno una rappresentazione nativa, non ogni possibile combinazione
  di input. Colori e geometrie modificabili non vengono sempre moltiplicati in varianti.
  Per UIButton mancano loading animato, focus, pressed e hover come assi di variante.
  I master standard sono ridimensionabili e supportano Fill container con una larghezza minima
  derivata da contenuto e padding; icon/min-icon restano intrinsecamente compatti.
- UITitle, UIText e UIP espongono proprietà testo. `inherit` di UIText è mostrato in un
  contesto p-m: non esiste ereditarietà DOM in Figma. Start/end sono campioni LTR.
- Le shell di UIPage e UIBottomSheet sono campioni statici su viewport 360×640.
  Le scritte Content e le CTA nei footer sono contenuto consumer dimostrativo, non copy
  incorporato nei componenti Angular. Non vengono simulati safe area, router, screen reader,
  scrolling, chiusura modali, altezza dinamica, condensedHeader, translucent e stati di elevazione.
  Gli header e i footer riempiono la larghezza della shell e seguono il ridimensionamento
  orizzontale con auto layout. Il footer contiene una CTA dimostrativa `expand`, larga quanto
  lo spazio disponibile dopo gli inset laterali Sass da 24px: non modifica il master UIButton.
  Il titolo di UIPage è centrato nella toolbar; l'header step usa una seconda toolbar con
  inset da 24px e indicazione del passo allineata a destra. UIBottomSheet mantiene solo
  il controllo close nel suo header: un eventuale titolo appartiene al contenuto consumer.
- UIProgressBar usa height/radius Sass e colore tertiary; il track al 20% è un'approssimazione
  Ionic. Il valore è continuo nel codice, mentre in Figma sono disponibili cinque campioni.
- Grid/Row/Col usano auto layout per esempi visivi, non eseguono percentuali CSS o breakpoint.
  Row usa gap visivo invece dei mezzi gutter/margini negativi Angular. Top/bottom di Row
  e align/justify/horizontal di Col si regolano nei frame, non sono tutte varianti cartesiane.
  fixed di Grid non cambia il campione mobile. Auto di Col dipende dal contenuto campione.
- Il bordo outlined da 1px è un'approssimazione dell'aspetto Ionic; verificare visivamente
  contro Storybook prima della pubblicazione. Non si dichiara equivalenza pixel-perfect.
- Gradienti, ombre, alias fra token e modalità tema non sono inclusi in questa prima versione.
  Le dimensioni dei componenti sono generate dai token ma non tutte sono collegate a variabili.
- Il plugin non legge né modifica il file Foundation esistente tramite API remote.
  La prima esecuzione e la pubblicazione devono essere effettuate in Figma dall'utente.
- Nessuna sincronizzazione automatica, rete, credenziale o backend.

`UIInputField` mantiene una larghezza iniziale di 327px nel catalogo, ma il master e i suoi
livelli Label, Field e Bottom text seguono la larghezza dell'istanza tramite auto layout/stretch.
La larghezza minima conserva entrambi gli inset laterali, gli slot icona e i gap. Nel consumer
Angular il nome canonico è `bottomText`; `helperText` resta solo come alias deprecato.

`dist/tokens.json` permette di ispezionare i dati generati. Tutto `dist/` è rigenerabile e
non va modificato manualmente né versionato.

## Gerarchia riutilizzabile nel design

Il generatore usa **slot nativi Figma (`SLOT`)**, non contenuti singoli con INSTANCE_SWAP.
Gli slot sono collezioni aperte: `minChildren: 0`, `maxChildren: null`, nessuna restrizione
ai soli componenti preferiti. Puoi aggiungere, duplicare, riordinare e rimuovere contenuti
direttamente nelle istanze senza Detach né un componente wrapper.

```text
UIPage oppure UIBottomSheet
├── Body [SLOT] → UIGrid, titoli, sezioni, altre griglie…
│   └── UIGrid / Rows [SLOT] → UIRow, UIRow, UIRow…
│       └── UIRow / Columns [SLOT] → UICol, UICol, UICol…
│           └── UICol / Content [SLOT] → testo, pulsanti, icone…
└── Footer [SLOT] → UIButton, UIButton, testo…
    └── UIButton / Content [SLOT] → testo, icone… (contenuto personalizzato opzionale)
```

I nodi UI-kit sono istanze collegate ai master. Due colonne e una riga sono solo contenuti
iniziali, non un massimo. In `_Composition` trovi un esempio con tre righe, tre colonne
nella prima riga e più azioni nel footer.

| Componente              | Proprietà di composizione                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| UIPage, UIBottomSheet   | Slot aperti `Body`, `Footer`                                                                            |
| UIGrid                  | Slot aperto `Rows`                                                                                      |
| UIRow                   | Slot aperto `Columns`, auto layout orizzontale con wrap                                                 |
| UICol                   | Slot aperto `Content`                                                                                   |
| UIButton default/inline | `Label` separata con `Show label`; slot `Content` attivabile con `Show custom content`; icone opzionali |
| UIButton icon/min-icon  | `Icon`                                                                                                  |
| UITitle, UIText, UIP    | Sono componenti foglia annidabili con proprietà testo, non contenitori                                  |
| UIIcon, UIProgressBar   | Sono componenti foglia annidabili; restano disponibili fill/size o value                                |

### Uso in Figma

1. Inserisci UIPage da Assets e scegli una variante con footer se necessario.
2. Espandi l'istanza nei Layers: trovi istanze UIGrid, UIRow, UICol, UIP e UIButton.
3. Seleziona lo slot `Rows` della griglia e trascina altre istanze UIRow da Assets al suo interno.
4. Seleziona `Columns` di una riga e aggiungi altre UICol; duplica, riordina o rimuovi liberamente.
5. Inserisci direttamente pulsanti e testi nello slot Content di una colonna, e più sezioni
   in Body o più CTA in Footer. Regola Fill container e misure quando necessario.
6. Per i pulsanti usa Label normalmente. Per contenuto libero abilita `Show custom content`,
   disabilita `Show label` se non serve e inserisci testo o istanze nello slot Content.
   Gli swap delle icone rimangono opzionali.

Le modifiche ai figli sono consentite **dentro gli slot**, non nella struttura protetta
esternamente agli slot. Non si aggiungono nuovi slot nominati dal corpo dell'istanza:
Body e Footer accettano già molti elementi ciascuno, come gli slot Angular del componente.
Non serve predisporre Body1, Body2, Body3. `Composition / Content` resta solo un esempio opzionale.

Le larghezze utilizzano auto layout/stretch ove applicabile. Il layout resta una rappresentazione
Figma, non esegue il modello percentuale Ionic, i breakpoint, lo scrolling o il codice Angular.
Verifica contenuti lunghi, componenti di contenuto personalizzati e ridimensionamento in Figma.

### Aggiornamento dei file esistenti

I frame esistenti vengono convertiti in slot con `slotContentId`, preservandone gli ID.
Il nuovo slot Columns sostituisce i due contenitori rigidi; i vecchi contenitori restano
nascosti per compatibilità, mentre le istanze colonna iniziali vengono spostate nello slot.
I master originali e gli ID delle proprietà testo sono conservati. I vecchi testi Content
restano come placeholder **nascosti**, per evitare che si sovrappongano ai contenuti.
I vecchi campi Content/Show legacy placeholder restano conservati, ma non sono più controlli
per i figli degli slot: Figma vieta questi collegamenti. Per modificare o mostrare contenuti
dello slot agisci direttamente sui relativi livelli dell'istanza.
Il flusso nuovo usa gli slot aperti, non i vecchi campi Content o gli swap di contenitore.
Le vecchie definizioni swap, se già presenti, non vengono eliminate distruttivamente ma non
controllano il nuovo contenuto. Le composizioni personali
devono stare fuori dalle tavole generate; i loro override non vengono cancellati dal plugin.

Al primo aggiornamento dal precedente catalogo sono previsti **579 aggiornati e 1 creato**:
il nuovo master è Composition / Content. Ai successivi: **580 aggiornati e 0 creati**.

### Requisiti e API

Serve una versione/runtime Figma con supporto a Slots. Se `createSlot` non è disponibile,
il plugin mostra un errore esplicito: non torna silenziosamente a un numero fisso di swap.
Verifica il rollout della funzionalità nel tuo ambiente e aggiorna Figma Desktop.

Riferimento ufficiale:
[Add slot properties](https://developers.figma.com/docs/plugins/working-with-component-properties/#add-slot-properties).
La conversione di un frame usa una proprietà SLOT e `componentPropertyReferences.slotContentId`.
I figli di uno slot si modificano con le normali API `appendChild`/`insertChild`/`remove`;
`InstanceNode.setProperties` non modifica il contenuto SLOT. Il plugin non chiama
`resetSlot` sugli utenti: i contenuti personali devono essere preservati.

## Verifica prima della pubblicazione

1. Esegui il plugin nello stesso file del pilota: controlla che le vecchie istanze UIButton
   e UIIcon arrow continuino a funzionare.
2. Da Assets inserisci un componente per ciascuna famiglia e modifica le proprietà disponibili.
3. Per UIIcon verifica i due fill di arrow, il solo no-fill di arrow-left e tutte le sei size.
4. Controlla gli stati disabled, il testo inline, i quattro Bottomsheet, Page con header step
   e footer, ProgressBar 0/1, allineamenti e contenuto lungo.
5. Confronta le shell e le approssimazioni con Storybook prima di pubblicare.
6. Riesegui il plugin: niente duplicazioni di master/set/variabili; note esterne preservate.

I test automatici verificano inventario, copertura, varianti, geometria base delle icone,
aggiornamenti e identificativi con API simulate. Non certificano il rendering o le API
reali di Figma Desktop.

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

Per aggiornare: rigenera i file, quindi riesegui il plugin **nello stesso file Figma**.
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

Totale attuale: **579 master in 60 set**, corrispondenti agli **11 componenti** del barrel.
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
  Per UIButton mancano loading animato, focus, pressed, hover ed expand come assi di variante.
  Icon/min-icon mostrano plus come contenuto consumer di esempio.
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

`dist/tokens.json` permette di ispezionare i dati generati. Tutto `dist/` è rigenerabile e
non va modificato manualmente né versionato.

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

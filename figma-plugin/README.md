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
_Button
```

Le intestazioni sono normali pagine Figma usate come separatori, come nel riferimento.
Il generatore riordina solo le pagine gestite, posizionandole prima delle pagine personali;
queste ultime mantengono contenuti e ordine relativo.
La precedente pagina del pilota viene rinominata `_Button`, quella Foundations diventa
`_Color & Accessibility`. Il set UIIcon esistente viene spostato in `_Icons` senza ricrearlo.
Le altre tavole sono ripartite nelle pagine dedicate. I vecchi frame generati sono aggiornati,
non archiviati come copie.

`_Borders & Radius` documenta il raggio esportato da UIButton, non una nuova scala globale.
`_Grids & Spacing` mostra le scale numeriche: layout grid e breakpoint non sono ancora esportati.
`_Color & Accessibility` contiene indicazioni, non una certificazione di contrasto WCAG.
`_Shadow` e `_Logo` sono sezioni esplicitamente predisposte, senza effetti o marchi inventati.
Alert e Bottomsheet non vengono aggiunti come pagine vuote: il pilota esporta solo UIButton.

Il catalogo documenta varianti e stati del bottone, proprietà dell'istanza, corrispondenza
con gli input Angular, limiti del pilota e flusso di aggiornamento/pubblicazione.
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

| Elemento                | Origine                                                | Output                                                                                |
| ----------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Colori solidi           | `foundations/colors.scss`                              | Variabili COLOR, anche con alpha                                                      |
| Dimensioni e spaziature | `foundations/sizes.scss`, `spacing.scss`               | Variabili FLOAT, rem convertiti con la base 16px del repository                       |
| Tipografia              | mixin senza parametri in `foundations/typography.scss` | Stili testo, line-height e decorazioni                                                |
| Icona                   | `icons/arrow_{fill,no-fill}.svg`                       | Set UIIcon con due varianti vettoriali a 24px                                         |
| Bottone                 | `ui-button.scss` e mixin tipografici                   | Set UIButton: primary, secondary, outlined × default, disabled; proprietà testo Label |

Sass valuta i token e i mixin originali: i valori non vengono mantenuti in una seconda palette.
Il bottone primario usa **yellow-eni**, non il verde: è il mapping Ionic definito dal repository.
Il colore dei vettori è quello semantico default-grey, non il placeholder magenta degli SVG.
I riempimenti dei componenti sono collegati alle variabili colore.

## Limiti espliciti

- È un adattatore Figma del contratto visivo, non l'esecuzione di Angular/Ionic in Figma.
  Nomi delle varianti, mapping semantici e struttura dei componenti sono il piccolo strato
  di adattamento da aggiornare se cambia l'API della libreria.
- Include solo size=default del bottone e size=24 dell'icona. Loading, focus, pressed,
  hover, expand, inline e slot icone non sono ancora esportati.
- Il bordo outlined da 1px è un'approssimazione dell'aspetto Ionic; verificare visivamente
  contro Storybook prima della pubblicazione. Non si dichiara equivalenza pixel-perfect.
- Gradienti, ombre, alias fra token e modalità tema non sono inclusi in questa prima versione.
  Le dimensioni dei componenti sono generate dai token ma non tutte sono collegate a variabili.
- Il plugin non legge né modifica il file Foundation esistente tramite API remote.
  La prima esecuzione e la pubblicazione devono essere effettuate in Figma dall'utente.
- Nessuna sincronizzazione automatica, rete, credenziale o backend.

`dist/tokens.json` permette di ispezionare i dati generati. Tutto `dist/` è rigenerabile e
non va modificato manualmente né versionato.

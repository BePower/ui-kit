import{n as e}from"./rolldown-runtime-D_-wTCJc.js";import{D as t,t as n,w as r,y as i}from"./ionic-angular-standalone-Vgp5JL3N.js";import{n as a,t as o}from"./ui-button-DuVf1gJZ.js";import{n as s,t as c}from"./ui-p-BZ1OrtAi.js";import{n as l,t as u}from"./ui-title-DVwbRhG4.js";import{n as d,t as f}from"./ui-page-BydgysgL.js";var p,m,h,g,_,v;function init_ui_page_stories(){return(init_ui_page_stories=e((()=>{r(),i(),s(),d(),l(),a(),p={title:`Components/Page`,component:f,tags:[`autodocs`],decorators:[t({imports:[n,f,c,u,o]})],parameters:{layout:`fullscreen`},args:{background:`white`,condensedHeader:!1,hasFooter:!1,hasHeader:!0,headerStep:{ariaLabel:`Avanzamento della procedura`,currentStep:2,label:`di`,totalSteps:4},headerType:`white`,title:`Titolo della pagina`,translucent:!1},argTypes:{background:{control:`select`,options:[`white`,`grey`,`light-green`,`green`,`yellow`]},headerType:{control:`select`,options:[`white`,`green`,`tab`,`step`]},headerStep:{control:`object`}},render:e=>({props:e,template:`
      <ion-app style="block-size: 100dvh">
        <ui-page
          [background]="background"
          [condensedHeader]="condensedHeader"
          [hasFooter]="hasFooter"
          [hasHeader]="hasHeader"
          [headerStep]="headerStep"
          [headerType]="headerType"
          [title]="title"
          [translucent]="translucent"
        >
            <ui-title size="xl">Contenuto della pagina</ui-title>
            <ui-p>Questa story mostra la composizione di base di ui-page dentro ion-app.</ui-p>
            <ui-p>Scorri per verificare l’elevation dell’header e del footer.</ui-p>
            <ui-p>Il ciclo di vita del router e la status bar nativa non fanno parte di questo canvas.</ui-p>
            <ui-p>Il contenuto aggiuntivo permette di osservare il comportamento di scroll.</ui-p>
            <ui-p>Il footer riceve elevation solo quando copre ancora contenuto.</ui-p>
            <ui-p>Questa è una riga aggiuntiva per estendere il contenuto della story.</ui-p>
            <ui-p>Questa è un’altra riga aggiuntiva per estendere il contenuto della story.</ui-p>
            <ui-p>Fine del contenuto di esempio.</ui-p>
            <ui-button ariaLabel="prima call" footer variant="primary" expand>
              Call to action
            </ui-button>
            <ui-button ariaLabel="seconda call" footer variant="secondary" expand>
              Call to action
            </ui-button>

        </ui-page>
      </ion-app>
    `})},m={args:{hasHeader:!0,headerType:`step`}},h={args:{headerType:`green`}},g={args:{headerType:`step`}},_={args:{hasFooter:!0}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    hasHeader: true,
    headerType: 'step'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    headerType: 'green'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    headerType: 'step'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    hasFooter: true
  }
}`,..._.parameters?.docs?.source}}},v=[`Default`,`GreenHeader`,`StepHeader`,`WithFooter`]})))()}init_ui_page_stories();export{m as Default,h as GreenHeader,g as StepHeader,_ as WithFooter,v as __namedExportsOrder,p as default};
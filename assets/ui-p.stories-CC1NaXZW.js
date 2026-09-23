import{n as e}from"./rolldown-runtime-D_-wTCJc.js";import{D as t,w as n}from"./ionic-angular-standalone-Vgp5JL3N.js";import{n as r,t as i}from"./ui-button-DuVf1gJZ.js";import{n as a,t as o}from"./ui-p-BZ1OrtAi.js";import{n as s,t as c}from"./ui-text-CZ_qiFRY.js";var l,u,d,f,p;function init_ui_p_stories(){return(init_ui_p_stories=e((()=>{n(),r(),a(),s(),l={title:`Components/Paragraph`,component:o,tags:[`autodocs`],decorators:[t({imports:[i,o,c]})],parameters:{layout:`padded`},render:e=>({props:e,template:`<ui-p [align]="align" [ariaHidden]="ariaHidden">Questo è un paragrafo con tipografia body-m.</ui-p>`}),argTypes:{align:{control:`select`,options:[`start`,`center`,`end`]}}},u={args:{align:`start`}},d={render:()=>({template:`
      <ui-p>
        Testo standard con
        <ui-text color="green" variant="label-m">un’etichetta inline</ui-text>
        e <ui-text variant="body-s">un dettaglio secondario</ui-text>.
      </ui-p>
    `})},f={render:()=>({template:`
      <div style="max-inline-size: 360px">
        <ui-p>
          Accedi all’area dedicata per scoprire vantaggi e premi.
          <ui-button size="inline" variant="secondary">Consulta il manifesto</ui-button>.
        </ui-p>
      </div>
    `})},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    align: 'start'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => ({
    template: \`
      <ui-p>
        Testo standard con
        <ui-text color="green" variant="label-m">un’etichetta inline</ui-text>
        e <ui-text variant="body-s">un dettaglio secondario</ui-text>.
      </ui-p>
    \`
  })
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => ({
    template: \`
      <div style="max-inline-size: 360px">
        <ui-p>
          Accedi all’area dedicata per scoprire vantaggi e premi.
          <ui-button size="inline" variant="secondary">Consulta il manifesto</ui-button>.
        </ui-p>
      </div>
    \`
  })
}`,...f.parameters?.docs?.source}}},p=[`Default`,`InlineTypography`,`InlineAction`]})))()}init_ui_p_stories();export{u as Default,f as InlineAction,d as InlineTypography,p as __namedExportsOrder,l as default};
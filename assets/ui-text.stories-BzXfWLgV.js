import{n as e}from"./rolldown-runtime-D_-wTCJc.js";import{D as t,w as n}from"./ionic-angular-standalone-Vgp5JL3N.js";import{n as r,t as i}from"./ui-p-BZ1OrtAi.js";import{n as a,t as o}from"./ui-text-CZ_qiFRY.js";var s,c,l,u;function init_ui_text_stories(){return(init_ui_text_stories=e((()=>{n(),r(),a(),s={title:`Components/Text`,component:o,tags:[`autodocs`],decorators:[t({imports:[i,o]})],parameters:{layout:`padded`},args:{color:`default-grey`,variant:`inherit`},argTypes:{color:{control:`select`,options:[`default-grey`,`primary`,`secondary`,`white`,`green`]},variant:{control:`select`,options:[`inherit`,`body-l`,`body-m`,`body-s`,`label-l`,`label-m`,`label-s`]}},render:e=>({props:e,template:`
      <ui-p>
        Questo testo contiene
        <ui-text [color]="color" [variant]="variant">un frammento inline</ui-text>.
      </ui-p>
    `})},c={},l={render:()=>({template:`
      <div style="display: grid; gap: 12px">
        <ui-p>Body L: <ui-text variant="body-l">testo di esempio</ui-text></ui-p>
        <ui-p>Body M: <ui-text variant="body-m">testo di esempio</ui-text></ui-p>
        <ui-p>Body S: <ui-text variant="body-s">testo di esempio</ui-text></ui-p>
        <ui-p>Label L: <ui-text variant="label-l">testo di esempio</ui-text></ui-p>
        <ui-p>Label M: <ui-text variant="label-m">testo di esempio</ui-text></ui-p>
        <ui-p>Label S: <ui-text variant="label-s">testo di esempio</ui-text></ui-p>
      </div>
    `})},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => ({
    template: \`
      <div style="display: grid; gap: 12px">
        <ui-p>Body L: <ui-text variant="body-l">testo di esempio</ui-text></ui-p>
        <ui-p>Body M: <ui-text variant="body-m">testo di esempio</ui-text></ui-p>
        <ui-p>Body S: <ui-text variant="body-s">testo di esempio</ui-text></ui-p>
        <ui-p>Label L: <ui-text variant="label-l">testo di esempio</ui-text></ui-p>
        <ui-p>Label M: <ui-text variant="label-m">testo di esempio</ui-text></ui-p>
        <ui-p>Label S: <ui-text variant="label-s">testo di esempio</ui-text></ui-p>
      </div>
    \`
  })
}`,...l.parameters?.docs?.source}}},u=[`Playground`,`Variants`]})))()}init_ui_text_stories();export{c as Playground,l as Variants,u as __namedExportsOrder,s as default};
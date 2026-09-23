import{n as e}from"./rolldown-runtime-D_-wTCJc.js";import{D as t,w as n}from"./ionic-angular-standalone-Vgp5JL3N.js";import{n as r,t as i}from"./ui-button-DuVf1gJZ.js";import{n as a,t as o}from"./ui-icon-zyQCCqWa.js";import{n as s,t as c}from"./ui-p-BZ1OrtAi.js";var l,u,d,f,p,m,h,g,_;function init_ui_button_stories(){return(init_ui_button_stories=e((()=>{n(),r(),a(),s(),l={title:`Components/Button`,component:i,tags:[`autodocs`],decorators:[t({imports:[i,o,c]})],parameters:{layout:`fullscreen`},args:{ariaLabel:`Continua`,disabled:!1,expand:!1,isLoading:!1,size:`default`,variant:`primary`},argTypes:{variant:{control:`select`,options:[`primary`,`secondary`,`outlined`]},size:{control:`select`,options:[`default`,`icon`,`min-icon`,`inline`]}},render:e=>({props:e,template:`
      <ui-button
        [ariaHidden]="ariaHidden"
        [ariaLabel]="ariaLabel"
        [disabled]="disabled"
        [expand]="expand"
        [isLoading]="isLoading"
        [size]="size"
        [variant]="variant"
      >
        Continua
      </ui-button>
    `})},u={},d={args:{ariaLabel:`Annulla`,variant:`secondary`}},f={args:{ariaLabel:`Scopri di più`,variant:`outlined`}},p={args:{expand:!0},parameters:{layout:`padded`}},m={args:{isLoading:!0}},h={args:{ariaLabel:`Aggiungi elemento`,size:`icon`},render:e=>({props:e,template:`
      <ui-button [ariaLabel]="ariaLabel" [disabled]="disabled" size="icon">
        <ui-icon slot="icon-only" name="plus" fill="no-fill"></ui-icon>
      </ui-button>
    `})},g={args:{ariaLabel:void 0,size:`inline`,variant:`secondary`},render:()=>({template:`
      <div style="max-inline-size: 340px">
        <ui-p>
          Scopri tutti i vantaggi disponibili.
          <ui-button size="inline" variant="secondary">Leggi i dettagli</ui-button>
        </ui-p>
      </div>
    `})},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    ariaLabel: 'Annulla',
    variant: 'secondary'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    ariaLabel: 'Scopri di più',
    variant: 'outlined'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    expand: true
  },
  parameters: {
    layout: 'padded'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    isLoading: true
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    ariaLabel: 'Aggiungi elemento',
    size: 'icon'
  },
  render: args => ({
    props: args,
    template: \`
      <ui-button [ariaLabel]="ariaLabel" [disabled]="disabled" size="icon">
        <ui-icon slot="icon-only" name="plus" fill="no-fill"></ui-icon>
      </ui-button>
    \`
  })
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    ariaLabel: undefined,
    size: 'inline',
    variant: 'secondary'
  },
  render: () => ({
    template: \`
      <div style="max-inline-size: 340px">
        <ui-p>
          Scopri tutti i vantaggi disponibili.
          <ui-button size="inline" variant="secondary">Leggi i dettagli</ui-button>
        </ui-p>
      </div>
    \`
  })
}`,...g.parameters?.docs?.source}}},_=[`Primary`,`Secondary`,`Outlined`,`Expanded`,`Loading`,`IconOnly`,`InlineAction`]})))()}init_ui_button_stories();export{p as Expanded,h as IconOnly,g as InlineAction,m as Loading,f as Outlined,u as Primary,d as Secondary,_ as __namedExportsOrder,l as default};
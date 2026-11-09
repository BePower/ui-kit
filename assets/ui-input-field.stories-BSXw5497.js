import{n as e}from"./rolldown-runtime-D_-wTCJc.js";import{A as t,D as n,E as r,F as i,L as a,Mt as o,Q as s,T as c,Tn as l,Tt as u,V as d,W as f,b as p,bn as m,q as h,w as g,zt as _}from"./angular-platform-BxTekTgS.js";import{i as v,t as y}from"./dist-CjDYnyef.js";import{n as b,t as x}from"./ui-icon-B2RdPEKb.js";var S;function init_forms(){return(init_forms=e((()=>{g(),S=new u(``)})))()}var C;function init_ui_input_field(){return(init_ui_input_field=e((()=>{C=`:host{--ion-color-primary:#ffcd00;--ion-color-primary-shade:#ecc102;--ion-color-primary-tint:#ffcd00;--ion-color-primary-contrast:#333;--ion-color-secondary:#045738;--ion-color-secondary-shade:#045135;--ion-color-secondary-tint:#055f3e;--ion-color-secondary-contrast:#fff;--ion-color-tertiary:#008051;--ion-color-tertiary-shade:#008051;--ion-color-tertiary-tint:#008051;--ion-color-tertiary-contrast:#fff;--ion-color-default-grey:#333;--ion-color-default-grey-contrast:#fff;--ion-color-default-grey-contrast-rgb:51, 51, 51;--ion-color-default-grey-shade:#333;--ion-color-default-grey-tint:#333;--ion-color-default-grey-72:#333333b8;--ion-color-default-grey-72-rgb:51, 51, 51, .72;--ion-color-default-grey-72-contrast:#fff;--ion-color-default-grey-72-contrast-rgb:255, 255, 255;--ion-color-default-grey-72-shade:#333333b8;--ion-color-default-grey-72-tint:#333333b8;--ion-color-white:#fff;--ion-color-white-rgb:255, 255, 255;--ion-color-white-contrast:#333;--ion-color-white-contrast-rgb:51, 51, 51;--ion-color-white-shade:#fff;--ion-color-white-tint:#fff;--ion-color-green:#045738;--ion-color-green-rgb:4, 87, 56;--ion-color-green-contrast:#333;--ion-color-green-contrast-rgb:51, 51, 51;--ion-color-green-shade:#045135;--ion-color-green-tint:#055f3e}:host .ion-color-default-grey{--ion-color-base:var(--ion-color-default-grey);--ion-color-base-rgb:var(--ion-color-default-grey-rgb);--ion-color-contrast:var(--ion-color-default-grey-contrast);--ion-color-contrast-rgb:var(--ion-color-default-grey-contrast-rgb);--ion-color-shade:var(--ion-color-default-grey-shade);--ion-color-tint:var(--ion-color-default-grey-tint)}:host .ion-color-default-grey-72{--ion-color-base:var(--ion-color-default-grey-72);--ion-color-base-rgb:var(--ion-color-default-grey-72-rgb);--ion-color-contrast:var(--ion-color-default-grey-72-contrast);--ion-color-contrast-rgb:var(--ion-color-default-grey-72-contrast-rgb);--ion-color-shade:var(--ion-color-default-grey-72-shade);--ion-color-tint:var(--ion-color-default-grey-72-tint)}:host .ion-color-white{--ion-color-base:var(--ion-color-white);--ion-color-base-rgb:var(--ion-color-white-rgb);--ion-color-contrast:var(--ion-color-white-contrast);--ion-color-contrast-rgb:var(--ion-color-white-contrast-rgb);--ion-color-shade:var(--ion-color-white-shade);--ion-color-tint:var(--ion-color-white-tint)}:host .ion-color-green{--ion-color-base:var(--ion-color-green);--ion-color-base-rgb:var(--ion-color-green-rgb);--ion-color-contrast:var(--ion-color-green-contrast);--ion-color-contrast-rgb:var(--ion-color-green-contrast-rgb);--ion-color-shade:var(--ion-color-green-shade);--ion-color-tint:var(--ion-color-green-tint)}:host{box-sizing:border-box;color:#333;inline-size:100%;min-inline-size:0;max-inline-size:100%;display:block}.field{flex-direction:column;gap:.5rem;inline-size:100%;display:flex}.title{color:#333;font-size:.875rem;font-style:normal;font-weight:600;line-height:1.125rem}.control{box-sizing:border-box;color:#333;background:#fff;border:.0625rem solid #333;border-radius:.5rem;align-items:center;gap:.5rem;block-size:2.625rem;inline-size:100%;padding:.5rem 1rem;display:flex}input{appearance:none;color:#333;background:0 0;border:0;outline:0;flex:auto;inline-size:100%;min-inline-size:0;padding:0;font-family:inherit;font-size:1rem;font-style:normal;font-weight:400;line-height:1.5rem}input::placeholder{color:#333333b8;opacity:1}.message{color:#333333b8;font-size:.875rem;font-style:normal;font-weight:400;line-height:1.125rem}:host(.focused) .control{border-width:.125rem}:host(.disabled) .title,:host(.disabled) .message,:host(.disabled) input,:host(.disabled) input::placeholder{color:#333333b8}:host(.disabled) .control{color:#333333b8;background:#eaeaea;border-color:#333333b8}:host(.error) .title,:host(.error) .message,:host(.error) input,:host(.error) input::placeholder{color:#9d151c}:host(.error) .control{color:#9d151c;background:#fbebed;border-color:#d0021b}::slotted([slot=left]),::slotted([slot=right]){flex:none}`})))()}var w,T;function init_ui_input_field$1(){return(init_ui_input_field$1=e((()=>{l(),init_ui_input_field(),g(),init_forms(),w=0,T=class UIInputField{label=c();placeholder=c(``);bottomText=c();errorText=c();invalid=c(!1,{transform:p});disabled=c(!1,{transform:p});readonly=c(!1,{transform:p});required=c(!1,{transform:p});type=c(`text`);name=c(``);autocomplete=c();inputMode=c();ariaLabel=c();ariaLabelledby=c();value=r(``);blurred=n();inputId=`ui-input-field-${++w}`;messageId=`${this.inputId}-message`;focused=_(!1);formDisabled=_(!1);onChange=()=>{};onTouched=()=>{};isDisabled=t(()=>this.disabled()||this.formDisabled());hasError=t(()=>this.invalid()||!!this.errorText());message=t(()=>this.errorText()||this.bottomText());ngOnInit(){if(!this.label()?.trim()&&!this.ariaLabel()?.trim()&&!this.ariaLabelledby()?.trim())throw Error(`[UIInputField] label, ariaLabel or ariaLabelledby is required for an accessible name.`)}onFocus(){this.focused.set(!0)}onBlur(e){this.focused.set(!1),this.onTouched(),this.blurred.emit(e)}onInput(e){let t=e.target.value;this.value.set(t),this.onChange(t)}writeValue(e){this.value.set(e==null?``:String(e))}registerOnChange(e){this.onChange=e}registerOnTouched(e){this.onTouched=e}setDisabledState(e){this.formDisabled.set(e)}get isFocused(){return this.focused()}get isFilled(){return this.value().length>0}get hasDisabledState(){return this.isDisabled()}get hasErrorState(){return this.hasError()}static propDecorators={label:[{type:f,args:[{isSignal:!0,alias:`label`,required:!1,transform:void 0}]}],placeholder:[{type:f,args:[{isSignal:!0,alias:`placeholder`,required:!1,transform:void 0}]}],bottomText:[{type:f,args:[{isSignal:!0,alias:`bottomText`,required:!1,transform:void 0}]}],errorText:[{type:f,args:[{isSignal:!0,alias:`errorText`,required:!1,transform:void 0}]}],invalid:[{type:f,args:[{isSignal:!0,alias:`invalid`,required:!1,transform:void 0}]}],disabled:[{type:f,args:[{isSignal:!0,alias:`disabled`,required:!1,transform:void 0}]}],readonly:[{type:f,args:[{isSignal:!0,alias:`readonly`,required:!1,transform:void 0}]}],required:[{type:f,args:[{isSignal:!0,alias:`required`,required:!1,transform:void 0}]}],type:[{type:f,args:[{isSignal:!0,alias:`type`,required:!1,transform:void 0}]}],name:[{type:f,args:[{isSignal:!0,alias:`name`,required:!1,transform:void 0}]}],autocomplete:[{type:f,args:[{isSignal:!0,alias:`autocomplete`,required:!1,transform:void 0}]}],inputMode:[{type:f,args:[{isSignal:!0,alias:`inputMode`,required:!1,transform:void 0}]}],ariaLabel:[{type:f,args:[{isSignal:!0,alias:`ariaLabel`,required:!1,transform:void 0}]}],ariaLabelledby:[{type:f,args:[{isSignal:!0,alias:`ariaLabelledby`,required:!1,transform:void 0}]}],value:[{type:f,args:[{isSignal:!0,alias:`value`,required:!1}]},{type:h,args:[`valueChange`]}],blurred:[{type:h,args:[`blurred`]}],isFocused:[{type:d,args:[`class.focused`]}],isFilled:[{type:d,args:[`class.filled`]}],hasDisabledState:[{type:d,args:[`class.disabled`]}],hasErrorState:[{type:d,args:[`class.error`]}]}},T=m([a({selector:`ui-input-field`,standalone:!0,template:`
    <div class="field">
      @if (label()) {
        <label class="title" [for]="inputId">{{ label() }}</label>
      }

      <div class="control">
        <ng-content select="[slot='left']"></ng-content>
        <input
          [id]="inputId"
          [type]="type()"
          [name]="name()"
          [value]="value()"
          [placeholder]="placeholder()"
          [disabled]="isDisabled()"
          [readOnly]="readonly()"
          [required]="required()"
          [attr.autocomplete]="autocomplete()"
          [attr.inputmode]="inputMode()"
          [attr.aria-label]="ariaLabel()"
          [attr.aria-labelledby]="ariaLabelledby()"
          [attr.aria-describedby]="message() ? messageId : null"
          [attr.aria-invalid]="hasError() ? 'true' : null"
          (focus)="onFocus()"
          (blur)="onBlur($event)"
          (input)="onInput($event)"
        />
        <ng-content select="[slot='right']"></ng-content>
      </div>

      @if (message()) {
        <div class="message" [id]="messageId" [attr.role]="hasError() ? 'alert' : null">
          {{ message() }}
        </div>
      }
    </div>
  `,providers:[{provide:S,useExisting:o(()=>T),multi:!0}],encapsulation:s.ShadowDom,changeDetection:i.OnPush,styles:[C]})],T)})))()}var E,D,O,k,A,j,M;function init_ui_input_field_stories(){return(init_ui_input_field_stories=e((()=>{y(),b(),init_ui_input_field$1(),E={title:`Components/Input Field`,component:T,tags:[`autodocs`],decorators:[v({imports:[T,x]})],parameters:{layout:`padded`},args:{label:`Label`,placeholder:`Placeholder text`,bottomText:`Bottom text here`,disabled:!1,invalid:!1,readonly:!1,required:!1},render:e=>({props:e,template:`
      <ui-input-field
        style="display: block; inline-size: 100%"
        [label]="label"
        [placeholder]="placeholder"
        [bottomText]="bottomText"
        [errorText]="errorText"
        [disabled]="disabled"
        [invalid]="invalid"
        [readonly]="readonly"
        [required]="required"
      ></ui-input-field>
    `})},D={},O={args:{value:`Filled`}},k={args:{disabled:!0}},A={args:{errorText:`Bottom text here`,value:`Filled`}},j={render:e=>({props:e,template:`
      <ui-input-field
        style="display: block; inline-size: 100%"
        label="Label"
        placeholder="Placeholder text"
        bottomText="Bottom text here"
      >
        <ui-icon slot="left" name="lens" fill="no-fill" size="24"></ui-icon>
        <ui-icon slot="right" name="info" fill="no-fill" size="24"></ui-icon>
      </ui-input-field>
    `})},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    value: 'Filled'
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    errorText: 'Bottom text here',
    value: 'Filled'
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  render: args => ({
    props: args,
    template: \`
      <ui-input-field
        style="display: block; inline-size: 100%"
        label="Label"
        placeholder="Placeholder text"
        bottomText="Bottom text here"
      >
        <ui-icon slot="left" name="lens" fill="no-fill" size="24"></ui-icon>
        <ui-icon slot="right" name="info" fill="no-fill" size="24"></ui-icon>
      </ui-input-field>
    \`
  })
}`,...j.parameters?.docs?.source}}},M=[`Default`,`Filled`,`Disabled`,`Error`,`WithIcons`]})))()}init_ui_input_field_stories();export{D as Default,k as Disabled,A as Error,O as Filled,j as WithIcons,M as __namedExportsOrder,E as default};
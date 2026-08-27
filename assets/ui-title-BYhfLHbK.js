import{n as e}from"./rolldown-runtime-D_-wTCJc.js";import{F as t,H as n,N as r,O as i,T as a,X as o,b as s,d as c,gn as l,m as u,w as d,xn as f}from"./angular-platform-DrDZMvHd.js";import{d as p,m}from"./ionic-angular-standalone-BcMlcZh6.js";var h;function init_ui_title(){return(init_ui_title=e((()=>{h=`:host{--ion-color-primary:#ffcd00;--ion-color-primary-shade:#ecc102;--ion-color-primary-tint:#ffcd00;--ion-color-primary-contrast:#333;--ion-color-secondary:#045738;--ion-color-secondary-shade:#045135;--ion-color-secondary-tint:#055f3e;--ion-color-secondary-contrast:#fff;--ion-color-tertiary:#008051;--ion-color-tertiary-shade:#008051;--ion-color-tertiary-tint:#008051;--ion-color-tertiary-contrast:#fff;--ion-color-default-grey:#333;--ion-color-default-grey-contrast:#fff;--ion-color-default-grey-contrast-rgb:51, 51, 51;--ion-color-default-grey-shade:#333;--ion-color-default-grey-tint:#333;--ion-color-white:#fff;--ion-color-white-rgb:255, 255, 255;--ion-color-white-contrast:#333;--ion-color-white-contrast-rgb:51, 51, 51;--ion-color-white-shade:#fff;--ion-color-white-tint:#fff;--ion-color-green:#045738;--ion-color-green-rgb:4, 87, 56;--ion-color-green-contrast:#333;--ion-color-green-contrast-rgb:51, 51, 51;--ion-color-green-shade:#045135;--ion-color-green-tint:#055f3e}:host .ion-color-default-grey{--ion-color-base:var(--ion-color-default-grey);--ion-color-base-rgb:var(--ion-color-default-grey-rgb);--ion-color-contrast:var(--ion-color-default-grey-contrast);--ion-color-contrast-rgb:var(--ion-color-default-grey-contrast-rgb);--ion-color-shade:var(--ion-color-default-grey-shade);--ion-color-tint:var(--ion-color-default-grey-tint)}:host .ion-color-white{--ion-color-base:var(--ion-color-white);--ion-color-base-rgb:var(--ion-color-white-rgb);--ion-color-contrast:var(--ion-color-white-contrast);--ion-color-contrast-rgb:var(--ion-color-white-contrast-rgb);--ion-color-shade:var(--ion-color-white-shade);--ion-color-tint:var(--ion-color-white-tint)}:host .ion-color-green{--ion-color-base:var(--ion-color-green);--ion-color-base-rgb:var(--ion-color-green-rgb);--ion-color-contrast:var(--ion-color-green-contrast);--ion-color-contrast-rgb:var(--ion-color-green-contrast-rgb);--ion-color-shade:var(--ion-color-green-shade);--ion-color-tint:var(--ion-color-green-tint)}:host{display:block}h1,h2,h3,h4{margin:0}h1{font-size:2rem;font-style:normal;font-weight:600;line-height:2.5rem}h2{font-size:1.5rem;font-style:normal;font-weight:600;line-height:2rem}h3{font-size:1.25rem;font-style:normal;font-weight:600;line-height:1.75rem}h4{font-size:1.125rem;font-style:normal;font-weight:600;line-height:1.625rem}`})))()}var g;function init_ui_title$1(){return(init_ui_title$1=e((()=>{f(),init_ui_title(),c(),d(),m(),g=class UITitle{size=a(`l`);color=a(`default-grey`);ariaLabel=a();ariaHidden=a(!1,{transform:s});accessibleAriaLabel=i(()=>{let e=this.ariaLabel()?.trim();return this.ariaHidden()||!e?null:e});ngOnInit(){if(this.ariaHidden()&&this.ariaLabel()?.trim())throw Error(`[UITitle] ariaLabel cannot be used when ariaHidden is true.`)}static propDecorators={size:[{type:n,args:[{isSignal:!0,alias:`size`,required:!1,transform:void 0}]}],color:[{type:n,args:[{isSignal:!0,alias:`color`,required:!1,transform:void 0}]}],ariaLabel:[{type:n,args:[{isSignal:!0,alias:`ariaLabel`,required:!1,transform:void 0}]}],ariaHidden:[{type:n,args:[{isSignal:!0,alias:`ariaHidden`,required:!1,transform:void 0}]}]}},g=l([t({selector:`ui-title`,standalone:!0,imports:[u,p],template:`
    <ng-template #content>
      <ion-text mode="ios" [color]="color()">
        <ng-content></ng-content>
      </ion-text>
    </ng-template>

    @switch (size()) {
      @case ('xl') {
        <h1
          [attr.aria-hidden]="ariaHidden() ? 'true' : null"
          [attr.aria-label]="accessibleAriaLabel()"
        >
          <ng-container [ngTemplateOutlet]="content"></ng-container>
        </h1>
      }
      @case ('l') {
        <h2
          [attr.aria-hidden]="ariaHidden() ? 'true' : null"
          [attr.aria-label]="accessibleAriaLabel()"
        >
          <ng-container [ngTemplateOutlet]="content"></ng-container>
        </h2>
      }
      @case ('m') {
        <h3
          [attr.aria-hidden]="ariaHidden() ? 'true' : null"
          [attr.aria-label]="accessibleAriaLabel()"
        >
          <ng-container [ngTemplateOutlet]="content"></ng-container>
        </h3>
      }
      @case ('s') {
        <h4
          [attr.aria-hidden]="ariaHidden() ? 'true' : null"
          [attr.aria-label]="accessibleAriaLabel()"
        >
          <ng-container [ngTemplateOutlet]="content"></ng-container>
        </h4>
      }
    }
  `,encapsulation:o.ShadowDom,changeDetection:r.OnPush,styles:[h]})],g)})))()}export{init_ui_title$1 as n,g as t};
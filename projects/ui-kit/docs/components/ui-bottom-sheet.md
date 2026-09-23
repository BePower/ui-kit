# Bottom sheet

Open consumer-defined Angular content programmatically through `UIBottomSheetService`.
The service opens the consumer component directly. That component uses `UIBottomSheet` as its
public layout shell, similarly to `UIPage`. Import `@bepower/ui-kit/base` in the app global SCSS
so the controller-created overlay receives its sizing and rounded corners.

```ts
import { Component, inject, Input } from '@angular/core';
import { UIBottomSheet, UIBottomSheetRef, UIBottomSheetService } from '@bepower/ui-kit';

@Component({
  imports: [UIBottomSheet],
  template: `<ui-bottom-sheet hasFooter>
    <h2>{{ title }}</h2>
    <button footer (click)="sheet.close(true)">Confirm</button>
  </ui-bottom-sheet>`,
})
export class NoticeContent {
  @Input({ required: true }) title!: string;
  readonly sheet = inject(UIBottomSheetRef<boolean>);
}

// In the consumer component:
// private readonly sheets = inject(UIBottomSheetService);
// const sheet = await this.sheets.present<boolean>({
//   component: NoticeContent,
//   componentProps: { title: 'Important information' },
//   closeLabel: 'Close notice',
// });
// const result = await sheet.onDidDismiss();
// if (result.role === 'confirm' && result.data) { ... }
```

`present()` resolves as soon as presentation completes and returns an instance-scoped handle.
Content can use its injected `UIBottomSheetRef`, while the caller can use the returned handle to
dismiss that specific bottom sheet:

```ts
const sheet = await this.sheets.present<boolean>({
  component: NoticeContent,
  componentProps: { title: 'Important information' },
  closeLabel: 'Close notice',
});

if (flowCancelled) {
  await sheet.cancel();
} else {
  await sheet.close(true);
}

const result = await sheet.onDidDismiss();
```

`close(data)` uses the `confirm` role and `cancel()` uses the `cancel` role. The handle controls
only its own bottom sheet. `onDidDismiss()` always returns the same dismissal promise. The close
button returns the `cancel` role; Ionic supplies the role for native back/Escape or backdrop
dismissal. Overlay, injector, and focus cleanup remain automatic.

Ionic assigns `componentProps` directly to properties of the content component instance. Use
decorator-based `@Input` properties for values supplied this way: assigning a primitive directly
would overwrite an `InputSignal` function. Input aliases are not resolved by this assignment.
Pass the consumer's `Injector` through the optional `injector` option for page-scoped providers.
The service destroys its child injector when the sheet closes.

`closeLabel` (localized close button label) must be nonempty.

The `showCloseButton` boolean input on `ui-bottom-sheet` defaults to `true`. The consumer can
hide the close action from its template:

```html
<ui-bottom-sheet [showCloseButton]="false" hasFooter>
  <h2>Important information</h2>
  <button footer (click)="sheet.close(true)">Confirm</button>
</ui-bottom-sheet>
```

This hides only the button; header spacing is preserved. `closeLabel` is still required by
`present()`, including when the button is initially hidden. Back/Escape and the configured backdrop
dismissal behavior are unchanged.

The UI Kit shell uses Shadow DOM encapsulation; consumer components retain their own
encapsulation. Ionic manages overlay focus and background interaction; verify
VoiceOver/TalkBack with the actual consumer content.

After Ionic finishes presenting the modal, the UI Kit leaves one rendering opportunity for the
accessibility tree to update, then focuses the start of the projected content. The content wrapper
has `tabindex="-1"`, so it can receive programmatic focus without adding a tab stop. No hidden
heading or configured `ariaLabel` is injected. The consumer supplies meaningful headings and text
directly in the body. The close button remains accessible in the header, and the footer remains
outside the initial focus target. Pending focus is cancelled when dismissal starts.

Migration: remove `ariaLabel` from `UIBottomSheetService.present()` options. The former label no
longer names the Ionic dialog; focusing its content does not itself provide a dialog name.

After dismissal, focus returns to the title registered by the currently entered `UIPage`.
Hidden, disconnected or inert targets are skipped, and focus cannot leave another open modal.
Without a registered page, Ionic retains its default return-focus behavior. Focus uses DOM APIs;
verify the spoken announcement on VoiceOver/TalkBack, since DOM focus and screen-reader speech
are not equivalent.

Internally, the shell is structured with `ion-header`, `ion-content`, and `ion-footer`. Default
projected content is placed in `ion-content`; elements marked with `[footer]` are projected into
`ion-footer`. Set `hasFooter` when providing footer content. There is no legacy content mode.

The sheet has fluid dimensions: it starts at half the viewport height and grows vertically with
its content up to the viewport height minus the top safe area. Its header has 24px top/inline padding and 24px
rounded top corners. Long content scrolls inside the body, and bottom safe-area padding is
applied. Swipe dismissal is disabled. Backdrop dismissal defaults to false and can be enabled
with `backdropDismiss`. The consumer owns its body and CTA layout, including body padding.
The optional footer stays outside the scrolling body.

Storybook exposes a single **Playground** with controls for the content, footer, close button,
and backdrop dismissal. Controls apply when opening the next sheet. Increase the paragraph
count to check the maximum height and scrolling behavior.

This initial implementation does not include the specialized feedback variant, custom
breakpoints, or a forced-acknowledgement mode. Native back/Escape can dismiss the sheet.

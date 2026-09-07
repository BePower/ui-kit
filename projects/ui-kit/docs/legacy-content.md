# Legacy content migration

`ui-page`, `ui-grid`, `ui-row`, and `ui-col` expose a temporary boolean `legacyContent` input to
support gradual migration from consumer styles to UI-kit components.

## Choosing a mode

| Value             | Content placement                                              | Consumer global styles                                         |
| ----------------- | -------------------------------------------------------------- | -------------------------------------------------------------- |
| `false` (default) | Angular `ng-content` inside the container's Shadow DOM         | Cannot select content across that boundary                     |
| `true`            | Native slot; children remain in the container host's light DOM | Can reach that content if no ancestor UI container isolates it |

Use the bare attribute `legacyContent` or `[legacyContent]="true"` for legacy pages. Omit the input
or use `[legacyContent]="false"` for migrated content. The containers retain Shadow DOM encapsulation
in both modes; this option only changes how their content is placed.

The value is read once in `ngOnInit`. Later changes are ignored so that existing nodes are not moved
between DOM trees during the lifetime of the component. Recreate the component to change modes.
Other inputs and consumer bindings, events, `@if`, and `@for` continue to update normally.

## Nested containers

The setting is not inherited. Enable it at every container boundary through which consumer global
styles need to reach the content:

```html
<ui-page legacyContent hasHeader title="FAQ">
  <ui-grid legacyContent horizontal="xs">
    <ui-row legacyContent gap="xxs">
      <ui-col legacyContent size="12">
        <div class="legacy-faq-content">Content styled by the consumer</div>
      </ui-col>
    </ui-row>
  </ui-grid>
</ui-page>
```

For example, enabling it only on `ui-col` is not enough when the enclosing `ui-page` projects the
entire grid into its Shadow DOM. Conversely, components such as `ui-title` and `ui-button` retain
their own internal style boundaries even inside legacy containers.

After migrating the content and its styles to the UI-kit APIs, remove `legacyContent` from the
relevant containers to restore Angular content projection. This compatibility path is intended to
be removed once migration is complete.

## Limitations

- Style your own elements directly. Selectors that require internal ancestors, such as
  `ion-content .legacy-faq-content`, cannot match across the Shadow DOM boundary.
- Slotted nodes are not DOM descendants of the wrapped Ionic elements. Components that use
  `closest('ion-content')` can lose scroll integration. In particular, verify infinite scroll,
  reordering, sliding items, ranges, and native input keyboard/scroll behavior before migrating
  those screens.
- A direct child with a named `slot` needs a matching native slot on the UI container. These
  containers expose only the default body slot; `slot="fixed"` is not forwarded to `ion-content`.
- `ui-page` footer content still uses Angular projection with the `footer` attribute and requires
  `hasFooter`. `legacyContent` does not make that content reachable by consumer global styles.
- The UI kit still owns the container layout and internal styles. Legacy mode does not expose
  arbitrary internal elements or guarantee compatibility with all Ionic content integrations.

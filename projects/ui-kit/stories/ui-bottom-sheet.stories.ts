import { Component, DestroyRef, inject, Injector, Input, signal } from '@angular/core';
import { IonApp } from '@ionic/angular/standalone';
import { type Meta, moduleMetadata, type StoryObj } from '@storybook/angular-vite';
import { UIBottomSheet } from '../src/lib/components/bottom-sheet/ui-bottom-sheet';
import { UIButton } from '../src/lib/components/button/ui-button';
import { UIP } from '../src/lib/components/p/ui-p';
import { UITitle } from '../src/lib/components/title/ui-title';
import { UIBottomSheetService } from '../src/lib/services/bottom-sheet.service';
import { UIBottomSheetRef } from '../src/lib/services/bottom-sheet-ref';

class BottomSheetPlaygroundState {
  readonly title = signal('Important information');
  readonly body = signal('The content belongs to the consumer.');
  readonly paragraphCount = signal(1);
  readonly hasFooter = signal(true);
  readonly showCloseButton = signal(true);
  activeSheet?: UIBottomSheetRef<string>;
}

@Component({
  imports: [UIBottomSheet, UIButton, UIP, UITitle],
  template: `
    <ui-bottom-sheet [hasFooter]="state.hasFooter()" [showCloseButton]="state.showCloseButton()">
      <div class="sheet-content">
        <ui-title size="xl">{{ state.title() }}</ui-title>
        @for (paragraph of paragraphs; track $index) {
          <ui-p align="center">{{ paragraph }}</ui-p>
        }
      </div>
      <ui-button footer expand ariaLabel="Confirm" (click)="sheet.close('confirmed')">
        Confirm
      </ui-button>
    </ui-bottom-sheet>
  `,
  styles: `
    .sheet-content {
      display: grid;
      gap: 24px;
      padding: 24px;
      text-align: center;
    }
  `,
})
class ExampleSheetContent {
  protected readonly state = inject(BottomSheetPlaygroundState);
  readonly sheet = inject(UIBottomSheetRef<string>);

  get paragraphs(): string[] {
    return Array.from({ length: this.state.paragraphCount() }, () => this.state.body());
  }

  ngOnInit(): void {
    this.state.activeSheet = this.sheet;
  }
}

@Component({
  selector: 'storybook-bottom-sheet-playground',
  imports: [IonApp, UIButton],
  providers: [BottomSheetPlaygroundState],
  template: `
    <ion-app>
      <div style="padding: 24px">
        <ui-button ariaLabel="Open bottom sheet" [disabled]="opened()" (click)="open()">
          Open bottom sheet
        </ui-button>
        <p aria-live="polite">{{ result() }}</p>
      </div>
    </ion-app>
  `,
})
class BottomSheetExample {
  private readonly sheets = inject(UIBottomSheetService);
  private readonly injector = inject(Injector);
  private readonly state = inject(BottomSheetPlaygroundState);
  @Input()
  set title(value: string) {
    this.state.title.set(value);
  }
  get title(): string {
    return this.state.title();
  }
  @Input()
  set body(value: string) {
    this.state.body.set(value);
  }
  get body(): string {
    return this.state.body();
  }
  @Input()
  set paragraphCount(value: number) {
    this.state.paragraphCount.set(value);
  }
  get paragraphCount(): number {
    return this.state.paragraphCount();
  }
  @Input()
  set hasFooter(value: boolean) {
    this.state.hasFooter.set(value);
  }
  get hasFooter(): boolean {
    return this.state.hasFooter();
  }
  @Input()
  set showCloseButton(value: boolean) {
    this.state.showCloseButton.set(value);
  }
  get showCloseButton(): boolean {
    return this.state.showCloseButton();
  }
  @Input() backdropDismiss = false;
  @Input() closeLabel = 'Close notice';
  readonly result = signal('');
  readonly opened = signal(false);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.destroyRef.onDestroy(() => {
      void this.state.activeSheet?.cancel();
    });
  }

  async open(): Promise<void> {
    if (this.opened()) return;
    this.opened.set(true);
    try {
      const result = await this.sheets.open<string>({
        component: ExampleSheetContent,
        injector: this.injector,
        closeLabel: this.closeLabel,
        backdropDismiss: this.backdropDismiss,
      });
      this.result.set(`Dismissed: ${result.role}; result: ${result.data ?? 'none'}`);
    } catch (error) {
      this.result.set(error instanceof Error ? error.message : String(error));
    } finally {
      this.state.activeSheet = undefined;
      this.opened.set(false);
    }
  }
}

export default {
  title: 'Components/Bottom Sheet',
  component: BottomSheetExample,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [BottomSheetExample] })],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Programmatic bottom sheet with consumer-owned content and footer. Content controls update an open sheet. Service controls apply on the next opening. Increase the paragraph count to test scrolling. Hiding the close button does not disable native Back/Escape dismissal.',
      },
    },
  },
  argTypes: {
    title: { control: 'text', name: 'Content: title' },
    body: { control: 'text', name: 'Content: body' },
    paragraphCount: {
      control: { type: 'range', min: 1, max: 20, step: 1 },
      name: 'Content: paragraph count',
    },
    hasFooter: { control: 'boolean', name: 'UIBottomSheet: hasFooter' },
    showCloseButton: { control: 'boolean', name: 'UIBottomSheet: showCloseButton' },
    backdropDismiss: { control: 'boolean', name: 'Service: backdropDismiss' },
    closeLabel: { control: 'text', name: 'Service: closeLabel' },
  },
  args: {
    title: 'Important information',
    body: 'The content belongs to the consumer.',
    paragraphCount: 1,
    hasFooter: true,
    showCloseButton: true,
    backdropDismiss: false,
    closeLabel: 'Close notice',
  },
  render: (args) => ({
    props: args,
    template: `
      <storybook-bottom-sheet-playground
        [title]="title"
        [body]="body"
        [paragraphCount]="paragraphCount"
        [hasFooter]="hasFooter"
        [showCloseButton]="showCloseButton"
        [backdropDismiss]="backdropDismiss"
        [closeLabel]="closeLabel"
      />
    `,
  }),
} satisfies Meta<BottomSheetExample>;

export const Playground: StoryObj<BottomSheetExample> = {};

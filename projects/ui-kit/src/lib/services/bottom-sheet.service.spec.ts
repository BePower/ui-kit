import { Component, inject, Injector, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular/standalone';
import { deferred } from '../../../../../testing/helpers';
import { UI_BOTTOM_SHEET_CONFIG } from '../components/bottom-sheet/bottom-sheet-config';
import { UIBottomSheet } from '../components/bottom-sheet/ui-bottom-sheet';
import { UIBottomSheetService } from './bottom-sheet.service';
import { UIBottomSheetRef } from './bottom-sheet-ref';
import { ScreenReaderService } from './screen-reader.service';

@Component({
  imports: [UIBottomSheet],
  template: `
    <ui-bottom-sheet hasFooter>
      <h2>Consumer title</h2>
      <button class="confirm" (click)="ref.close(message())">{{ message() }}</button>
      <button footer>Footer action</button>
    </ui-bottom-sheet>
  `,
})
class ConsumerContent {
  message = input.required<string>();
  ref = inject(UIBottomSheetRef<string>);
}

describe('UIBottomSheetService', () => {
  function setup() {
    const dismissal = deferred<{ data?: string; role: string }>();
    const modal = {
      present: vi.fn().mockResolvedValue(undefined),
      dismiss: vi.fn().mockResolvedValue(true),
      onDidDismiss: vi.fn(() => dismissal.promise),
      remove: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    const create = vi.fn().mockResolvedValue(modal);
    TestBed.configureTestingModule({
      providers: [{ provide: ModalController, useValue: { create } }],
    });
    const service = TestBed.inject(UIBottomSheetService);
    return { service, create, modal, dismissal };
  }

  const options = { component: ConsumerContent, closeLabel: ' Close ' };

  it('presents an accessible sheet and resolves its dismissal result', async () => {
    const { service, create, modal, dismissal } = setup();
    const handle = await service.present<string>(options);
    expect(modal.present).toHaveBeenCalledOnce();
    const config = create.mock.calls[0][0];
    expect(config.component).toBe(ConsumerContent);
    expect(config.htmlAttributes).toBeUndefined();
    expect(config.componentProps).toEqual({});
    expect(config.breakpoints).toEqual([0, 1]);
    expect(config.initialBreakpoint).toBe(1);
    expect(config.backdropDismiss).toBe(false);
    expect(config.handle).toBe(false);
    expect(await config.canDismiss(undefined, 'gesture')).toBe(false);
    expect(await config.canDismiss(undefined, 'confirm')).toBe(true);
    const injector = config.injector as Injector;
    const ref = injector.get(UIBottomSheetRef<string>);
    expect(injector.get(UI_BOTTOM_SHEET_CONFIG)).toEqual({
      closeLabel: 'Close',
    });
    await ref.close('done');
    expect(modal.dismiss).toHaveBeenCalledWith('done', 'confirm');
    await ref.cancel();
    expect(modal.dismiss).toHaveBeenCalledWith(undefined, 'cancel');
    dismissal.resolve({ data: 'done', role: 'confirm' });
    await expect(handle.onDidDismiss()).resolves.toEqual({ data: 'done', role: 'confirm' });
    expect(modal.remove).toHaveBeenCalledOnce();
    expect(() => injector.get(UIBottomSheetRef)).toThrow();
  });

  it('returns an external handle as soon as the sheet is presented', async () => {
    const { service, modal, dismissal } = setup();
    const handle = await service.present<string>(options);
    expect(modal.present).toHaveBeenCalledOnce();

    await handle.close('external');
    await handle.cancel();
    expect(modal.dismiss).toHaveBeenNthCalledWith(1, 'external', 'confirm');
    expect(modal.dismiss).toHaveBeenNthCalledWith(2, undefined, 'cancel');

    dismissal.resolve({ data: 'external', role: 'confirm' });
    await expect(handle.onDidDismiss()).resolves.toEqual({
      data: 'external',
      role: 'confirm',
    });
    expect(modal.remove).toHaveBeenCalledOnce();
  });

  it('propagates dismissal failures through the external handle', async () => {
    const { service, modal, dismissal } = setup();
    const handle = await service.present(options);
    const failure = new Error('dismissal failed');
    dismissal.reject(failure);
    await expect(handle.onDidDismiss()).rejects.toBe(failure);
    expect(modal.remove).toHaveBeenCalledOnce();
  });

  it('forwards inputs, backdrop preference and consumer-scoped providers', async () => {
    const { service, create, modal, dismissal } = setup();
    const parent = Injector.create({ providers: [{ provide: 'context', useValue: 'consumer' }] });
    const handle = await service.present({
      ...options,
      injector: parent,
      componentProps: { message: 'Hello' },
      backdropDismiss: true,
    });
    expect(modal.present).toHaveBeenCalledOnce();
    const config = create.mock.calls[0][0];
    expect(config.componentProps).toEqual({ message: 'Hello' });
    expect(config.injector.get('context')).toBe('consumer');
    expect(config.backdropDismiss).toBe(true);
    dismissal.resolve({ role: 'backdrop' });
    await handle.onDidDismiss();
    expect(parent.get('context')).toBe('consumer');
    parent.destroy();
  });

  it('requests the page landmark only after dismissal and removal of the modal', async () => {
    const { service, modal, dismissal } = setup();
    const restore = vi
      .spyOn(TestBed.inject(ScreenReaderService), 'focusCurrentPage')
      .mockImplementation(() => {
        expect(modal.remove).toHaveBeenCalledOnce();
        return vi.fn();
      });
    const handle = await service.present(options);
    expect(modal.present).toHaveBeenCalledOnce();
    expect(restore).not.toHaveBeenCalled();
    dismissal.resolve({ role: 'cancel' });
    await handle.onDidDismiss();
    expect(restore).toHaveBeenCalledOnce();
  });

  it.each(['', '  '])('rejects an empty close label %j', async (closeLabel) => {
    const { service, create } = setup();
    await expect(service.present({ ...options, closeLabel })).rejects.toThrow(
      'closeLabel is required',
    );
    expect(create).not.toHaveBeenCalled();
  });

  it('cleans up the overlay and injector when presentation fails', async () => {
    const { service, create, modal } = setup();
    modal.present.mockRejectedValue(new Error('presentation failed'));
    await expect(service.present(options)).rejects.toThrow('presentation failed');
    expect(modal.remove).toHaveBeenCalledOnce();
    expect(() => create.mock.calls[0][0].injector.get(UIBottomSheetRef)).toThrow();
  });

  it('subscribes before presentation and skips initial focus if already dismissing', async () => {
    const { service, modal, dismissal, create } = setup();
    const focus = vi.spyOn(TestBed.inject(ScreenReaderService), 'focus');
    modal.present.mockImplementation(async () => {
      expect(modal.onDidDismiss).toHaveBeenCalledOnce();
      const ref = create.mock.calls[0][0].injector.get(UIBottomSheetRef);
      ref.registerInitialFocusTarget(document.createElement('div'));
      const listener = modal.addEventListener.mock.calls[0][1] as () => void;
      listener();
      dismissal.resolve({ role: 'cancel' });
    });
    const handle = await service.present(options);
    await expect(handle.onDidDismiss()).resolves.toEqual({ role: 'cancel' });
    expect(focus).not.toHaveBeenCalled();
    expect(modal.removeEventListener).toHaveBeenCalledWith(
      'ionModalWillDismiss',
      modal.addEventListener.mock.calls[0][1],
    );
  });

  it('cancels a previous page restore when another sheet opens', async () => {
    const { service, modal, dismissal } = setup();
    const cancelRestore = vi.fn();
    vi.spyOn(TestBed.inject(ScreenReaderService), 'focusCurrentPage').mockReturnValue(
      cancelRestore,
    );
    const first = await service.present(options);
    expect(modal.present).toHaveBeenCalledOnce();
    dismissal.resolve({ role: 'cancel' });
    await first.onDidDismiss();
    await (await service.present(options)).onDidDismiss();
    expect(cancelRestore).toHaveBeenCalledOnce();
  });

  it('cleans up the injector when overlay creation fails', async () => {
    const { service, create } = setup();
    create.mockRejectedValue(new Error('creation failed'));
    await expect(service.present(options)).rejects.toThrow('creation failed');
    expect(() => create.mock.calls[0][0].injector.get(UIBottomSheetRef)).toThrow();
  });

  it('queues a dismissal requested before modal creation completes', async () => {
    const { service, create, modal, dismissal } = setup();
    const creation = deferred<typeof modal>();
    create.mockReturnValue(creation.promise);
    const presentation = service.present<string>(options);
    await vi.waitFor(() => expect(create).toHaveBeenCalledOnce());
    const ref = create.mock.calls[0][0].injector.get(UIBottomSheetRef<string>);
    const earlyDismissal = ref.close('early');
    expect(modal.dismiss).not.toHaveBeenCalled();

    creation.resolve(modal);
    const handle = await presentation;
    await expect(earlyDismissal).resolves.toBe(true);
    expect(modal.dismiss).toHaveBeenCalledWith('early', 'confirm');
    dismissal.resolve({ data: 'early', role: 'confirm' });
    await expect(handle.onDidDismiss()).resolves.toEqual({ data: 'early', role: 'confirm' });
  });

  it('rejects queued and subsequent dismissals when modal creation fails', async () => {
    const { service, create } = setup();
    const creation = deferred<never>();
    create.mockReturnValue(creation.promise);
    const presentation = service.present(options);
    await vi.waitFor(() => expect(create).toHaveBeenCalledOnce());
    const ref = create.mock.calls[0][0].injector.get(UIBottomSheetRef);
    const queuedDismissal = ref.cancel();
    const failure = new Error('creation failed');
    creation.reject(failure);

    await expect(queuedDismissal).rejects.toBe(failure);
    await expect(presentation).rejects.toBe(failure);
    await expect(ref.cancel()).rejects.toBe(failure);
  });
});

describe('UIBottomSheet', () => {
  it('projects content and footer and exposes the close action', async () => {
    const dismiss = vi.fn().mockResolvedValue(true);
    const ref = new UIBottomSheetRef<string>(dismiss);
    const registerFocus = vi.spyOn(ref, 'registerInitialFocusTarget');
    TestBed.configureTestingModule({
      imports: [ConsumerContent],
      providers: [
        { provide: UIBottomSheetRef, useValue: ref },
        {
          provide: UI_BOTTOM_SHEET_CONFIG,
          useValue: { closeLabel: 'Close notice' },
        },
      ],
    });
    const fixture = TestBed.createComponent(ConsumerContent);
    fixture.componentRef.setInput('message', 'Confirm');
    fixture.detectChanges();
    await fixture.whenStable();
    const consumer = fixture.nativeElement as HTMLElement;
    const element = consumer.querySelector('ui-bottom-sheet') as HTMLElement;
    const shadowRoot = element.shadowRoot!;
    expect(shadowRoot.querySelector('ion-header')).toBeTruthy();
    expect(shadowRoot.querySelector('ion-content')).toBeTruthy();
    expect(shadowRoot.querySelector('ion-footer')).toBeTruthy();
    const content = shadowRoot.querySelector<HTMLElement>('.content-surface')!;
    expect(content.getAttribute('tabindex')).toBe('-1');
    expect(registerFocus).toHaveBeenCalledWith(content);
    expect(shadowRoot.querySelector('.screen-reader-only')).toBeNull();
    expect(shadowRoot.querySelectorAll('h2')).toHaveLength(1);
    expect(content.querySelector('h2')?.textContent).toBe('Consumer title');
    content.focus({ preventScroll: true });
    expect(shadowRoot.activeElement).toBe(content);
    const confirm = shadowRoot.querySelector('ion-content .confirm') as HTMLButtonElement;
    expect(confirm.textContent).toBe('Confirm');
    expect(shadowRoot.querySelector('ion-footer [footer]')!.textContent).toBe('Footer action');
    confirm.click();
    expect(dismiss).toHaveBeenCalledWith('Confirm', 'confirm');
    const close = shadowRoot.querySelector('ion-header ui-button') as HTMLElement;
    close.click();
    expect(dismiss).toHaveBeenCalledWith(undefined, 'cancel');
    const ionicButton = close.shadowRoot!.querySelector('ion-button');
    expect(ionicButton!.getAttribute('aria-label')).toBe('Close notice');
    fixture.destroy();
  });
});

describe('UIBottomSheetRef initial focus', () => {
  it('focuses an already rendered shell and cancels superseded requests', () => {
    const cancel = vi.fn();
    const focus = vi.fn(() => cancel);
    const screenReader = { focus } as unknown as ScreenReaderService;
    const ref = new UIBottomSheetRef(vi.fn());
    const content = document.createElement('div');
    ref.registerInitialFocusTarget(content);
    ref.focusInitialTarget(screenReader);
    ref.focusInitialTarget(screenReader);
    expect(cancel).toHaveBeenCalledOnce();
    expect(focus).toHaveBeenCalledTimes(2);
    ref.clearInitialFocusTarget();
    ref.clearInitialFocusTarget();
    expect(cancel).toHaveBeenCalledTimes(2);
  });

  it('discards a queued request when the sheet is destroyed before rendering', () => {
    const focus = vi.fn();
    const ref = new UIBottomSheetRef(vi.fn());
    ref.focusInitialTarget({ focus } as unknown as ScreenReaderService);
    ref.clearInitialFocusTarget();
    ref.registerInitialFocusTarget(document.createElement('div'));
    expect(focus).not.toHaveBeenCalled();
  });

  it('waits for the shell target when presentation completes first', () => {
    const cancel = vi.fn();
    const focus = vi.fn(() => cancel);
    const screenReader = { focus } as unknown as ScreenReaderService;
    const ref = new UIBottomSheetRef(vi.fn());
    const title = document.createElement('h2');

    ref.focusInitialTarget(screenReader);
    expect(focus).not.toHaveBeenCalled();

    ref.registerInitialFocusTarget(title);
    expect(focus).toHaveBeenCalledWith(title, { onlyWhenEnabled: false, afterRender: true });

    ref.clearInitialFocusTarget();
    expect(cancel).toHaveBeenCalledOnce();
  });
});

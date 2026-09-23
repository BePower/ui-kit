import { TestBed } from '@angular/core/testing';
import { IonModalToken } from '@ionic/angular/common';
import { configureComponent, shadow } from '../../../../../../testing/helpers';
import { UIBottomSheetRef } from '../../services/bottom-sheet-ref';
import { UI_BOTTOM_SHEET_CONFIG } from './bottom-sheet-config';
import { UIBottomSheet } from './ui-bottom-sheet';

describe('UIBottomSheet layout', () => {
  function setup(options: { mutationObserver?: boolean } = {}) {
    let resize!: () => void;
    let mutate!: () => void;
    const observer = { observe: vi.fn(), disconnect: vi.fn() };
    const mutations = { observe: vi.fn(), disconnect: vi.fn() };
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          resize = callback;
          return observer;
        }
      },
    );
    if (options.mutationObserver === false) {
      vi.stubGlobal('MutationObserver', undefined);
    } else {
      vi.stubGlobal(
        'MutationObserver',
        class {
          constructor(callback: () => void) {
            mutate = callback;
            return mutations;
          }
        },
      );
    }
    vi.stubGlobal('innerHeight', 800);
    const modal = document.createElement('div');
    modal.className = 'test-bottom-sheet-overlay';
    document.body.append(modal);
    const ref = new UIBottomSheetRef(vi.fn().mockResolvedValue(true));
    const clearFocus = vi.spyOn(ref, 'clearInitialFocusTarget');
    configureComponent(UIBottomSheet);
    TestBed.configureTestingModule({
      providers: [
        { provide: IonModalToken, useValue: modal },
        { provide: UIBottomSheetRef, useValue: ref },
        { provide: UI_BOTTOM_SHEET_CONFIG, useValue: { closeLabel: 'Close' } },
      ],
    });
    const fixture = TestBed.createComponent(UIBottomSheet);
    fixture.detectChanges();
    const root = shadow(fixture);
    const surface = root.querySelector<HTMLElement>('.content-surface')!;
    const header = root.querySelector<HTMLElement>('ion-header')!;
    Object.defineProperty(header, 'offsetHeight', { configurable: true, value: 64 });
    const contentHeight = (height: number) => {
      Object.defineProperty(surface, 'scrollHeight', { configurable: true, value: height });
      resize();
    };
    return {
      fixture,
      root,
      modal,
      observer,
      mutations,
      surface,
      contentHeight,
      resize: () => resize(),
      mutate: () => mutate(),
      clearFocus,
    };
  }

  afterEach(() => {
    document.documentElement.style.removeProperty('--ion-safe-area-top');
    document.querySelectorAll('.test-bottom-sheet-overlay').forEach((modal) => modal.remove());
  });

  it('shows close by default and reacts to boolean input changes without removing the header', () => {
    const { fixture, root } = setup();
    expect(root.querySelector('ion-header ui-button')).not.toBeNull();
    fixture.componentRef.setInput('showCloseButton', 'false');
    fixture.detectChanges();
    expect(root.querySelector('ion-header ui-button')).toBeNull();
    expect(root.querySelector('ion-header')).not.toBeNull();
    fixture.componentRef.setInput('showCloseButton', '');
    fixture.detectChanges();
    expect(root.querySelector('ion-header ui-button')).not.toBeNull();
  });

  it('keeps rendering when MutationObserver is unavailable', () => {
    const { root, observer, modal } = setup({ mutationObserver: false });
    expect(root.querySelector('ion-content')).not.toBeNull();
    expect(observer.observe).not.toHaveBeenCalled();
    expect(modal.style.getPropertyValue('--height')).toBe('');
  });

  it('grows and shrinks with intrinsic content, not the scroll viewport', () => {
    const { modal, contentHeight, root } = setup();
    Object.defineProperty(root.querySelector('ion-content'), 'scrollHeight', { value: 2000 });
    contentHeight(100);
    expect(modal.style.getPropertyValue('--height')).toBe('400px');
    contentHeight(500);
    expect(modal.style.getPropertyValue('--height')).toBe('564px');
    contentHeight(1000);
    expect(modal.style.getPropertyValue('--height')).toBe('800px');
    contentHeight(100);
    expect(modal.style.getPropertyValue('--height')).toBe('400px');
  });

  it('caps at the safe area and prefers Ionic modal offset when available', () => {
    const { modal, contentHeight } = setup();
    document.documentElement.style.setProperty('--ion-safe-area-top', '44px');
    contentHeight(1000);
    expect(modal.style.getPropertyValue('--height')).toBe('756px');
    modal.style.setProperty('--ion-modal-offset-top', '60px');
    contentHeight(1000);
    expect(modal.style.getPropertyValue('--height')).toBe('740px');
    modal.style.setProperty('--ion-modal-offset-top', '0px');
    contentHeight(1000);
    expect(modal.style.getPropertyValue('--height')).toBe('800px');
  });

  it('observes a footer introduced after rendering and releases it when removed', () => {
    const { fixture, root, modal, observer, resize, contentHeight } = setup();
    expect(root.querySelector('ion-footer')).toBeNull();
    contentHeight(500);
    fixture.componentRef.setInput('hasFooter', true);
    fixture.detectChanges();
    const footer = root.querySelector('ion-footer')!;
    expect(observer.observe).toHaveBeenCalledWith(footer);
    Object.defineProperty(footer, 'offsetHeight', { value: 100 });
    resize();
    expect(modal.style.getPropertyValue('--height')).toBe('664px');
    observer.observe.mockClear();
    fixture.componentRef.setInput('hasFooter', false);
    fixture.detectChanges();
    expect(observer.observe).not.toHaveBeenCalledWith(footer);
    expect(modal.style.getPropertyValue('--height')).toBe('564px');
  });

  it('observes asynchronous projected shadow content and releases removed nodes', () => {
    const { surface, mutate, mutations, observer } = setup();
    const icon = document.createElement('span');
    const iconRoot = icon.attachShadow({ mode: 'open' });
    const image = document.createElement('img');
    iconRoot.append(image);
    surface.append(icon);
    mutate();
    expect(observer.observe).toHaveBeenCalledWith(image);
    expect(mutations.observe).toHaveBeenCalledWith(
      iconRoot,
      expect.objectContaining({ subtree: true }),
    );
    icon.remove();
    observer.observe.mockClear();
    mutate();
    expect(observer.observe).not.toHaveBeenCalledWith(image);
    expect(observer.disconnect).toHaveBeenCalled();
  });

  it('responds to viewport changes and cleans up observers, focus and resize listeners', () => {
    const { fixture, modal, observer, mutations, clearFocus, contentHeight } = setup();
    contentHeight(1000);
    vi.stubGlobal('innerHeight', 600);
    window.dispatchEvent(new Event('resize'));
    expect(modal.style.getPropertyValue('--height')).toBe('600px');
    const removeListener = vi.spyOn(window, 'removeEventListener');
    fixture.destroy();
    expect(observer.disconnect).toHaveBeenCalled();
    expect(mutations.disconnect).toHaveBeenCalled();
    expect(clearFocus).toHaveBeenCalledOnce();
    expect(removeListener).toHaveBeenCalledWith('resize', expect.any(Function));
    vi.stubGlobal('innerHeight', 900);
    window.dispatchEvent(new Event('resize'));
    expect(modal.style.getPropertyValue('--height')).toBe('600px');
  });
});

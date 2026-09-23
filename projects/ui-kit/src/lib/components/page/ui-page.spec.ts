import { Component, PLATFORM_ID, signal } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IonContent, IonRouterOutlet, provideIonicAngular } from '@ionic/angular/standalone';
import { provideZonelessChangeDetection } from '@angular/core';
import { setInputs } from '../../../../../../testing/helpers';
import { ScreenReaderService } from '../../services/screen-reader.service';
import { StatusBarService } from '../../services/status-bar.service';
import { UIPage, type HeaderStep } from './ui-page';

@Component({
  imports: [UIPage],
  template: '<ui-page screenReaderTitle="FAQ"><button class="body">Question</button></ui-page>',
})
class PageHost {}

@Component({
  imports: [UIPage],
  template: `<ui-page hasFooter screenReaderTitle="FAQ">
    <button class="body">Question</button><button footer>Footer</button>
  </ui-page>`,
})
class FooterPageHost {}

@Component({
  imports: [UIPage],
  template: `<ui-page legacyContent hasFooter screenReaderTitle="FAQ">
    <button class="body">Question</button><button footer>Footer</button>
  </ui-page>`,
})
class LegacyPageHost {}

const validStep: HeaderStep = {
  currentStep: 2,
  totalSteps: 4,
  label: 'of',
  ariaLabel: 'Registration progress',
};

function createScrollable() {
  const element = document.createElement('div');
  const state = { clientHeight: 100, scrollHeight: 300, scrollTop: 0 };
  for (const property of ['clientHeight', 'scrollHeight', 'scrollTop'] as const) {
    Object.defineProperty(element, property, {
      configurable: true,
      get: () => state[property],
      set: (value: number) => (state[property] = value),
    });
  }
  return { element, state };
}

function createServices() {
  const screenReader = {
    screenState: signal(false),
    screenStateKnown: signal(true),
    focus: vi.fn(() => vi.fn()),
    registerPageFocusTarget: vi.fn((_target: () => HTMLElement | undefined) => vi.fn()),
  };
  const statusBar = {
    setStatusBarStyleLight: vi.fn(async () => undefined),
    setStatusBarStyleDark: vi.fn(async () => undefined),
  };
  return { screenReader, statusBar };
}

function configurePage(
  services = createServices(),
  routerOutlet?: { canGoBack: ReturnType<typeof vi.fn> },
): typeof services {
  TestBed.configureTestingModule({
    imports: [UIPage],
    providers: [
      provideZonelessChangeDetection(),
      provideRouter([]),
      provideIonicAngular({ animated: false }),
      { provide: ScreenReaderService, useValue: services.screenReader },
      { provide: StatusBarService, useValue: services.statusBar },
      ...(routerOutlet ? [{ provide: IonRouterOutlet, useValue: routerOutlet }] : []),
    ],
  });
  return services;
}

function createPage(
  inputs: Record<string, unknown>,
  services = createServices(),
  routerOutlet?: { canGoBack: ReturnType<typeof vi.fn> },
): { fixture: ComponentFixture<UIPage>; services: typeof services; root: ShadowRoot } {
  configurePage(services, routerOutlet);
  const fixture = TestBed.createComponent(UIPage);
  setInputs(fixture, inputs);
  fixture.detectChanges();
  return { fixture, services, root: fixture.nativeElement.shadowRoot as ShadowRoot };
}

async function flush(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe('UIPage', () => {
  beforeEach(() => {
    vi.spyOn(IonContent.prototype, 'getScrollElement').mockResolvedValue(
      document.createElement('div'),
    );
  });

  describe('input validation', () => {
    it.each([
      [{}, '[UIPage] screenReaderTitle is required when hasHeader is false.'],
      [
        { screenReaderTitle: '   ' },
        '[UIPage] screenReaderTitle is required when hasHeader is false.',
      ],
      [{ hasHeader: true }, '[UIPage] A title or screenReaderTitle is required.'],
      [{ hasHeader: true, title: ' ' }, '[UIPage] A title or screenReaderTitle is required.'],
      [{ hasHeader: true, title: 'Title', headerType: 'step' }, 'headerStep is required'],
      [
        {
          hasHeader: true,
          title: 'Title',
          headerType: 'step',
          headerStep: { ...validStep, label: ' ' },
        },
        'headerStep.label is required',
      ],
      [
        {
          hasHeader: true,
          title: 'Title',
          headerType: 'step',
          headerStep: { ...validStep, ariaLabel: '' },
        },
        'headerStep.ariaLabel is required',
      ],
      [
        {
          hasHeader: true,
          title: 'Title',
          headerType: 'step',
          headerStep: { ...validStep, totalSteps: 0 },
        },
        'headerStep.totalSteps must be a positive integer',
      ],
      [
        {
          hasHeader: true,
          title: 'Title',
          headerType: 'step',
          headerStep: { ...validStep, totalSteps: 2.5 },
        },
        'headerStep.totalSteps must be a positive integer',
      ],
      [
        {
          hasHeader: true,
          title: 'Title',
          headerType: 'step',
          headerStep: { ...validStep, currentStep: 0 },
        },
        'headerStep.currentStep must be an integer',
      ],
      [
        {
          hasHeader: true,
          title: 'Title',
          headerType: 'step',
          headerStep: { ...validStep, currentStep: 2.5 },
        },
        'headerStep.currentStep must be an integer',
      ],
      [
        {
          hasHeader: true,
          title: 'Title',
          headerType: 'step',
          headerStep: { ...validStep, currentStep: 5 },
        },
        'headerStep.currentStep must be an integer',
      ],
    ])('rejects invalid configuration %#', (inputs, message) => {
      configurePage();
      const fixture = TestBed.createComponent(UIPage);
      setInputs(fixture, inputs);
      expect(() => fixture.detectChanges()).toThrow(message);
    });

    it('allows a screen-reader-only title with or without a visible header title', () => {
      const { fixture, root } = createPage({
        hasHeader: true,
        screenReaderTitle: 'Accessible only',
      });
      expect(root.querySelector('ion-title')).toBeNull();
      expect(root.querySelector('h1.screen-reader-only')?.textContent).toBe('Accessible only');
      fixture.destroy();
    });
  });

  it('renders a visible title while using screenReaderTitle as its accessible name', () => {
    const { root } = createPage({
      hasHeader: true,
      title: 'Short title',
      screenReaderTitle: 'Full page title',
    });
    const title = root.querySelector('ion-title span')!;
    expect(title.textContent).toBe('Short title');
    expect(title.getAttribute('role')).toBe('heading');
    expect(title.getAttribute('aria-level')).toBe('1');
    expect(title.getAttribute('aria-label')).toBe('Full page title');
    expect(title.getAttribute('tabindex')).toBe('-1');
    expect(root.querySelector('h1.screen-reader-only')).toBeNull();
  });

  it('forwards page, header, content and back-button configuration', () => {
    const { fixture, root } = createPage({
      hasHeader: true,
      hasFooter: true,
      title: 'Title',
      background: 'yellow',
      translucent: true,
      forceOverscroll: true,
      backButtonDefaultHref: '/home',
    });
    const header = root.querySelector('ion-header')!;
    const content = root.querySelector('ion-content')!;
    const back = root.querySelector('ion-back-button')!;
    expect(header.translucent).toBe(true);
    expect(root.querySelector('ion-toolbar')?.classList).toContain('background-yellow');
    expect(content.forceOverscroll).toBe(true);
    expect(content.fullscreen).toBe(true);
    expect(content.scrollEvents).toBe(true);
    expect(back.defaultHref).toBe('/home');
    expect(back.text).toBe('');
    expect(back.icon).toBe(fixture.componentInstance.backButtonIcon);
    expect(fixture.nativeElement.classList.contains('no-header')).toBe(false);
    expect(fixture.nativeElement.classList.contains('no-footer')).toBe(false);
  });

  it('exposes safe computed defaults when no header and no footer are present', () => {
    const { fixture } = createPage({ screenReaderTitle: 'Page' });
    expect(fixture.componentInstance.headerStepValue()).toBe(0);
    expect(fixture.componentInstance.headerStepAriaLabel()).toBe('');
    expect(fixture.componentInstance.shouldObserveScroll()).toBe(false);
    expect(fixture.nativeElement.classList.contains('no-header')).toBe(true);
    expect(fixture.nativeElement.classList.contains('no-footer')).toBe(true);
  });

  it.each([
    ['white', 'default-grey', 'green'],
    ['tab', 'green', 'green'],
    ['green', 'white', 'white'],
    ['step', 'default-grey', 'green'],
  ])('maps %s header colors to title=%s and icon=%s', (headerType, titleColor, iconColor) => {
    const inputs: Record<string, unknown> = { hasHeader: true, title: 'Title', headerType };
    if (headerType === 'step') inputs['headerStep'] = validStep;
    const { fixture } = createPage(inputs);
    expect(fixture.componentInstance.ionicHeaderColor()).toBe(titleColor);
    expect(fixture.componentInstance.ionicHeaderIconColor()).toBe(iconColor);
  });

  it('renders and reactively updates a step header', () => {
    const { fixture, root } = createPage({
      hasHeader: true,
      title: 'Registration',
      headerType: 'step',
      headerStep: validStep,
    });
    expect(fixture.componentInstance.isStepHeader()).toBe(true);
    expect(fixture.componentInstance.headerStepValue()).toBe(0.5);
    expect(fixture.componentInstance.headerStepAriaLabel()).toBe('2 of 4');
    const progressHost = root.querySelector('ui-progress-bar') as HTMLElement;
    const progress = progressHost.shadowRoot!.querySelector('ion-progress-bar')!;
    expect(progress.value).toBe(0.5);
    expect(progress.getAttribute('aria-label')).toBe('Registration progress');
    expect(progress.getAttribute('aria-valuetext')).toBe('2 of 4');
    const stepTexts = (root.querySelector('ui-p') as HTMLElement).shadowRoot!.querySelectorAll(
      'ui-text',
    );
    expect((stepTexts[0] as HTMLElement).shadowRoot?.textContent).toContain('2');
    expect((stepTexts[1] as HTMLElement).shadowRoot?.textContent).toContain('of 4');
    setInputs(fixture, { headerStep: { ...validStep, currentStep: 4 } });
    fixture.detectChanges();
    expect(progress.value).toBe(1);
    expect(progress.getAttribute('aria-valuetext')).toBe('4 of 4');
  });

  it('enables condensed header only when it is safe for accessibility', () => {
    const services = createServices();
    const { fixture } = createPage(
      { hasHeader: true, title: 'Title', condensedHeader: true },
      services,
    );
    expect(fixture.componentInstance.isCondensedHeaderEnabled()).toBe(true);
    expect(fixture.componentInstance.hasCondensedHeader()).toBe(true);
    services.screenReader.screenState.set(true);
    expect(fixture.componentInstance.isCondensedHeaderEnabled()).toBe(false);
    services.screenReader.screenState.set(false);
    services.screenReader.screenStateKnown.set(false);
    expect(fixture.componentInstance.isCondensedHeaderEnabled()).toBe(false);
    services.screenReader.screenStateKnown.set(true);
    setInputs(fixture, { headerType: 'step', headerStep: validStep });
    fixture.detectChanges();
    expect(fixture.componentInstance.isCondensedHeaderEnabled()).toBe(false);
  });

  it('updates back-stack state on Ionic enter hooks', () => {
    const canGoBack = vi.fn().mockReturnValueOnce(false).mockReturnValue(true);
    const { fixture } = createPage({ screenReaderTitle: 'Page' }, createServices(), { canGoBack });
    fixture.componentInstance.ionViewWillEnter();
    expect(fixture.componentInstance.canGoBack()).toBe(false);
    fixture.componentInstance.ionViewDidEnter();
    expect(fixture.componentInstance.canGoBack()).toBe(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.classList.contains('can-go-back')).toBe(true);
  });

  it.each([
    [{ screenReaderTitle: 'Page' }, 'light'],
    [{ hasHeader: true, title: 'Title', headerType: 'white' }, 'light'],
    [{ hasHeader: true, title: 'Title', headerType: 'tab' }, 'light'],
    [{ hasHeader: true, title: 'Title', headerType: 'green' }, 'dark'],
    [{ hasHeader: true, title: 'Title', headerType: 'step', headerStep: validStep }, 'light'],
  ])('applies the %s status bar policy when entering', (inputs, expected) => {
    const services = createServices();
    const { fixture } = createPage(inputs, services);
    fixture.componentInstance.ionViewDidEnter();
    expect(services.statusBar.setStatusBarStyleLight).toHaveBeenCalledTimes(
      expected === 'light' ? 1 : 0,
    );
    expect(services.statusBar.setStatusBarStyleDark).toHaveBeenCalledTimes(
      expected === 'dark' ? 1 : 0,
    );
  });

  it('focuses the title on entry and cancels pending requests on re-entry, leave and destroy', () => {
    const cancelFirst = vi.fn();
    const cancelSecond = vi.fn();
    const services = createServices();
    services.screenReader.focus.mockReturnValueOnce(cancelFirst).mockReturnValueOnce(cancelSecond);
    const { fixture, root } = createPage({ hasHeader: true, title: 'Title' }, services);
    fixture.componentInstance.ionViewDidEnter();
    expect(services.screenReader.focus).toHaveBeenCalledWith(root.querySelector('ion-title span'));
    fixture.componentInstance.ionViewDidEnter();
    expect(cancelFirst).toHaveBeenCalledOnce();
    fixture.componentInstance.ionViewWillLeave();
    expect(cancelSecond).toHaveBeenCalledOnce();
    fixture.componentInstance.ionViewDidLeave();
    fixture.destroy();
  });

  it('handles an enter hook before the view title is available', () => {
    const services = createServices();
    configurePage(services);
    const fixture = TestBed.createComponent(UIPage);
    setInputs(fixture, { screenReaderTitle: 'Page' });
    expect(() => fixture.componentInstance.ionViewDidEnter()).not.toThrow();
    expect(services.screenReader.focus).not.toHaveBeenCalled();
    expect(services.statusBar.setStatusBarStyleLight).toHaveBeenCalledOnce();
  });

  it('registers the current page landmark and releases ownership on re-entry, leave and destroy', () => {
    const services = createServices();
    const unregister = vi.fn();
    const register = vi.fn((_target: () => HTMLElement | undefined) => unregister);
    services.screenReader.registerPageFocusTarget = register;
    const { fixture, root } = createPage({ hasHeader: true, title: 'Title' }, services);
    fixture.componentInstance.ionViewDidEnter();
    expect(register.mock.calls[0][0]()).toBe(root.querySelector('ion-title span'));
    fixture.componentInstance.ionViewDidEnter();
    expect(unregister).toHaveBeenCalledTimes(1);
    fixture.componentInstance.ionViewWillLeave();
    expect(unregister).toHaveBeenCalledTimes(2);
    fixture.componentInstance.ionViewDidEnter();
    fixture.destroy();
    expect(unregister).toHaveBeenCalledTimes(3);
  });

  it('executes configured header actions and forwards disabled state', () => {
    const callback = vi.fn();
    const { root } = createPage({
      hasHeader: true,
      title: 'Title',
      headerButtons: [
        { name: 'arrow-left', fill: 'no-fill', ariaLabel: 'Action', callback },
        {
          name: 'arrow-left',
          fill: 'no-fill',
          ariaLabel: 'Disabled',
          disabled: true,
          callback: vi.fn(),
        },
      ],
    });
    const buttons = root.querySelectorAll('ui-button');
    expect((buttons[1] as HTMLElement).shadowRoot!.querySelector('ion-button')!.disabled).toBe(
      true,
    );
    (buttons[0] as HTMLElement).click();
    expect(callback).toHaveBeenCalledOnce();
  });

  describe('scroll elevations', () => {
    it('adds and removes header/footer elevation according to scroll position', async () => {
      const { element, state } = createScrollable();
      vi.mocked(IonContent.prototype.getScrollElement).mockResolvedValue(element);
      const { fixture } = createPage({ hasHeader: true, title: 'Title', hasFooter: true });
      await flush();
      expect(fixture.componentInstance.isHeaderElevated()).toBe(false);
      expect(fixture.componentInstance.isFooterElevated()).toBe(true);
      state.scrollTop = 50;
      fixture.componentInstance.onContentScroll();
      expect(fixture.componentInstance.isHeaderElevated()).toBe(true);
      expect(fixture.componentInstance.isFooterElevated()).toBe(true);
      state.scrollTop = 200;
      fixture.componentInstance.onContentScroll();
      expect(fixture.componentInstance.isHeaderElevated()).toBe(true);
      expect(fixture.componentInstance.isFooterElevated()).toBe(false);
      state.scrollHeight = 100;
      state.scrollTop = 0;
      fixture.componentInstance.onContentScroll();
      expect(fixture.componentInstance.isHeaderElevated()).toBe(false);
      expect(fixture.componentInstance.isFooterElevated()).toBe(false);
    });

    it('keeps elevation off before the asynchronous scroll element is available', () => {
      const pending = new Promise<HTMLElement>(() => undefined);
      vi.mocked(IonContent.prototype.getScrollElement).mockReturnValue(pending);
      const { fixture } = createPage({ hasHeader: true, title: 'Title', hasFooter: true });
      fixture.componentInstance.isHeaderElevated.set(true);
      fixture.componentInstance.isFooterElevated.set(true);
      fixture.componentInstance.onContentScroll();
      expect(fixture.componentInstance.isHeaderElevated()).toBe(false);
      expect(fixture.componentInstance.isFooterElevated()).toBe(false);
    });

    it('observes both scroll viewport and content surface, then disconnects', async () => {
      const { element, state } = createScrollable();
      vi.mocked(IonContent.prototype.getScrollElement).mockResolvedValue(element);
      const observe = vi.fn();
      const disconnect = vi.fn();
      let notifyResize!: () => void;
      vi.stubGlobal(
        'ResizeObserver',
        class {
          constructor(callback: () => void) {
            notifyResize = callback;
          }
          observe = observe;
          disconnect = disconnect;
        },
      );
      const { fixture, root } = createPage({ screenReaderTitle: 'Page' });
      await flush();
      expect(observe).toHaveBeenCalledWith(element);
      expect(observe).toHaveBeenCalledWith(root.querySelector('.page-content-surface'));
      state.scrollTop = 10;
      notifyResize();
      expect(fixture.componentInstance.isHeaderElevated()).toBe(false);
      fixture.destroy();
      expect(disconnect).toHaveBeenCalledOnce();
    });

    it('stops initialization safely when the page is destroyed before content resolves', async () => {
      let resolveScroll!: (element: HTMLElement) => void;
      const pending = new Promise<HTMLElement>((resolve) => (resolveScroll = resolve));
      vi.mocked(IonContent.prototype.getScrollElement).mockReturnValue(pending);
      const { fixture } = createPage({ screenReaderTitle: 'Page' });
      fixture.destroy();
      resolveScroll(document.createElement('div'));
      await flush();
      expect(fixture.componentInstance.isHeaderElevated()).toBe(false);
      expect(fixture.componentInstance.isFooterElevated()).toBe(false);
    });
  });

  it.each([
    [PageHost, false, 'Question'],
    [FooterPageHost, false, 'Question'],
    [LegacyPageHost, true, 'Question'],
  ])('supports isolated and native-slot body projection', async (hostType, legacy, text) => {
    TestBed.configureTestingModule({
      imports: [hostType],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideIonicAngular({ animated: false }),
      ],
    });
    const fixture = TestBed.createComponent(hostType);
    fixture.detectChanges();
    const page = fixture.nativeElement.querySelector('ui-page') as HTMLElement;
    const root: ParentNode = legacy ? page : page.shadowRoot!;
    expect(root.querySelector('.body')?.textContent).toBe(text);
    expect(page.shadowRoot!.querySelector('slot') !== null).toBe(legacy);
    if (hostType !== PageHost) {
      expect(page.shadowRoot!.querySelector('ion-footer [footer]')?.textContent).toBe('Footer');
    }
    if (legacy) {
      expect((page.shadowRoot!.querySelector('slot') as HTMLSlotElement).assignedNodes()).toContain(
        page.querySelector('.body'),
      );
    }
    await flush();
  });

  it('binds Ionic lifecycle events to the routed wrapper, including through a shadow root', () => {
    const services = createServices();
    configurePage(services);
    const fixture = TestBed.createComponent(UIPage);
    setInputs(fixture, { screenReaderTitle: 'Page' });
    const nav = document.createElement('ion-nav');
    const routedView = document.createElement('section');
    const shadowHost = document.createElement('article');
    const nestedRoot = shadowHost.attachShadow({ mode: 'open' });
    nestedRoot.append(fixture.nativeElement);
    routedView.append(shadowHost);
    nav.append(routedView);
    document.body.append(nav);
    fixture.detectChanges();
    routedView.dispatchEvent(new CustomEvent('ionViewDidEnter'));
    expect(services.statusBar.setStatusBarStyleLight).toHaveBeenCalledOnce();
    fixture.destroy();
    nav.remove();
  });

  it('skips browser lifecycle binding on the server platform', () => {
    const services = createServices();
    TestBed.configureTestingModule({
      imports: [UIPage],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideIonicAngular({ animated: false }),
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: ScreenReaderService, useValue: services.screenReader },
        { provide: StatusBarService, useValue: services.statusBar },
      ],
    });
    const fixture = TestBed.createComponent(UIPage);
    setInputs(fixture, { screenReaderTitle: 'Server page' });
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});

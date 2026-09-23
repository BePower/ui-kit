import { Capacitor } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';
import { deferred } from '../../../../../testing/helpers';
import { ScreenReaderService } from './screen-reader.service';

const screenReaderMocks = vi.hoisted(() => ({ isEnabled: vi.fn(), addListener: vi.fn() }));

vi.mock('@capacitor/screen-reader', () => ({ ScreenReader: screenReaderMocks }));

const listenerHandle: PluginListenerHandle = { remove: vi.fn(async () => undefined) };

async function flush(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe('ScreenReaderService', () => {
  beforeEach(() => {
    screenReaderMocks.isEnabled.mockReset();
    screenReaderMocks.addListener.mockReset();
  });
  it('starts in a known disabled state and skips native observation on web', async () => {
    vi.spyOn(Capacitor, 'getPlatform').mockReturnValue('web');
    const service = new ScreenReaderService();
    expect(service.screenState()).toBe(false);
    expect(service.screenStateKnown()).toBe(true);
    expect(screenReaderMocks.isEnabled).not.toHaveBeenCalled();
    expect(screenReaderMocks.addListener).not.toHaveBeenCalled();

    const element = document.createElement('h1');
    const focus = vi.spyOn(element, 'focus');
    service.focus(element);
    await flush();
    expect(focus).not.toHaveBeenCalled();
  });

  it('loads the initial native state and follows stateChange events', async () => {
    vi.spyOn(Capacitor, 'getPlatform').mockReturnValue('ios');
    screenReaderMocks.isEnabled.mockResolvedValue({ value: true });
    let stateChange: ((event: { value: boolean }) => void) | undefined;
    screenReaderMocks.addListener.mockImplementation(
      (_event: string, listener: (event: { value: boolean }) => void) => {
        stateChange = listener;
        return Promise.resolve(listenerHandle);
      },
    );
    const service = new ScreenReaderService();
    expect(service.screenStateKnown()).toBe(false);
    await flush();
    expect(service.screenState()).toBe(true);
    expect(service.screenStateKnown()).toBe(true);
    stateChange?.({ value: false });
    expect(service.screenState()).toBe(false);
    expect(service.screenStateKnown()).toBe(true);
  });

  it('keeps a newer listener state when the initial request resolves late', async () => {
    vi.spyOn(Capacitor, 'getPlatform').mockReturnValue('android');
    const initial = deferred<{ value: boolean }>();
    screenReaderMocks.isEnabled.mockReturnValue(initial.promise);
    screenReaderMocks.addListener.mockImplementation(
      (_event: string, listener: (event: { value: boolean }) => void) => {
        listener({ value: true });
        return Promise.resolve(listenerHandle);
      },
    );
    const service = new ScreenReaderService();
    expect(service.screenState()).toBe(true);
    initial.resolve({ value: false });
    await flush();
    expect(service.screenState()).toBe(true);
  });

  it('does not mark state unknown when an obsolete initial request rejects', async () => {
    vi.spyOn(Capacitor, 'getPlatform').mockReturnValue('android');
    const initial = deferred<{ value: boolean }>();
    screenReaderMocks.isEnabled.mockReturnValue(initial.promise);
    screenReaderMocks.addListener.mockImplementation(
      (_event: string, listener: (event: { value: boolean }) => void) => {
        listener({ value: true });
        return Promise.resolve(listenerHandle);
      },
    );
    const service = new ScreenReaderService();
    initial.reject(new Error('stale failure'));
    await flush();
    expect(service.screenState()).toBe(true);
    expect(service.screenStateKnown()).toBe(true);
  });

  it('leaves the state unknown when initial native detection fails', async () => {
    vi.spyOn(Capacitor, 'getPlatform').mockReturnValue('ios');
    screenReaderMocks.isEnabled.mockRejectedValue(new Error('unavailable'));
    screenReaderMocks.addListener.mockResolvedValue(listenerHandle);
    const service = new ScreenReaderService();
    await flush();
    expect(service.screenState()).toBe(false);
    expect(service.screenStateKnown()).toBe(false);
  });

  it('continues using the initial state when listener registration fails', async () => {
    vi.spyOn(Capacitor, 'getPlatform').mockReturnValue('ios');
    screenReaderMocks.isEnabled.mockResolvedValue({ value: true });
    screenReaderMocks.addListener.mockRejectedValue(new Error('unavailable'));
    const service = new ScreenReaderService();
    await flush();
    expect(service.screenState()).toBe(true);
    expect(service.screenStateKnown()).toBe(true);
  });

  it('focuses a connected element without scrolling when screen reader is enabled', async () => {
    vi.spyOn(Capacitor, 'getPlatform').mockReturnValue('ios');
    screenReaderMocks.isEnabled.mockResolvedValue({ value: true });
    screenReaderMocks.addListener.mockResolvedValue(listenerHandle);
    const service = new ScreenReaderService();
    const element = document.createElement('h1');
    document.body.append(element);
    const focus = vi.spyOn(element, 'focus');
    service.focus(element);
    await flush();
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    element.remove();
  });

  it('focuses synchronously when accessibility focus is required by a modal', () => {
    vi.spyOn(Capacitor, 'getPlatform').mockReturnValue('web');
    const service = new ScreenReaderService();
    const element = document.createElement('h2');
    document.body.append(element);
    const focus = vi.spyOn(element, 'focus');

    service.focus(element, { onlyWhenEnabled: false });

    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(screenReaderMocks.isEnabled).not.toHaveBeenCalled();
    element.remove();
  });

  it.each([false, true])(
    'does not focus when cancellation=%s prevents the request',
    async (cancel) => {
      vi.spyOn(Capacitor, 'getPlatform').mockReturnValue('ios');
      const focusState = deferred<{ value: boolean }>();
      screenReaderMocks.isEnabled
        .mockResolvedValueOnce({ value: false })
        .mockReturnValueOnce(focusState.promise);
      screenReaderMocks.addListener.mockResolvedValue(listenerHandle);
      const service = new ScreenReaderService();
      const element = document.createElement('h1');
      if (cancel) document.body.append(element);
      const focus = vi.spyOn(element, 'focus');
      const cancelRequest = service.focus(element);
      if (cancel) cancelRequest();
      focusState.resolve({ value: true });
      await flush();
      expect(focus).not.toHaveBeenCalled();
      element.remove();
    },
  );

  it('does not focus when native state lookup fails', async () => {
    vi.spyOn(Capacitor, 'getPlatform').mockReturnValue('ios');
    screenReaderMocks.isEnabled.mockRejectedValue(new Error('unavailable'));
    screenReaderMocks.addListener.mockResolvedValue(listenerHandle);
    const service = new ScreenReaderService();
    const element = document.createElement('h1');
    document.body.append(element);
    const focus = vi.spyOn(element, 'focus');
    service.focus(element);
    await flush();
    expect(focus).not.toHaveBeenCalled();
    element.remove();
  });
});

describe('screen reader focus across overlay transitions', () => {
  function setup() {
    vi.spyOn(Capacitor, 'getPlatform').mockReturnValue('web');
    const frames = new Map<number, FrameRequestCallback>();
    let frameId = 0;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.set(++frameId, callback);
      return frameId;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      frames.delete(id);
    });
    const renderFrame = () => {
      const callbacks = Array.from(frames.values());
      frames.clear();
      callbacks.forEach((callback) => callback(0));
    };
    const host = document.createElement('div');
    document.body.append(host);
    const shadow = host.attachShadow({ mode: 'open' });
    const title = document.createElement('h1');
    title.tabIndex = -1;
    shadow.append(title);
    const service = new ScreenReaderService();
    return { host, shadow, title, service, renderFrame };
  }

  it('focuses the actual heading in Shadow DOM after the view has been revealed', () => {
    const { host, shadow, title, service, renderFrame } = setup();
    try {
      host.setAttribute('inert', '');
      service.focus(title, { onlyWhenEnabled: false, afterRender: true });
      expect(shadow.activeElement).toBeNull();
      host.removeAttribute('inert');
      renderFrame();
      expect(shadow.activeElement).toBeNull();
      renderFrame();
      expect(shadow.activeElement).toBe(title);
      expect(document.activeElement).toBe(host);
    } finally {
      host.remove();
    }
  });

  it('cancels a pending focus when the modal closes before the next render', () => {
    const { host, shadow, title, service, renderFrame } = setup();
    try {
      const cancel = service.focus(title, { onlyWhenEnabled: false, afterRender: true });
      renderFrame();
      cancel();
      renderFrame();
      expect(shadow.activeElement).toBeNull();
    } finally {
      host.remove();
    }
  });

  it('restores the current page, even if the page changed while the modal was open', () => {
    const { host, shadow, title, service, renderFrame } = setup();
    try {
      const oldTitle = document.createElement('h1');
      oldTitle.tabIndex = -1;
      shadow.append(oldTitle);
      const unregisterOldPage = service.registerPageFocusTarget(() => oldTitle);
      const unregisterCurrentPage = service.registerPageFocusTarget(() => title);
      unregisterOldPage();
      service.focusCurrentPage();
      renderFrame();
      renderFrame();
      expect(shadow.activeElement).toBe(title);
      unregisterCurrentPage();
      title.blur();
      service.focusCurrentPage();
      renderFrame();
      renderFrame();
      expect(shadow.activeElement).toBeNull();
    } finally {
      host.remove();
    }
  });

  it.each(['inert', 'hidden', 'aria-hidden'])('does not focus a page with %s', (attribute) => {
    const { host, shadow, title, service, renderFrame } = setup();
    try {
      service.registerPageFocusTarget(() => title);
      service.focusCurrentPage();
      host.setAttribute(attribute, 'true');
      renderFrame();
      renderFrame();
      expect(shadow.activeElement).toBeNull();
    } finally {
      host.remove();
    }
  });

  it('does not steal focus from a modal still open above the page', () => {
    const { host, shadow, title, service, renderFrame } = setup();
    const modal = document.createElement('ion-modal');
    Object.defineProperty(modal, 'presented', { value: true });
    document.body.append(modal);
    try {
      service.registerPageFocusTarget(() => title);
      service.focusCurrentPage();
      renderFrame();
      renderFrame();
      expect(shadow.activeElement).toBeNull();
    } finally {
      modal.remove();
      host.remove();
    }
  });

  it.each(['display: none', 'visibility: hidden'])(
    'skips a visually hidden ancestor: %s',
    (style) => {
      const { host, shadow, title, service } = setup();
      try {
        host.setAttribute('style', style);
        service.focus(title, { onlyWhenEnabled: false });
        expect(shadow.activeElement).toBeNull();
      } finally {
        host.remove();
      }
    },
  );

  it('returns a safe cancellation function without a registered page target', () => {
    const { host, service } = setup();
    try {
      expect(() => service.focusCurrentPage()()).not.toThrow();
      service.registerPageFocusTarget(() => undefined);
      expect(() => service.focusCurrentPage()()).not.toThrow();
    } finally {
      host.remove();
    }
  });

  it('allows focus only inside the highest active focus-trapping overlay', () => {
    const { host, shadow, title, service } = setup();
    const lower = document.createElement('ion-modal');
    const upper = document.createElement('ion-modal');
    Object.defineProperty(lower, 'presented', { value: true });
    Object.defineProperty(upper, 'presented', { value: true });
    lower.style.zIndex = '100';
    upper.style.zIndex = '200';
    document.body.append(upper, lower);
    try {
      lower.append(host);
      service.focus(title, { onlyWhenEnabled: false });
      expect(shadow.activeElement).toBeNull();
      upper.append(host);
      service.focus(title, { onlyWhenEnabled: false });
      expect(shadow.activeElement).toBe(title);
    } finally {
      host.remove();
      lower.remove();
      upper.remove();
    }
  });
});

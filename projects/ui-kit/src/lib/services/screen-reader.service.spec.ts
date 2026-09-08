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

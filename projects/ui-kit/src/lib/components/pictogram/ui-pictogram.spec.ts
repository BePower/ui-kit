import { TestBed } from '@angular/core/testing';
import { configureComponent, deferred, setInputs, shadow } from '../../../../../../testing/helpers';

const loaders = vi.hoisted(() => ({
  wallet: vi.fn<() => Promise<string>>(),
  alternate: vi.fn<() => Promise<string>>(),
}));

vi.mock('./pictogram-map', () => ({
  pictogramMap: {
    wallet: loaders.wallet,
    alternate: loaders.alternate,
  },
}));

import { UIPictogram } from './ui-pictogram';

async function flush(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe('UIPictogram', () => {
  beforeEach(() => {
    loaders.wallet.mockReset();
    loaders.alternate.mockReset();
    loaders.wallet.mockResolvedValue('data:image/svg+xml,wallet');
    loaders.alternate.mockResolvedValue('data:image/svg+xml,alternate');
  });

  it('requires a pictogram name', () => {
    configureComponent(UIPictogram);
    const fixture = TestBed.createComponent(UIPictogram);
    expect(() => fixture.detectChanges()).toThrow();
  });

  it('loads the requested asset and remains decorative', async () => {
    const pending = deferred<string>();
    loaders.wallet.mockReturnValueOnce(pending.promise);
    configureComponent(UIPictogram);
    const fixture = TestBed.createComponent(UIPictogram);
    setInputs(fixture, { name: 'wallet', size: 'm' });
    fixture.detectChanges();
    expect(shadow(fixture).querySelector('img')).toBeNull();
    pending.resolve('data:image/svg+xml,pictogram');
    await flush();
    fixture.detectChanges();
    const image = shadow(fixture).querySelector('img')!;
    expect(image.src).toBe('data:image/svg+xml,pictogram');
    expect(image.classList).toContain('size-m');
    expect(image.alt).toBe('');
    expect(image.getAttribute('aria-hidden')).toBe('true');
  });

  it('uses size m by default', async () => {
    configureComponent(UIPictogram);
    const fixture = TestBed.createComponent(UIPictogram);
    setInputs(fixture, { name: 'wallet' });
    fixture.detectChanges();
    await flush();
    fixture.detectChanges();
    expect(shadow(fixture).querySelector('img')?.classList).toContain('size-m');
  });

  it.each(['s', 'm', 'l'] as const)('applies semantic size %s to the same asset', async (size) => {
    configureComponent(UIPictogram);
    const fixture = TestBed.createComponent(UIPictogram);
    setInputs(fixture, { name: 'wallet', size });
    fixture.detectChanges();
    await flush();
    fixture.detectChanges();
    const image = shadow(fixture).querySelector('img')!;
    expect(image.classList).toContain(`size-${size}`);
    expect(image.src).toBe('data:image/svg+xml,wallet');
  });

  it('ignores a stale async response after the name changes', async () => {
    const first = deferred<string>();
    loaders.wallet.mockReturnValueOnce(first.promise);
    loaders.alternate.mockResolvedValueOnce('data:image/svg+xml,current');
    configureComponent(UIPictogram);
    const fixture = TestBed.createComponent(UIPictogram);
    setInputs(fixture, { name: 'wallet' });
    fixture.detectChanges();
    setInputs(fixture, { name: 'alternate' });
    fixture.detectChanges();
    await flush();
    fixture.detectChanges();
    expect(shadow(fixture).querySelector('img')?.src).toBe('data:image/svg+xml,current');
    first.resolve('data:image/svg+xml,stale');
    await flush();
    fixture.detectChanges();
    expect(shadow(fixture).querySelector('img')?.src).toBe('data:image/svg+xml,current');
  });

  it('reports unknown names without rendering a pictogram', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    configureComponent(UIPictogram);
    const fixture = TestBed.createComponent(UIPictogram);
    setInputs(fixture, { name: 'missing' });
    fixture.detectChanges();
    expect(error).toHaveBeenCalledWith('[UI PICTOGRAM] - pictogram not found, missing');
    expect(shadow(fixture).querySelector('img')).toBeNull();
  });

  it('reports loader failures and keeps the pictogram hidden', async () => {
    const failure = new Error('load failed');
    loaders.wallet.mockRejectedValueOnce(failure);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    configureComponent(UIPictogram);
    const fixture = TestBed.createComponent(UIPictogram);
    setInputs(fixture, { name: 'wallet' });
    fixture.detectChanges();
    await flush();
    expect(error).toHaveBeenCalledWith(
      '[UI PICTOGRAM] - failed to load pictogram, wallet',
      failure,
    );
    expect(shadow(fixture).querySelector('img')).toBeNull();
  });

  it('does not report a rejected request after the component is destroyed', async () => {
    const pending = deferred<string>();
    loaders.wallet.mockReturnValueOnce(pending.promise);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    configureComponent(UIPictogram);
    const fixture = TestBed.createComponent(UIPictogram);
    setInputs(fixture, { name: 'wallet' });
    fixture.detectChanges();
    fixture.destroy();
    pending.reject(new Error('late'));
    await flush();
    expect(error).not.toHaveBeenCalled();
  });
});

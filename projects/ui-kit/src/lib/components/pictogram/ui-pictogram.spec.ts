import { TestBed } from '@angular/core/testing';
import { configureComponent, deferred, setInputs, shadow } from '../../../../../../testing/helpers';

const loaders = vi.hoisted(() => ({
  placeholder: vi.fn<() => Promise<string>>(),
  alternate: vi.fn<() => Promise<string>>(),
}));

vi.mock('./pictogram-map', () => ({
  pictogramMap: {
    placeholder: loaders.placeholder,
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
    loaders.placeholder.mockReset();
    loaders.alternate.mockReset();
    loaders.placeholder.mockResolvedValue('data:image/svg+xml,placeholder');
    loaders.alternate.mockResolvedValue('data:image/svg+xml,alternate');
  });

  it('requires a pictogram name', () => {
    configureComponent(UIPictogram);
    const fixture = TestBed.createComponent(UIPictogram);
    expect(() => fixture.detectChanges()).toThrow();
  });

  it('loads the requested asset and remains decorative', async () => {
    const pending = deferred<string>();
    loaders.placeholder.mockReturnValueOnce(pending.promise);
    configureComponent(UIPictogram);
    const fixture = TestBed.createComponent(UIPictogram);
    setInputs(fixture, { name: 'placeholder', size: '96' });
    fixture.detectChanges();
    expect(shadow(fixture).querySelector('img')).toBeNull();
    pending.resolve('data:image/svg+xml,pictogram');
    await flush();
    fixture.detectChanges();
    const image = shadow(fixture).querySelector('img')!;
    expect(image.src).toBe('data:image/svg+xml,pictogram');
    expect(image.classList).toContain('size-96');
    expect(image.alt).toBe('');
    expect(image.getAttribute('aria-hidden')).toBe('true');
  });

  it('uses size 64 by default', async () => {
    configureComponent(UIPictogram);
    const fixture = TestBed.createComponent(UIPictogram);
    setInputs(fixture, { name: 'placeholder' });
    fixture.detectChanges();
    await flush();
    fixture.detectChanges();
    expect(shadow(fixture).querySelector('img')?.classList).toContain('size-64');
  });

  it('ignores a stale async response after the name changes', async () => {
    const first = deferred<string>();
    loaders.placeholder.mockReturnValueOnce(first.promise);
    loaders.alternate.mockResolvedValueOnce('data:image/svg+xml,current');
    configureComponent(UIPictogram);
    const fixture = TestBed.createComponent(UIPictogram);
    setInputs(fixture, { name: 'placeholder' });
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
    loaders.placeholder.mockRejectedValueOnce(failure);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    configureComponent(UIPictogram);
    const fixture = TestBed.createComponent(UIPictogram);
    setInputs(fixture, { name: 'placeholder' });
    fixture.detectChanges();
    await flush();
    expect(error).toHaveBeenCalledWith(
      '[UI PICTOGRAM] - failed to load pictogram, placeholder',
      failure,
    );
    expect(shadow(fixture).querySelector('img')).toBeNull();
  });

  it('does not report a rejected request after the component is destroyed', async () => {
    const pending = deferred<string>();
    loaders.placeholder.mockReturnValueOnce(pending.promise);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    configureComponent(UIPictogram);
    const fixture = TestBed.createComponent(UIPictogram);
    setInputs(fixture, { name: 'placeholder' });
    fixture.detectChanges();
    fixture.destroy();
    pending.reject(new Error('late'));
    await flush();
    expect(error).not.toHaveBeenCalled();
  });
});

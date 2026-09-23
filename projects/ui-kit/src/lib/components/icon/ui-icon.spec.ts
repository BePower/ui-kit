import { TestBed } from '@angular/core/testing';
import { configureComponent, deferred, setInputs, shadow } from '../../../../../../testing/helpers';

const loaders = vi.hoisted(() => ({
  fill: vi.fn<() => Promise<string>>(),
  noFill: vi.fn<() => Promise<string>>(),
}));

vi.mock('./icon-map', () => ({
  iconMap: {
    arrow: { fill: loaders.fill, 'no-fill': loaders.noFill },
    'arrow-left': { 'no-fill': loaders.noFill },
  },
}));

import { UIIcon } from './ui-icon';

async function flush(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe('UIIcon', () => {
  beforeEach(() => {
    loaders.fill.mockReset();
    loaders.noFill.mockReset();
    loaders.fill.mockResolvedValue('data:image/svg+xml,fill');
    loaders.noFill.mockResolvedValue('data:image/svg+xml,no-fill');
  });

  it('requires an icon name', () => {
    configureComponent(UIIcon);
    const fixture = TestBed.createComponent(UIIcon);
    expect(() => fixture.detectChanges()).toThrow();
  });

  it('loads the requested asset, hiding the icon until it resolves', async () => {
    const pending = deferred<string>();
    loaders.noFill.mockReturnValueOnce(pending.promise);
    configureComponent(UIIcon);
    const fixture = TestBed.createComponent(UIIcon);
    setInputs(fixture, { name: 'arrow', fill: 'no-fill', size: '32', color: 'green' });
    fixture.detectChanges();
    expect(shadow(fixture).querySelector('ion-icon')).toBeNull();
    pending.resolve('data:image/svg+xml,arrow');
    await flush();
    fixture.detectChanges();
    const icon = shadow(fixture).querySelector('ion-icon')!;
    expect(icon.src).toBe('data:image/svg+xml,arrow');
    expect(icon.color).toBe('green');
    expect(icon.classList).toContain('size-32');
    expect(icon.getAttribute('aria-hidden')).toBe('true');
  });

  it('ignores a stale async response after inputs change', async () => {
    const first = deferred<string>();
    loaders.fill.mockReturnValueOnce(first.promise);
    loaders.noFill.mockResolvedValueOnce('data:image/svg+xml,current');
    configureComponent(UIIcon);
    const fixture = TestBed.createComponent(UIIcon);
    setInputs(fixture, { name: 'arrow', fill: 'fill' });
    fixture.detectChanges();
    setInputs(fixture, { fill: 'no-fill' });
    fixture.detectChanges();
    await flush();
    fixture.detectChanges();
    expect(shadow(fixture).querySelector('ion-icon')?.src).toBe('data:image/svg+xml,current');
    first.resolve('data:image/svg+xml,stale');
    await flush();
    fixture.detectChanges();
    expect(shadow(fixture).querySelector('ion-icon')?.src).toBe('data:image/svg+xml,current');
  });

  it('reports unsupported variants without rendering an icon', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    configureComponent(UIIcon);
    const fixture = TestBed.createComponent(UIIcon);
    setInputs(fixture, { name: 'arrow-left', fill: 'fill' });
    fixture.detectChanges();
    expect(error).toHaveBeenCalledWith('[UI ICON] - icon not found, arrow-left fill');
    expect(shadow(fixture).querySelector('ion-icon')).toBeNull();
  });

  it('reports loader failures and keeps the icon hidden', async () => {
    const failure = new Error('network');
    loaders.fill.mockRejectedValueOnce(failure);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    configureComponent(UIIcon);
    const fixture = TestBed.createComponent(UIIcon);
    setInputs(fixture, { name: 'arrow', fill: 'fill' });
    fixture.detectChanges();
    await flush();
    expect(error).toHaveBeenCalledWith('[UI ICON] - failed to load icon, arrow fill', failure);
    expect(shadow(fixture).querySelector('ion-icon')).toBeNull();
  });

  it('does not report a rejected request after the component is destroyed', async () => {
    const pending = deferred<string>();
    loaders.fill.mockReturnValueOnce(pending.promise);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    configureComponent(UIIcon);
    const fixture = TestBed.createComponent(UIIcon);
    setInputs(fixture, { name: 'arrow', fill: 'fill' });
    fixture.detectChanges();
    fixture.destroy();
    pending.reject(new Error('late'));
    await flush();
    expect(error).not.toHaveBeenCalled();
  });
});

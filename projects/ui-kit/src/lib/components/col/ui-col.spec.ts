import { Component } from '@angular/core';
import { render, setInputs, shadow } from '../../../../../../testing/helpers';
import { UICol } from './ui-col';

@Component({ imports: [UICol], template: '<ui-col><span>Content</span></ui-col>' })
class ColHost {}

@Component({ imports: [UICol], template: '<ui-col legacyContent><span>Legacy</span></ui-col>' })
class LegacyColHost {}

describe('UICol', () => {
  it('defaults to start alignment, no spacing and no explicit size', () => {
    const fixture = render(UICol);
    const col = shadow(fixture).querySelector('ion-col')!;
    expect(col.classList).toContain('ion-display-flex');
    expect(col.classList).toContain('ion-align-items-start');
    expect(col.classList).toContain('ion-justify-content-start');
    expect(col.getAttribute('data-horizontal')).toBe('none');
    expect(col.size).toBeUndefined();
  });

  it.each(['start', 'center', 'end'])('applies align and justify value %s exclusively', (value) => {
    const fixture = render(UICol, { align: value, justify: value });
    const col = shadow(fixture).querySelector('ion-col')!;
    for (const candidate of ['start', 'center', 'end']) {
      expect(col.classList.contains(`ion-align-items-${candidate}`)).toBe(candidate === value);
      expect(col.classList.contains(`ion-justify-content-${candidate}`)).toBe(candidate === value);
    }
  });

  it.each([
    [6, '6'],
    ['12', '12'],
    ['auto', 'auto'],
  ])('normalizes size %j to %s', (size, expected) => {
    const fixture = render(UICol, { size, horizontal: 's' });
    const col = shadow(fixture).querySelector('ion-col')!;
    expect(col.size).toBe(expected);
    expect(col.getAttribute('data-horizontal')).toBe('s');
    setInputs(fixture, { size: 4 });
    fixture.detectChanges();
    expect(col.size).toBe('4');
  });

  it.each([
    [ColHost, false, 'Content'],
    [LegacyColHost, true, 'Legacy'],
  ])('supports isolated and native-slot projection', (hostType, legacy, text) => {
    const fixture = render(hostType);
    const host = fixture.nativeElement.querySelector('ui-col') as HTMLElement;
    const root: ParentNode = legacy ? host : host.shadowRoot!;
    const content = root.querySelector('span')!;
    expect(content.textContent).toBe(text);
    expect(host.shadowRoot!.querySelector('slot') !== null).toBe(legacy);
    if (legacy)
      expect((host.shadowRoot!.querySelector('slot') as HTMLSlotElement).assignedNodes()).toContain(
        content,
      );
  });
});

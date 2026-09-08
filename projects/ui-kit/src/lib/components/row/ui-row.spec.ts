import { Component } from '@angular/core';
import { render, setInputs, shadow } from '../../../../../../testing/helpers';
import { UIRow } from './ui-row';

@Component({ imports: [UIRow], template: '<ui-row><span>Content</span></ui-row>' })
class RowHost {}

@Component({ imports: [UIRow], template: '<ui-row legacyContent><span>Legacy</span></ui-row>' })
class LegacyRowHost {}

describe('UIRow', () => {
  it('exposes default and changing spacing tokens as data attributes', () => {
    const fixture = render(UIRow);
    const row = shadow(fixture).querySelector('ion-row')!;
    expect(row.getAttribute('data-top')).toBe('none');
    expect(row.getAttribute('data-bottom')).toBe('none');
    expect(row.getAttribute('data-gap')).toBe('none');
    setInputs(fixture, { top: 'l', bottom: 'm', gap: 'xxxl' });
    fixture.detectChanges();
    expect(row.getAttribute('data-top')).toBe('l');
    expect(row.getAttribute('data-bottom')).toBe('m');
    expect(row.getAttribute('data-gap')).toBe('xxxl');
  });

  it.each([
    [RowHost, false, 'Content'],
    [LegacyRowHost, true, 'Legacy'],
  ])('supports isolated and native-slot projection', (hostType, legacy, text) => {
    const fixture = render(hostType);
    const host = fixture.nativeElement.querySelector('ui-row') as HTMLElement;
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

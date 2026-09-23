import { Component } from '@angular/core';
import { render, setInputs, shadow } from '../../../../../../testing/helpers';
import { UIP } from './ui-p';

@Component({
  imports: [UIP],
  template: '<ui-p>Hello <strong>world</strong></ui-p>',
})
class ParagraphHost {}

describe('UIP', () => {
  it('projects text and inline markup into a semantic paragraph without Ionic wrappers', () => {
    const fixture = render(ParagraphHost);
    const root = fixture.nativeElement.querySelector('ui-p').shadowRoot as ShadowRoot;
    expect(root.querySelector('p')?.textContent).toContain('Hello world');
    expect(root.querySelector('p > strong')?.textContent).toBe('world');
    expect(root.querySelector('ion-text')).toBeNull();
    expect(root.querySelector('p')?.hasAttribute('aria-hidden')).toBe(false);
  });

  it.each([true, '', false, 'false'])(
    'coerces ariaHidden=%j and updates the semantic element',
    (ariaHidden) => {
      const fixture = render(UIP, { ariaHidden });
      const paragraph = shadow(fixture).querySelector('p')!;
      expect(paragraph.getAttribute('aria-hidden')).toBe(
        ariaHidden === true || ariaHidden === '' ? 'true' : null,
      );
      setInputs(fixture, { ariaHidden: false });
      fixture.detectChanges();
      expect(paragraph.hasAttribute('aria-hidden')).toBe(false);
    },
  );

  it.each(['start', 'center', 'end'] as const)('applies the %s text alignment', (align) => {
    const fixture = render(UIP, { align });
    const paragraph = shadow(fixture).querySelector('p')!;
    expect(paragraph.classList.contains(`align-${align}`)).toBe(true);
  });
});

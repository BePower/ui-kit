import { Component } from '@angular/core';
import { render, setInputs, shadow } from '../../../../../../testing/helpers';
import { UIText } from './ui-text';

@Component({ imports: [UIText], template: '<ui-text>Hello <strong>world</strong></ui-text>' })
class TextHost {}

describe('UIText', () => {
  it('defaults to inherited typography and default-grey without losing projected markup', () => {
    const fixture = render(TextHost);
    const host = fixture.nativeElement.querySelector('ui-text') as HTMLElement;
    expect(host.getAttribute('data-variant')).toBe('inherit');
    const text = host.shadowRoot!.querySelector('ion-text')!;
    expect(text.color).toBe('default-grey');
    expect(text.textContent).toBe('Hello world');
    expect(text.querySelector('strong')?.textContent).toBe('world');
  });

  it.each(['inherit', 'body-l', 'body-m', 'body-s', 'label-l', 'label-m', 'label-s'])(
    'exposes %s for styling and reactively forwards color',
    (variant) => {
      const fixture = render(UIText, { variant, color: 'green' });
      expect(fixture.nativeElement.getAttribute('data-variant')).toBe(variant);
      expect(shadow(fixture).querySelector('ion-text')!.color).toBe('green');
      setInputs(fixture, { variant: 'inherit', color: 'white' });
      fixture.detectChanges();
      expect(fixture.nativeElement.getAttribute('data-variant')).toBe('inherit');
      expect(shadow(fixture).querySelector('ion-text')!.color).toBe('white');
    },
  );
});

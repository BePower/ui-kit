import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { configureComponent, render, setInputs, shadow } from '../../../../../../testing/helpers';
import { UITitle } from './ui-title';

@Component({ imports: [UITitle], template: '<ui-title>Section <em>title</em></ui-title>' })
class TitleHost {}

describe('UITitle', () => {
  it('defaults to h2 with projected content and default-grey text', () => {
    const fixture = render(TitleHost);
    const root = fixture.nativeElement.querySelector('ui-title').shadowRoot as ShadowRoot;
    expect(root.querySelector('h2')?.textContent).toContain('Section title');
    expect(root.querySelector('h2 ion-text')?.getAttribute('mode')).toBe('ios');
    expect(root.querySelector('ion-text')!.color).toBe('default-grey');
    expect(root.querySelector('em')?.textContent).toBe('title');
  });

  it.each([['xl', 'h1'], ['l', 'h2'], ['m', 'h3'], ['s', 'h4']])(
    'maps size %s to %s and forwards color and a trimmed accessible name',
    (size, tag) => {
      const fixture = render(UITitle, { size, color: 'green', ariaLabel: '  Accessible title  ' });
      const heading = shadow(fixture).querySelector(tag)!;
      expect(heading.getAttribute('aria-label')).toBe('Accessible title');
      expect(heading.hasAttribute('aria-hidden')).toBe(false);
      expect(shadow(fixture).querySelector('ion-text')!.color).toBe('green');
      setInputs(fixture, { size: 's', ariaLabel: ' ' });
      fixture.detectChanges();
      expect(shadow(fixture).querySelector('h4')!.hasAttribute('aria-label')).toBe(false);
    },
  );

  it.each([undefined, '', '   '])('does not impose a redundant label (%j)', (ariaLabel) => {
    const fixture = render(UITitle, { ariaLabel });
    expect(shadow(fixture).querySelector('h2')!.hasAttribute('aria-label')).toBe(false);
  });

  it('coerces ariaHidden and updates the heading accessibility', () => {
    const fixture = render(UITitle, { ariaHidden: '' });
    expect(shadow(fixture).querySelector('h2')!.getAttribute('aria-hidden')).toBe('true');
    setInputs(fixture, { ariaHidden: 'false', ariaLabel: 'New title' });
    fixture.detectChanges();
    expect(shadow(fixture).querySelector('h2')!.hasAttribute('aria-hidden')).toBe(false);
    expect(shadow(fixture).querySelector('h2')!.getAttribute('aria-label')).toBe('New title');
  });

  it('rejects a hidden heading with a nonempty accessible label', () => {
    configureComponent(UITitle);
    const fixture = TestBed.createComponent(UITitle);
    setInputs(fixture, { ariaHidden: true, ariaLabel: 'Title' });
    expect(() => fixture.detectChanges()).toThrow('[UITitle] ariaLabel cannot be used');
  });
});

import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { configureComponent, render, setInputs, shadow } from '../../../../../../testing/helpers';
import { UIButton } from './ui-button';

@Component({
  imports: [UIButton],
  template: `<ui-button
    size="inline"
    variant="secondary"
    [disabled]="disabled"
    [ariaHidden]="hidden"
    (click)="clicked()"
    >Read <strong>more</strong></ui-button
  >`,
})
class InlineHost {
  disabled = false;
  hidden = false;
  clicked = vi.fn();
}

describe('UIButton', () => {
  it('defaults to a primary, solid button and forwards its accessible name', () => {
    const fixture = render(UIButton, { ariaLabel: 'Continue' });
    const button = shadow(fixture).querySelector('ion-button')!;
    expect(button.color).toBe('primary');
    expect(button.fill).toBe('solid');
    expect(button.disabled).toBe(false);
    expect(button.getAttribute('aria-label')).toBe('Continue');
    expect(button.hasAttribute('aria-hidden')).toBe(false);
    expect(button.hasAttribute('tabindex')).toBe(false);
    expect(fixture.nativeElement.classList.contains('primary')).toBe(true);
  });

  it.each([
    ['primary', 'primary', 'solid'],
    ['secondary', 'default-grey', 'clear'],
    ['outlined', 'default-grey', 'outline'],
  ])('maps %s to Ionic color %s and fill %s', (variant, color, fill) => {
    const fixture = render(UIButton, { ariaLabel: 'Action', variant });
    const button = shadow(fixture).querySelector('ion-button')!;
    expect(button.color).toBe(color);
    expect(button.fill).toBe(fill);
    for (const name of ['primary', 'secondary', 'outlined']) {
      expect(fixture.nativeElement.classList.contains(name)).toBe(name === variant);
    }
    setInputs(fixture, { variant: 'primary' });
    fixture.detectChanges();
    expect(button.fill).toBe('solid');
  });

  it.each(['icon', 'min-icon'])('exposes the %s size and expand classes', (size) => {
    const fixture = render(UIButton, { ariaLabel: 'Action', size, expand: '' });
    const button = shadow(fixture).querySelector('ion-button')!;
    expect(fixture.nativeElement.classList.contains(size)).toBe(true);
    expect(fixture.nativeElement.classList.contains('expand')).toBe(true);
    expect(button.expand).toBe('block');
    setInputs(fixture, { size: 'default', expand: 'false' });
    fixture.detectChanges();
    expect(fixture.nativeElement.classList.contains(size)).toBe(false);
    expect(fixture.nativeElement.classList.contains('expand')).toBe(false);
    expect(button.expand).toBeUndefined();
  });

  it.each([undefined, '', '   '])('rejects an unlabelled regular button (%j)', (ariaLabel) => {
    configureComponent(UIButton);
    const fixture = TestBed.createComponent(UIButton);
    setInputs(fixture, { ariaLabel });
    expect(() => fixture.detectChanges()).toThrow('[UIButton] ariaLabel is required');
  });

  it('allows an unlabelled decorative button and removes it from keyboard navigation', () => {
    const fixture = render(UIButton, { ariaHidden: '' });
    const button = shadow(fixture).querySelector('ion-button')!;
    expect(button.getAttribute('aria-hidden')).toBe('true');
    expect(button.getAttribute('tabindex')).toBe('-1');
    expect(button.disabled).toBe(false);
    expect(button.hasAttribute('inert')).toBe(false);
  });

  it.each(['primary', 'outlined'])('shows a spinner and disables %s while loading', (variant) => {
    const fixture = render(UIButton, { ariaLabel: 'Action', variant, isLoading: '' });
    expect(shadow(fixture).querySelector('ion-spinner')).not.toBeNull();
    expect(shadow(fixture).querySelector('ion-button')!.disabled).toBe(true);
    expect(fixture.componentInstance.isDisabled()).toBe(true);
    setInputs(fixture, { isLoading: 'false' });
    fixture.detectChanges();
    expect(shadow(fixture).querySelector('ion-spinner')).toBeNull();
    expect(shadow(fixture).querySelector('ion-button')!.disabled).toBe(false);
  });

  it('ignores loading on secondary buttons but still respects disabled', () => {
    const fixture = render(UIButton, {
      ariaLabel: 'Action',
      variant: 'secondary',
      isLoading: true,
    });
    const button = shadow(fixture).querySelector('ion-button')!;
    expect(shadow(fixture).querySelector('ion-spinner')).toBeNull();
    expect(button.disabled).toBe(false);
    setInputs(fixture, { disabled: '' });
    fixture.detectChanges();
    expect(button.disabled).toBe(true);
  });

  it.each([
    [{ size: 'inline', variant: 'primary' }, 'can only be used'],
    [{ size: 'inline', variant: 'outlined' }, 'can only be used'],
    [{ size: 'inline', variant: 'secondary', expand: true }, 'cannot be used with expand'],
  ])('rejects incompatible inline inputs %j', (inputs, message) => {
    configureComponent(UIButton);
    const fixture = TestBed.createComponent(UIButton);
    setInputs(fixture, inputs);
    expect(() => fixture.detectChanges()).toThrow(message);
  });

  describe('inline interaction', () => {
    function setup(disabled = false, hidden = false) {
      configureComponent(InlineHost);
      const fixture = TestBed.createComponent(InlineHost);
      Object.assign(fixture.componentInstance, { disabled, hidden });
      fixture.detectChanges();
      const host = fixture.nativeElement.querySelector('ui-button') as HTMLElement;
      const action = host.shadowRoot!.querySelector('span')!;
      return { fixture, host, action, clicked: fixture.componentInstance.clicked };
    }

    it('uses projected content as the accessible name and keeps inline semantic markup', () => {
      const { action, host } = setup();
      expect(action.getAttribute('role')).toBe('button');
      expect(action.getAttribute('tabindex')).toBe('0');
      expect(action.hasAttribute('aria-label')).toBe(false);
      expect(action.textContent).toContain('Read more');
      expect(action.querySelector('strong')?.textContent).toBe('more');
      expect(host.classList.contains('inline')).toBe(true);
      expect(host.shadowRoot!.querySelector('ion-button')).toBeNull();
      expect(host.shadowRoot!.querySelector('ion-text')!.color).toBe('default-grey');
    });

    it.each([false, true])('delivers pointer clicks even when ariaHidden=%s', (hidden) => {
      const { action, clicked } = setup(false, hidden);
      action.click();
      expect(clicked).toHaveBeenCalledTimes(1);
      expect(action.hasAttribute('inert')).toBe(false);
      expect(action.getAttribute('aria-hidden')).toBe(hidden ? 'true' : null);
      expect(action.tabIndex).toBe(hidden ? -1 : 0);
    });

    it('blocks a disabled click before it reaches the consumer', () => {
      const { action, clicked } = setup(true);
      const event = new MouseEvent('click', { bubbles: true, composed: true, cancelable: true });
      expect(action.dispatchEvent(event)).toBe(false);
      expect(clicked).not.toHaveBeenCalled();
      expect(action.getAttribute('aria-disabled')).toBe('true');
      expect(action.tabIndex).toBe(-1);
    });

    it.each(['Enter', ' ', 'Spacebar', 'Escape'])(
      'supports the activation phase for keyboard key %j',
      (key) => {
        const { action, clicked } = setup();
        const down = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
        action.dispatchEvent(down);
        expect(clicked).toHaveBeenCalledTimes(key === 'Enter' ? 1 : 0);
        expect(down.defaultPrevented).toBe(key !== 'Escape');
        const up = new KeyboardEvent('keyup', { key, bubbles: true, cancelable: true });
        action.dispatchEvent(up);
        expect(clicked).toHaveBeenCalledTimes(key === 'Escape' ? 0 : 1);
        expect(up.defaultPrevented).toBe(key === ' ' || key === 'Spacebar');
      },
    );

    it.each(['Enter', ' ', 'Spacebar'])('does not activate a disabled action on %j', (key) => {
      const { action, clicked } = setup(true);
      action.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
      action.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
      expect(clicked).not.toHaveBeenCalled();
    });
  });
});

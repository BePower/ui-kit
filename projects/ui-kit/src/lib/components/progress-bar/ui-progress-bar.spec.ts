import { TestBed } from '@angular/core/testing';
import { configureComponent, render, setInputs, shadow } from '../../../../../../testing/helpers';
import { UIProgressBar } from './ui-progress-bar';

describe('UIProgressBar', () => {
  it('defaults to zero progress and exposes the accessible name', () => {
    const fixture = render(UIProgressBar, { ariaLabel: 'Registration' });
    const progress = shadow(fixture).querySelector('ion-progress-bar')!;
    expect(progress.value).toBe(0);
    expect(progress.color).toBe('tertiary');
    expect(progress.getAttribute('aria-label')).toBe('Registration');
    expect(progress.getAttribute('aria-hidden')).toBe('false');
    expect(progress.hasAttribute('aria-valuetext')).toBe(false);
  });

  it('forwards changing values and readable step descriptions', () => {
    const fixture = render(UIProgressBar, {
      ariaLabel: 'Registration',
      value: 0.5,
      ariaValueText: '2 of 4',
    });
    const progress = shadow(fixture).querySelector('ion-progress-bar')!;
    expect(progress.value).toBe(0.5);
    expect(progress.getAttribute('aria-valuetext')).toBe('2 of 4');
    setInputs(fixture, { value: 1, ariaValueText: '4 of 4', ariaLabel: 'Complete' });
    fixture.detectChanges();
    expect(progress.value).toBe(1);
    expect(progress.getAttribute('aria-valuetext')).toBe('4 of 4');
    expect(progress.getAttribute('aria-label')).toBe('Complete');
  });

  it.each([undefined, '', '   '])('rejects missing accessible labels (%j)', (ariaLabel) => {
    configureComponent(UIProgressBar);
    const fixture = TestBed.createComponent(UIProgressBar);
    setInputs(fixture, { ariaLabel });
    expect(() => fixture.detectChanges()).toThrow('[UIProgressBar] ariaLabel is required');
  });

  it('allows decorative progress without a label and coerces ariaHidden', () => {
    const fixture = render(UIProgressBar, { ariaHidden: '' });
    const progress = shadow(fixture).querySelector('ion-progress-bar')!;
    expect(progress.getAttribute('aria-hidden')).toBe('true');
    setInputs(fixture, { ariaHidden: 'false', ariaLabel: 'Progress' });
    fixture.detectChanges();
    expect(progress.getAttribute('aria-hidden')).toBe('false');
  });
});

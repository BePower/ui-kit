import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { configureComponent, render, setInputs, shadow } from '../../../../../../testing/helpers';
import { UIInputField } from './ui-input-field';

@Component({
  imports: [ReactiveFormsModule, UIInputField],
  template: `<ui-input-field label="Email" [formControl]="control"></ui-input-field>`,
})
class FormHost {
  control = new FormControl('hello@example.com');
}

describe('UIInputField', () => {
  it('renders an accessible labelled native input', () => {
    const fixture = render(UIInputField, {
      label: 'Email',
      placeholder: 'name@example.com',
      helperText: 'Use your work email',
      required: '',
    });
    const root = shadow(fixture);
    const input = root.querySelector('input')!;
    const label = root.querySelector('label')!;
    const message = root.querySelector('.message')!;

    expect(label.htmlFor).toBe(input.id);
    expect(input.placeholder).toBe('name@example.com');
    expect(input.required).toBe(true);
    expect(input.getAttribute('aria-describedby')).toBe(message.id);
    expect(message.textContent).toContain('Use your work email');
    expect(message.hasAttribute('role')).toBe(false);
  });

  it.each([
    [{ ariaLabel: 'Search' }, 'Search', null],
    [{ ariaLabelledby: 'external-label' }, null, 'external-label'],
  ])('accepts an accessible name without a visible label: %j', (inputs, label, labelledby) => {
    const fixture = render(UIInputField, inputs);
    const input = shadow(fixture).querySelector('input')!;
    expect(shadow(fixture).querySelector('label')).toBeNull();
    expect(input.getAttribute('aria-label')).toBe(label);
    expect(input.getAttribute('aria-labelledby')).toBe(labelledby);
  });

  it('rejects an input without an accessible name', () => {
    configureComponent(UIInputField);
    const fixture = TestBed.createComponent(UIInputField);
    expect(() => fixture.detectChanges()).toThrow('[UIInputField] label, ariaLabel');
  });

  it('updates value, focus state and the consumer model from native interaction', () => {
    const fixture = render(UIInputField, { label: 'Name' });
    const input = shadow(fixture).querySelector('input')!;

    input.dispatchEvent(new FocusEvent('focus'));
    fixture.detectChanges();
    expect(fixture.nativeElement.classList.contains('focused')).toBe(true);

    input.value = 'Ada';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe('Ada');
    expect(fixture.nativeElement.classList.contains('filled')).toBe(true);

    input.dispatchEvent(new FocusEvent('blur'));
    fixture.detectChanges();
    expect(fixture.nativeElement.classList.contains('focused')).toBe(false);
  });

  it('prioritizes error text and exposes an alert and invalid state', () => {
    const fixture = render(UIInputField, {
      label: 'Email',
      helperText: 'Helper',
      errorText: 'Invalid email',
    });
    const root = shadow(fixture);
    expect(root.querySelector('.message')!.textContent).toContain('Invalid email');
    expect(root.querySelector('.message')!.getAttribute('role')).toBe('alert');
    expect(root.querySelector('input')!.getAttribute('aria-invalid')).toBe('true');
    expect(fixture.nativeElement.classList.contains('error')).toBe(true);
  });

  it('supports error styling without requiring an error message', () => {
    const fixture = render(UIInputField, { label: 'Code', invalid: '' });
    expect(fixture.nativeElement.classList.contains('error')).toBe(true);
    expect(shadow(fixture).querySelector('input')!.getAttribute('aria-invalid')).toBe('true');
    expect(shadow(fixture).querySelector('.message')).toBeNull();
  });

  it('reacts to the disabled input', () => {
    const fixture = render(UIInputField, { label: 'Name', disabled: '' });
    expect(shadow(fixture).querySelector('input')!.disabled).toBe(true);
    expect(fixture.nativeElement.classList.contains('disabled')).toBe(true);
    setInputs(fixture, { disabled: 'false' });
    fixture.detectChanges();
    expect(shadow(fixture).querySelector('input')!.disabled).toBe(false);
  });

  it('integrates with Angular Forms for value, changes, touched and disabled state', () => {
    configureComponent(FormHost);
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    const field = fixture.nativeElement.querySelector('ui-input-field') as HTMLElement;
    const input = field.shadowRoot!.querySelector('input')!;

    expect(input.value).toBe('hello@example.com');
    input.value = 'new@example.com';
    input.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.control.value).toBe('new@example.com');

    input.dispatchEvent(new FocusEvent('blur'));
    expect(fixture.componentInstance.control.touched).toBe(true);

    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(input.disabled).toBe(true);
    fixture.componentInstance.control.setValue('disabled@example.com');
    fixture.detectChanges();
    expect(input.value).toBe('disabled@example.com');
  });
});

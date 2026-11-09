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

@Component({
  imports: [UIInputField],
  template: `
    <ui-input-field label="Search" [(value)]="value" (blurred)="onBlur($event)">
      <span slot="left">Search icon</span>
      <button slot="right" type="button">Clear</button>
    </ui-input-field>
  `,
})
class ModelHost {
  value = 'Initial';
  onBlur = vi.fn<(event: FocusEvent) => void>();
}

describe('UIInputField', () => {
  it('renders an accessible labelled native input', () => {
    const fixture = render(UIInputField, {
      label: 'Email',
      placeholder: 'name@example.com',
      bottomText: 'Use your work email',
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
      bottomText: 'Helper',
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

  it('forwards native input attributes and removes optional attributes when cleared', () => {
    const fixture = render(UIInputField, {
      label: 'Email',
      type: 'email',
      name: 'email',
      autocomplete: 'email',
      inputMode: 'email',
      readonly: '',
      required: '',
    });
    const input = shadow(fixture).querySelector('input')!;
    expect(input.type).toBe('email');
    expect(input.name).toBe('email');
    expect(input.autocomplete).toBe('email');
    expect(input.inputMode).toBe('email');
    expect(input.readOnly).toBe(true);
    expect(input.required).toBe(true);

    setInputs(fixture, {
      type: 'text',
      name: 'username',
      autocomplete: undefined,
      inputMode: undefined,
      readonly: 'false',
      required: 'false',
    });
    fixture.detectChanges();
    expect(input.type).toBe('text');
    expect(input.name).toBe('username');
    expect(input.hasAttribute('autocomplete')).toBe(false);
    expect(input.hasAttribute('inputmode')).toBe(false);
    expect(input.readOnly).toBe(false);
    expect(input.required).toBe(false);
  });

  it('keeps label and message associations unique across instances', () => {
    const first = render(UIInputField, { label: 'First', bottomText: 'First hint' });
    const second = TestBed.createComponent(UIInputField);
    setInputs(second, { label: 'Second', bottomText: 'Second hint' });
    second.detectChanges();
    const firstInput = shadow(first).querySelector('input')!;
    const secondInput = shadow(second).querySelector('input')!;
    expect(firstInput.id).not.toBe(secondInput.id);
    expect(firstInput.getAttribute('aria-describedby')).not.toBe(
      secondInput.getAttribute('aria-describedby'),
    );
    expect(shadow(second).querySelector('label')!.htmlFor).toBe(secondInput.id);
    expect(secondInput.getAttribute('aria-describedby')).toBe(
      shadow(second).querySelector('.message')!.id,
    );
  });

  it('rejects whitespace-only accessible names', () => {
    configureComponent(UIInputField);
    const fixture = TestBed.createComponent(UIInputField);
    setInputs(fixture, { label: '  ', ariaLabel: '\t', ariaLabelledby: ' ' });
    expect(() => fixture.detectChanges()).toThrow('[UIInputField] label, ariaLabel');
  });

  it('restores helper text after an error and removes message associations when cleared', () => {
    const fixture = render(UIInputField, {
      label: 'Email',
      bottomText: 'Helper',
      errorText: 'Invalid email',
    });
    const root = shadow(fixture);
    const input = root.querySelector('input')!;
    setInputs(fixture, { errorText: '', invalid: 'false' });
    fixture.detectChanges();
    expect(root.querySelector('.message')!.textContent).toContain('Helper');
    expect(root.querySelector('.message')!.hasAttribute('role')).toBe(false);
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    expect(fixture.nativeElement.classList.contains('error')).toBe(false);

    setInputs(fixture, { bottomText: '' });
    fixture.detectChanges();
    expect(root.querySelector('.message')).toBeNull();
    expect(input.hasAttribute('aria-describedby')).toBe(false);
  });

  it('keeps invalid state when error text is removed until invalid is cleared', () => {
    const fixture = render(UIInputField, { label: 'Code', invalid: '', errorText: 'Invalid' });
    setInputs(fixture, { errorText: undefined });
    fixture.detectChanges();
    expect(fixture.nativeElement.classList.contains('error')).toBe(true);
    expect(shadow(fixture).querySelector('input')!.getAttribute('aria-invalid')).toBe('true');
    setInputs(fixture, { invalid: false });
    fixture.detectChanges();
    expect(fixture.nativeElement.classList.contains('error')).toBe(false);
    expect(shadow(fixture).querySelector('input')!.hasAttribute('aria-invalid')).toBe(false);
  });

  it('binds values in both directions and emits the original blur event', () => {
    const fixture = render(ModelHost);
    const host = fixture.componentInstance;
    const field = fixture.nativeElement.querySelector('ui-input-field') as HTMLElement;
    const input = field.shadowRoot!.querySelector('input')!;
    expect(input.value).toBe('Initial');
    expect(field.classList.contains('filled')).toBe(true);
    input.value = 'Updated';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(host.value).toBe('Updated');

    host.value = '';
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(input.value).toBe('');
    expect(field.classList.contains('filled')).toBe(false);
    const event = new FocusEvent('blur');
    input.dispatchEvent(event);
    expect(host.onBlur).toHaveBeenCalledExactlyOnceWith(event);
  });

  it('projects left and right content around the native input', () => {
    const fixture = render(ModelHost);
    const field = fixture.nativeElement.querySelector('ui-input-field') as HTMLElement;
    const input = field.shadowRoot!.querySelector('input')!;
    expect(input.previousElementSibling?.getAttribute('slot')).toBe('left');
    expect(input.previousElementSibling?.textContent).toBe('Search icon');
    expect(input.nextElementSibling?.getAttribute('slot')).toBe('right');
    expect(input.nextElementSibling?.textContent).toBe('Clear');
  });

  it.each([
    [null, ''],
    [undefined, ''],
    [0, '0'],
    [42, '42'],
    [false, 'false'],
    ['Ada', 'Ada'],
  ])('normalizes a form value %j to %j without notifying onChange', (value, expected) => {
    const fixture = render(UIInputField, { label: 'Value' });
    const onChange = vi.fn();
    fixture.componentInstance.registerOnChange(onChange);
    fixture.componentInstance.writeValue(value);
    fixture.detectChanges();
    expect(shadow(fixture).querySelector('input')!.value).toBe(expected);
    expect(fixture.nativeElement.classList.contains('filled')).toBe(expected.length > 0);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('stays disabled while either the input or the form disables it', () => {
    const fixture = render(UIInputField, { label: 'Name', disabled: true });
    const input = shadow(fixture).querySelector('input')!;
    fixture.componentInstance.setDisabledState(true);
    setInputs(fixture, { disabled: false });
    fixture.detectChanges();
    expect(input.disabled).toBe(true);
    expect(fixture.nativeElement.classList.contains('disabled')).toBe(true);
    setInputs(fixture, { disabled: true });
    fixture.componentInstance.setDisabledState(false);
    fixture.detectChanges();
    expect(input.disabled).toBe(true);
    setInputs(fixture, { disabled: false });
    fixture.detectChanges();
    expect(input.disabled).toBe(false);
    expect(fixture.nativeElement.classList.contains('disabled')).toBe(false);
  });

  it('resets and re-enables a form control without reporting programmatic writes as changes', () => {
    const fixture = render(FormHost);
    const control = fixture.componentInstance.control;
    const field = fixture.nativeElement.querySelector('ui-input-field') as HTMLElement;
    const input = field.shadowRoot!.querySelector('input')!;
    const changes = vi.fn();
    const subscription = control.valueChanges.subscribe(changes);
    control.setValue('Changed', { emitEvent: false });
    fixture.detectChanges();
    expect(input.value).toBe('Changed');
    expect(changes).not.toHaveBeenCalled();
    control.disable();
    fixture.detectChanges();
    expect(input.disabled).toBe(true);
    control.enable();
    control.reset();
    fixture.detectChanges();
    expect(input.disabled).toBe(false);
    expect(field.classList.contains('disabled')).toBe(false);
    expect(input.value).toBe('');
    expect(field.classList.contains('filled')).toBe(false);
    expect(control.value).toBeNull();
    expect(control.untouched).toBe(true);
    expect(control.pristine).toBe(true);
    subscription.unsubscribe();
  });
});

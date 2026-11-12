import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { configureComponent, render, setInputs } from '../../../../../../testing/helpers';
import { UIRadioButton } from './ui-radio-button';
import { UIRadioButtonGroup } from './ui-radio-button-group';

@Component({
  imports: [ReactiveFormsModule, UIRadioButton, UIRadioButtonGroup],
  template: `
    <ui-radio-button-group ariaLabel="Charging method" [formControl]="control">
      <ui-radio-button value="fast" label="Fast charge"></ui-radio-button>
      <ui-radio-button
        value="standard"
        label="Standard charge"
        description="Use the normally available power"
      ></ui-radio-button>
    </ui-radio-button-group>
  `,
})
class FormHost {
  control = new FormControl<string | null>('standard');
}

@Component({
  imports: [UIRadioButton, UIRadioButtonGroup],
  template: `
    <ui-radio-button-group
      ariaLabel="Charging method"
      [(value)]="value"
      [disabled]="disabled"
      [invalid]="invalid"
      [errorText]="errorText"
    >
      <ui-radio-button value="fast" label="Fast charge"></ui-radio-button>
    </ui-radio-button-group>
  `,
})
class ModelHost {
  value: string | null = null;
  disabled = false;
  invalid = false;
  errorText: string | undefined;
}

describe('UIRadioButton', () => {
  it('renders a simple radio with the label as accessible name', () => {
    const fixture = render(UIRadioButton, { value: 'fast', label: 'Fast charge' });
    const radio = fixture.nativeElement.querySelector('ion-radio') as HTMLIonRadioElement;

    expect(radio.value).toBe('fast');
    expect(radio.getAttribute('aria-label')).toBe('Fast charge');
    expect(radio.getAttribute('aria-describedby')).toBe('');
    expect(fixture.nativeElement.querySelector('.label')?.textContent).toContain('Fast charge');
    expect(radio.alignment).toBe('center');
  });

  it('renders title and description with top alignment when description is present', () => {
    const fixture = render(UIRadioButton, {
      value: 'standard',
      label: 'Standard charge',
      description: 'Use the normally available power',
    });
    const radio = fixture.nativeElement.querySelector('ion-radio') as HTMLIonRadioElement;
    const description = fixture.nativeElement.querySelector('.description')!;

    expect(radio.alignment).toBe('start');
    expect(fixture.nativeElement.querySelector('.title')?.textContent).toContain('Standard charge');
    expect(radio.getAttribute('aria-describedby')).toBe(description.id);
  });

  it('merges error and disabled state with optional error message', () => {
    const fixture = render(UIRadioButton, {
      value: 'fast',
      label: 'Fast charge',
      invalid: true,
      disabled: true,
      errorText: 'Choose another method',
    });
    const host = fixture.nativeElement as HTMLElement;
    const radio = host.querySelector('ion-radio') as HTMLIonRadioElement;
    const error = host.querySelector('.error-message')!;

    expect(host.classList.contains('disabled')).toBe(true);
    expect(host.classList.contains('error')).toBe(true);
    expect(radio.disabled).toBe(true);
    expect(radio.getAttribute('aria-describedby')).toBe(error.id);
    expect(error.getAttribute('role')).toBe('alert');
  });

  it.each([
    [{ value: ' ', label: 'Label' }, 'value is required'],
    [{ value: 'value', label: ' ' }, 'label is required'],
    [{ value: 'value', label: 'Label', description: ' ' }, 'description cannot be blank'],
  ])('rejects invalid required content: %s', (inputs, message) => {
    configureComponent(UIRadioButton);
    const fixture = TestBed.createComponent(UIRadioButton);
    setInputs(fixture, inputs);
    expect(() => fixture.detectChanges()).toThrow(`[UIRadioButton] ${message}`);
  });

  it('propagates group state and keeps IDs unique', () => {
    const first = render(UIRadioButton, { value: 'fast', label: 'Fast charge' });
    const second = TestBed.createComponent(UIRadioButton);
    setInputs(second, { value: 'standard', label: 'Standard charge' });
    second.detectChanges();
    first.componentInstance.setGroupState(true, true);
    first.detectChanges();

    expect(first.componentInstance.isDisabled()).toBe(true);
    expect(first.componentInstance.hasError()).toBe(true);
    expect(first.componentInstance.descriptionId).not.toBe(second.componentInstance.descriptionId);
  });
});

describe('UIRadioButtonGroup', () => {
  it('keeps Ionic radios inside the real group', () => {
    configureComponent(FormHost);
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    const group = fixture.nativeElement.querySelector('ion-radio-group')!;

    expect(group.getAttribute('role')).toBe('radiogroup');
    expect(group.querySelectorAll('ion-radio')).toHaveLength(2);
    expect((group as HTMLIonRadioGroupElement).value).toBe('standard');
  });

  it('integrates with Angular Forms and propagates disabled state', () => {
    configureComponent(FormHost);
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector('ui-radio-button-group') as HTMLElement;
    const group = host.querySelector('ion-radio-group')!;

    group.dispatchEvent(new CustomEvent('ionChange', { detail: { value: 'fast' }, bubbles: true }));
    expect(fixture.componentInstance.control.value).toBe('fast');
    group.dispatchEvent(new CustomEvent('ionBlur', { bubbles: true }));
    expect(fixture.componentInstance.control.touched).toBe(true);

    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(host.classList.contains('disabled')).toBe(true);
    expect((host.querySelector('ion-radio') as HTMLIonRadioElement).disabled).toBe(true);
  });

  it('supports model binding and ignores changes while disabled', () => {
    configureComponent(ModelHost);
    const fixture = TestBed.createComponent(ModelHost);
    fixture.detectChanges();
    const group = fixture.nativeElement.querySelector('ion-radio-group')!;

    group.dispatchEvent(new CustomEvent('ionChange', { detail: { value: 'fast' }, bubbles: true }));
    expect(fixture.componentInstance.value).toBe('fast');
    fixture.componentInstance.disabled = true;
    fixture.detectChanges();
    group.dispatchEvent(
      new CustomEvent('ionChange', { detail: { value: 'standard' }, bubbles: true }),
    );
    expect(fixture.componentInstance.value).toBe('fast');
  });

  it('propagates invalid state and error association', () => {
    configureComponent(ModelHost);
    const fixture = TestBed.createComponent(ModelHost);
    fixture.componentInstance.invalid = true;
    fixture.componentInstance.errorText = 'Choose a method';
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector('ui-radio-button-group') as HTMLElement;
    const fieldset = host.querySelector('fieldset')!;
    const error = host.querySelector('.group-error')!;

    expect(host.classList.contains('error')).toBe(true);
    expect(fieldset.getAttribute('aria-invalid')).toBe('true');
    expect(fieldset.getAttribute('aria-describedby')).toBe(error.id);
  });

  it('supports programmatic values and null changes', () => {
    const fixture = render(UIRadioButtonGroup, { ariaLabel: 'Options' });
    const group = fixture.componentInstance;
    group.writeValue(42);
    expect(group.value()).toBe('42');
    group.writeValue(null);
    group.onGroupBlur();
    group.onIonChange(new CustomEvent('ionChange', { detail: { value: null } }));
    expect(group.value()).toBeNull();
  });

  it.each([
    [{ ariaLabel: ' ' }, 'ariaLabel is required'],
    [{ ariaLabel: 'Options', name: ' ' }, 'name cannot be blank'],
  ])('rejects invalid group naming: %s', (inputs, message) => {
    configureComponent(UIRadioButtonGroup);
    const fixture = TestBed.createComponent(UIRadioButtonGroup);
    setInputs(fixture, inputs);
    expect(() => fixture.detectChanges()).toThrow(`[UIRadioButtonGroup] ${message}`);
  });
});

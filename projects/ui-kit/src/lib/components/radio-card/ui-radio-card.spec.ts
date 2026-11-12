import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { configureComponent, render, setInputs } from '../../../../../../testing/helpers';
import { UIRadioCard } from './ui-radio-card';
import { UIRadioCardGroup } from './ui-radio-card-group';

@Component({
  imports: [ReactiveFormsModule, UIRadioCard, UIRadioCardGroup],
  template: `
    <ui-radio-card-group ariaLabel="Charging method" [formControl]="control">
      <ui-radio-card
        value="fast"
        title="Fast charge"
        description="Finish charging sooner"
      ></ui-radio-card>
      <ui-radio-card
        value="standard"
        title="Standard charge"
        description="Use the normally available power"
      ></ui-radio-card>
    </ui-radio-card-group>
  `,
})
class FormHost {
  control = new FormControl<string | null>('standard');
}

@Component({
  imports: [UIRadioCard, UIRadioCardGroup],
  template: `
    <ui-radio-card-group
      ariaLabel="Charging method"
      [(value)]="value"
      [disabled]="disabled"
      [invalid]="invalid"
      [errorText]="errorText"
    >
      <ui-radio-card
        value="fast"
        title="Fast charge"
        description="Finish charging sooner"
      ></ui-radio-card>
    </ui-radio-card-group>
  `,
})
class ModelHost {
  value: string | null = null;
  disabled = false;
  invalid = false;
  errorText: string | undefined;
}

describe('UIRadioCard', () => {
  const inputs = {
    value: 'fast',
    title: 'Fast charge',
    description: 'Finish charging sooner',
  };

  it('supports a title-only content variant', () => {
    const fixture = render(UIRadioCard, { value: 'fast', title: 'Fast charge' });
    const radio = fixture.nativeElement.querySelector('ion-radio')!;

    expect(fixture.nativeElement.querySelector('.title')?.textContent).toContain('Fast charge');
    expect(fixture.nativeElement.querySelector('.description')).toBeNull();
    expect(radio.getAttribute('aria-label')).toBe('Fast charge');
    expect(radio.getAttribute('aria-describedby')).toBe('');
  });

  it('supports a description-only content variant', () => {
    const fixture = render(UIRadioCard, {
      value: 'fast',
      description: 'Finish charging sooner',
    });
    const radio = fixture.nativeElement.querySelector('ion-radio')!;
    const description = fixture.nativeElement.querySelector('.description')!;

    expect(fixture.nativeElement.querySelector('.title')).toBeNull();
    expect(radio.getAttribute('aria-label')).toBe('Finish charging sooner');
    expect(radio.getAttribute('aria-describedby')).toBe('');
    expect(description.textContent).toContain('Finish charging sooner');
  });

  it('renders one accessible Ionic radio with title and description', () => {
    const fixture = render(UIRadioCard, inputs);
    const radio = fixture.nativeElement.querySelector('ion-radio') as HTMLIonRadioElement;
    const title = fixture.nativeElement.querySelector('.title') as HTMLElement;
    const description = fixture.nativeElement.querySelector('.description') as HTMLElement;

    expect(radio.value).toBe('fast');
    expect(radio.getAttribute('aria-label')).toBe('Fast charge');
    expect(radio.getAttribute('aria-describedby')).toBe(description.id);
    expect(title.textContent).toContain('Fast charge');
    expect(description.textContent).toContain('Finish charging sooner');
    expect(radio.labelPlacement).toBe('end');
    expect(radio.alignment).toBe('center');
    expect(radio.justify).toBe('start');
  });

  it('associates optional error text and exposes the error state', () => {
    const fixture = render(UIRadioCard, { ...inputs, errorText: 'Choose another method' });
    const host = fixture.nativeElement as HTMLElement;
    const radio = host.querySelector('ion-radio')!;
    const description = host.querySelector('.description')!;
    const error = host.querySelector('.error-message')!;

    expect(host.classList.contains('error')).toBe(true);
    expect(radio.classList.contains('error')).toBe(true);
    expect(radio.getAttribute('aria-describedby')).toBe(`${description.id} ${error.id}`);
    expect(error.getAttribute('role')).toBe('alert');
  });

  it('merges local and group disabled/error states', () => {
    const fixture = render(UIRadioCard, inputs);
    const card = fixture.componentInstance;
    const host = fixture.nativeElement as HTMLElement;
    const radio = host.querySelector('ion-radio') as HTMLIonRadioElement;

    card.setGroupState(true, true);
    fixture.detectChanges();
    expect(card.isDisabled()).toBe(true);
    expect(card.hasError()).toBe(true);
    expect(host.classList.contains('disabled')).toBe(true);
    expect(host.classList.contains('error')).toBe(true);
    expect(radio.disabled).toBe(true);

    card.setGroupState(false, false);
    setInputs(fixture, { disabled: '', invalid: '' });
    fixture.detectChanges();
    expect(card.isDisabled()).toBe(true);
    expect(card.hasError()).toBe(true);
  });

  it.each([
    [{ value: ' ', title: 'Title', description: 'Description' }, 'value is required'],
    [
      { value: 'value', title: undefined, description: undefined },
      'title or description is required',
    ],
    [{ value: 'value', title: '  ', description: 'Description' }, 'title cannot be blank'],
    [{ value: 'value', title: 'Title', description: '\t' }, 'description cannot be blank'],
  ])('rejects invalid content: %s', (invalidInputs, message) => {
    configureComponent(UIRadioCard);
    const fixture = TestBed.createComponent(UIRadioCard);
    setInputs(fixture, invalidInputs);
    if (message === 'title or description is required') {
      expect(fixture.componentInstance.accessibleName()).toBe('');
    }
    expect(() => fixture.detectChanges()).toThrow(`[UIRadioCard] ${message}`);
  });

  it('keeps description IDs unique across instances', () => {
    const first = render(UIRadioCard, inputs);
    const second = TestBed.createComponent(UIRadioCard);
    setInputs(second, { ...inputs, value: 'standard' });
    second.detectChanges();
    expect(first.componentInstance.descriptionId).not.toBe(second.componentInstance.descriptionId);
  });
});

describe('UIRadioCardGroup', () => {
  it('keeps Ionic radios as DOM descendants of the real Ionic group', () => {
    configureComponent(FormHost);
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    const group = fixture.nativeElement.querySelector('ion-radio-group')!;

    expect(group.getAttribute('role')).toBe('radiogroup');
    expect(group.querySelectorAll('ion-radio')).toHaveLength(2);
    expect((group as HTMLIonRadioGroupElement).value).toBe('standard');
  });

  it('integrates with Angular Forms for value, touched and disabled state', () => {
    configureComponent(FormHost);
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector('ui-radio-card-group') as HTMLElement;
    const group = host.querySelector('ion-radio-group')!;
    const cards = host.querySelectorAll('ui-radio-card');

    group.dispatchEvent(new CustomEvent('ionChange', { detail: { value: 'fast' }, bubbles: true }));
    expect(fixture.componentInstance.control.value).toBe('fast');

    group.dispatchEvent(new CustomEvent('ionBlur', { bubbles: true }));
    expect(fixture.componentInstance.control.touched).toBe(true);

    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(host.classList.contains('disabled')).toBe(true);
    for (const card of cards) {
      expect((card.querySelector('ion-radio') as HTMLIonRadioElement).disabled).toBe(true);
    }
  });

  it('supports two-way value binding and ignores changes while disabled', () => {
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

  it('propagates group invalid state and associates the error message', () => {
    configureComponent(ModelHost);
    const fixture = TestBed.createComponent(ModelHost);
    fixture.componentInstance.invalid = true;
    fixture.componentInstance.errorText = 'Choose a charging method';
    fixture.detectChanges();
    const host = fixture.nativeElement.querySelector('ui-radio-card-group') as HTMLElement;
    const fieldset = host.querySelector('fieldset')!;
    const error = host.querySelector('.group-error')!;
    const card = host.querySelector('ui-radio-card')!;

    expect(host.classList.contains('error')).toBe(true);
    expect(fieldset.getAttribute('aria-invalid')).toBe('true');
    expect(fieldset.getAttribute('aria-describedby')).toBe(error.id);
    expect(error.getAttribute('role')).toBe('alert');
    expect(card.classList.contains('error')).toBe(true);
  });

  it('accepts programmatic and user-committed null and string values', () => {
    const fixture = render(UIRadioCardGroup, { ariaLabel: 'Options' });
    const group = fixture.componentInstance;
    group.writeValue(42);
    expect(group.value()).toBe('42');
    group.writeValue(null);
    expect(group.value()).toBeNull();

    group.onGroupBlur();
    group.onIonChange(new CustomEvent('ionChange', { detail: { value: null } }));
    expect(group.value()).toBeNull();
  });

  it.each([
    [{ ariaLabel: ' ' }, 'ariaLabel is required'],
    [{ ariaLabel: 'Options', name: ' ' }, 'name cannot be blank'],
  ])('rejects invalid group naming: %s', (inputs, message) => {
    configureComponent(UIRadioCardGroup);
    const fixture = TestBed.createComponent(UIRadioCardGroup);
    setInputs(fixture, inputs);
    expect(() => fixture.detectChanges()).toThrow(`[UIRadioCardGroup] ${message}`);
  });
});

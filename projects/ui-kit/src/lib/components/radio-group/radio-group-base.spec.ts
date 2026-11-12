import { render } from '../../../../../../testing/helpers';
import { UIRadioButtonGroup } from '../radio-button/ui-radio-button-group';
import { UIRadioCardGroup } from '../radio-card/ui-radio-card-group';
import type { RadioGroupBase } from './radio-group-base';

describe.each([UIRadioButtonGroup, UIRadioCardGroup])('%s value normalization', (component) => {
  it.each([
    ['fast', 'fast'],
    ['', ''],
    [42, '42'],
    [false, 'false'],
    [12n, '12'],
    [null, null],
    [undefined, null],
  ])('normalizes %s consistently for forms and Ionic events', (value, expected) => {
    const group = render<RadioGroupBase>(component, { ariaLabel: 'Options' }).componentInstance;
    const changed = vi.fn();
    group.registerOnChange(changed);
    group.writeValue(value);
    expect(group.value()).toBe(expected);
    expect(changed).not.toHaveBeenCalled();
    group.onIonChange(new CustomEvent('ionChange', { detail: { value } }));
    expect(group.value()).toBe(expected);
    expect(changed).toHaveBeenCalledExactlyOnceWith(expected);
  });

  it.each([{}, ['fast'], Symbol('fast'), () => 'fast'])(
    'rejects non-scalar values without changing selection: %s',
    (value) => {
      const group = render<RadioGroupBase>(component, { ariaLabel: 'Options' }).componentInstance;
      group.writeValue('fast');
      const changed = vi.fn();
      group.registerOnChange(changed);
      expect(() => group.writeValue(value)).toThrow(TypeError);
      expect(() => group.onIonChange(new CustomEvent('ionChange', { detail: { value } }))).toThrow(
        TypeError,
      );
      expect(group.value()).toBe('fast');
      expect(changed).not.toHaveBeenCalled();
    },
  );
});

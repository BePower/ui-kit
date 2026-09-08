import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { configureComponent, render, setInputs, shadow } from '../../../../../../testing/helpers';
import { UIGrid } from './ui-grid';

@Component({ imports: [UIGrid], template: '<ui-grid><button>Content</button></ui-grid>' })
class GridHost {}

@Component({
  imports: [UIGrid],
  template: '<ui-grid legacyContent><button>Legacy</button></ui-grid>',
})
class LegacyGridHost {}

describe('UIGrid', () => {
  it('forwards its layout inputs to ion-grid and updates them', () => {
    const fixture = render(UIGrid);
    const grid = shadow(fixture).querySelector('ion-grid')!;
    expect(grid.getAttribute('data-horizontal')).toBe('xs');
    expect(grid.fixed).toBe(false);
    setInputs(fixture, { horizontal: 'm', fixed: '' });
    fixture.detectChanges();
    expect(grid.getAttribute('data-horizontal')).toBe('m');
    expect(grid.fixed).toBe(true);
    setInputs(fixture, { fixed: 'false' });
    fixture.detectChanges();
    expect(grid.fixed).toBe(false);
  });

  it('isolates projected content in its shadow root by default', () => {
    const fixture = render(GridHost);
    const host = fixture.nativeElement.querySelector('ui-grid') as HTMLElement;
    expect(host.querySelector('button')).toBeNull();
    expect(host.shadowRoot!.querySelector('ion-grid > button')?.textContent).toBe('Content');
    expect(host.shadowRoot!.querySelector('slot')).toBeNull();
  });

  it('keeps legacy content in light DOM and assigns it to a native slot', () => {
    const fixture = render(LegacyGridHost);
    const host = fixture.nativeElement.querySelector('ui-grid') as HTMLElement;
    const button = host.querySelector('button')!;
    const slot = host.shadowRoot!.querySelector('slot') as HTMLSlotElement;
    expect(button.textContent).toBe('Legacy');
    expect(slot.assignedNodes()).toContain(button);
  });

  it('reads legacyContent only at initialization', () => {
    configureComponent(UIGrid);
    const fixture = TestBed.createComponent(UIGrid);
    setInputs(fixture, { legacyContent: false });
    fixture.detectChanges();
    expect(shadow(fixture).querySelector('slot')).toBeNull();
    setInputs(fixture, { legacyContent: true });
    fixture.detectChanges();
    expect(shadow(fixture).querySelector('slot')).toBeNull();
  });
});

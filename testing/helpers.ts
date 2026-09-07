import { type Type, provideZonelessChangeDetection } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';

export function configureComponent<T>(component: Type<T>): void {
  TestBed.configureTestingModule({
    imports: [component],
    providers: [
      provideZonelessChangeDetection(),
      provideRouter([]),
      provideIonicAngular({ animated: false }),
    ],
  });
}

export function setInputs<T>(fixture: ComponentFixture<T>, inputs: Record<string, unknown>): void {
  for (const [name, value] of Object.entries(inputs)) {
    fixture.componentRef.setInput(name, value);
  }
}

export function render<T>(component: Type<T>, inputs: Record<string, unknown> = {}): ComponentFixture<T> {
  configureComponent(component);
  const fixture = TestBed.createComponent(component);
  setInputs(fixture, inputs);
  fixture.detectChanges();
  return fixture;
}

export function shadow<T>(fixture: ComponentFixture<T>): ShadowRoot {
  return (fixture.nativeElement as HTMLElement).shadowRoot!;
}

export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

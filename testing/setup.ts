import '@angular/compiler';

import { TestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: true },
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true,
});

beforeEach(() => {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

afterEach(() => {
  TestBed.resetTestingModule();
});

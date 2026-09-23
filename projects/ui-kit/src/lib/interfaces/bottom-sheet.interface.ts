import type { Injector, Type } from '@angular/core';

export interface UIBottomSheetOptions<TContent> {
  component: Type<TContent>;
  /** Properties assigned by Ionic to the content component instance. */
  componentProps?: Record<string, unknown>;
  /** Localized accessible label for the close button. */
  closeLabel: string;
  backdropDismiss?: boolean;
  /** Pass the consumer injector when content needs page-scoped providers. */
  injector?: Injector;
}

export interface UIBottomSheetResult<TResult> {
  data?: TResult;
  role?: string;
}

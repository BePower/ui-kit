import type { UIBottomSheetResult } from '../interfaces/bottom-sheet.interface';
import type { UIBottomSheetRef } from './bottom-sheet-ref';

/** Controls one presented bottom sheet from outside its content component. */
export class UIBottomSheetHandle<TResult = unknown> {
  /** @internal Created by UIBottomSheetService. */
  constructor(
    private readonly ref: UIBottomSheetRef<TResult>,
    private readonly dismissal: Promise<UIBottomSheetResult<TResult>>,
  ) {}

  close(data?: TResult): Promise<boolean> {
    return this.ref.close(data);
  }

  cancel(): Promise<boolean> {
    return this.ref.cancel();
  }

  onDidDismiss(): Promise<UIBottomSheetResult<TResult>> {
    return this.dismissal;
  }
}

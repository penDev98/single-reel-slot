import { SymbolId, REEL_STRIP, STRIP_LENGTH } from '../Config';

export class ReelModel {
  private readonly strip: ReadonlyArray<SymbolId> = REEL_STRIP;
  private _currentTopIndex = 0;

  get currentTopIndex(): number {
    return this._currentTopIndex;
  }

  getSymbolAt(index: number): SymbolId {
    const wrapped = ((index % STRIP_LENGTH) + STRIP_LENGTH) % STRIP_LENGTH;
    return this.strip[wrapped];
  }

  /** Returns the 3 visible symbols top-to-bottom (reversed order for downward scroll) */
  getVisibleSymbols(): SymbolId[] {
    const i = this._currentTopIndex;
    return [
      this.getSymbolAt(i),
      this.getSymbolAt(i - 1),
      this.getSymbolAt(i - 2),
    ];
  }

  selectTargetIndex(): number {
    return Math.floor(Math.random() * STRIP_LENGTH);
  }

  advanceTo(index: number): void {
    this._currentTopIndex = ((index % STRIP_LENGTH) + STRIP_LENGTH) % STRIP_LENGTH;
  }
}

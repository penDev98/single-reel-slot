import { STARTING_BALANCE, SPIN_COST } from './Config';

export class GameState {
  private _balance = STARTING_BALANCE;
  private _lastWin = 0;
  private _spinning = false;

  onBalanceChanged: ((balance: number) => void) | null = null;
  onSpinStateChanged: ((spinning: boolean) => void) | null = null;

  get balance(): number { return this._balance; }
  get lastWin(): number { return this._lastWin; }
  get isSpinning(): boolean { return this._spinning; }

  canSpin(): boolean {
    return this._balance >= SPIN_COST && !this._spinning;
  }

  deductBet(): void {
    this._balance -= SPIN_COST;
    this.onBalanceChanged?.(this._balance);
  }

  awardWin(amount: number): void {
    this._lastWin = amount;
    if (amount > 0) {
      this._balance += amount;
      this.onBalanceChanged?.(this._balance);
    }
  }

  setSpinning(spinning: boolean): void {
    this._spinning = spinning;
    this.onSpinStateChanged?.(spinning);
  }
}

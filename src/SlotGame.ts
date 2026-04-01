import { Container } from 'pixi.js';
import {
  SymbolId,
  LOGICAL_WIDTH, LOGICAL_HEIGHT,
  REEL_SCALE, REEL_TOP_Y_RATIO, REEL_WIDTH,
  SCREEN_SHAKE_DURATION, SCREEN_SHAKE_INTENSITY,
  SPIN_COST, WIN_2_MATCH, WIN_3_MATCH,
} from './Config';
import { GameState } from './GameState';
import { ReelModel } from './reel/ReelModel';
import { ReelView } from './reel/ReelView';
import { ReelController } from './reel/ReelController';
import { SpinPlan } from './reel/SpinPlan';
import { HUD } from './ui/HUD';
import { DebugOverlay } from './DebugOverlay';

function calculateWin(symbols: SymbolId[]): number {
  const [a, b, c] = symbols;

  if (a === b && b === c) return WIN_3_MATCH * SPIN_COST;
  if (a === b || b === c || a === c) return WIN_2_MATCH * SPIN_COST;

  return 0;
}

export class SlotGame {
  private state: GameState;
  private reelModel: ReelModel;
  private reelView: ReelView;
  private reelController: ReelController;
  private hud: HUD;
  private debug: DebugOverlay;

  private shakeElapsed = 0;
  private shakeDuration = 0;
  private reelBaseX = 0;
  private reelBaseY = 0;

  constructor(root: Container) {
    this.state = new GameState();
    this.reelModel = new ReelModel();
    this.reelView = new ReelView(this.reelModel);
    this.reelController = new ReelController(this.reelModel, this.reelView);
    this.hud = new HUD();
    this.debug = new DebugOverlay(this.reelModel, this.reelController, this.state);

    const reelContainer = this.reelView.container;
    reelContainer.scale.set(REEL_SCALE);
    reelContainer.x = Math.round(LOGICAL_WIDTH / 2 - (REEL_WIDTH * REEL_SCALE) / 2);
    reelContainer.y = Math.round(LOGICAL_HEIGHT * REEL_TOP_Y_RATIO);
    this.reelBaseX = reelContainer.x;
    this.reelBaseY = reelContainer.y;

    this.reelController.onImpact = () => {
      this.shakeElapsed = 0;
      this.shakeDuration = SCREEN_SHAKE_DURATION;
    };

    root.addChild(reelContainer);
    root.addChild(this.hud.container);
    root.addChild(this.debug.container);

    this.state.onBalanceChanged = (balance) => {
      this.hud.balancePanel.updateBalance(balance);
    };
    this.state.onSpinStateChanged = (spinning) => {
      this.hud.spinButton.setSpinning(spinning);
      if (!spinning) {
        this.hud.spinButton.setEnabled(this.state.canSpin());
      }
    };

    this.hud.spinButton.onSpin = () => this.startSpin();
    this.hud.spinButton.onQuickStop = () => this.reelController.quickStop();
  }

  private startSpin(): void {
    if (!this.state.canSpin()) return;

    this.state.deductBet();
    this.state.setSpinning(true);
    this.hud.winPanel.hide();

    const plan = SpinPlan.create(
      this.reelModel.currentTopIndex,
      this.reelModel.selectTargetIndex(),
    );
    this.reelController.start(plan, () => this.onSpinComplete());
  }

  private onSpinComplete(): void {
    const symbols = this.reelModel.getVisibleSymbols();
    const payout = calculateWin(symbols);

    this.state.awardWin(payout);
    this.state.setSpinning(false);
    this.hud.winPanel.showWin(payout);
    this.hud.spinButton.setEnabled(this.state.canSpin());
  }

  update(deltaMs: number): void {
    this.reelController.update(deltaMs);
    this.hud.update(deltaMs);
    this.debug.update();
    this.updateScreenShake(deltaMs);
  }

  private updateScreenShake(deltaMs: number): void {
    if (this.shakeDuration <= 0) return;

    this.shakeElapsed += deltaMs;
    if (this.shakeElapsed >= this.shakeDuration) {
      this.shakeDuration = 0;
      this.reelView.container.x = this.reelBaseX;
      this.reelView.container.y = this.reelBaseY;
      return;
    }

    const progress = this.shakeElapsed / this.shakeDuration;
    const intensity = SCREEN_SHAKE_INTENSITY * (1 - progress);
    this.reelView.container.x = this.reelBaseX + Math.round(Math.cos(progress * Math.PI * 6) * intensity);
    this.reelView.container.y = this.reelBaseY + Math.round(Math.sin(progress * Math.PI * 8) * intensity * 0.6);
  }
}

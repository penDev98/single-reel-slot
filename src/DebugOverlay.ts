import { Container, Text, TextStyle, Graphics } from 'pixi.js';
import { LOGICAL_WIDTH } from './Config';
import { ReelModel } from './reel/ReelModel';
import { ReelController } from './reel/ReelController';
import { GameState } from './GameState';

export class DebugOverlay {
  readonly container: Container;
  private readonly bg: Graphics;
  private readonly text: Text;
  private reelModel: ReelModel;
  private reelController: ReelController;
  private state: GameState;
  private visible = false;

  constructor(reelModel: ReelModel, reelController: ReelController, state: GameState) {
    this.reelModel = reelModel;
    this.reelController = reelController;
    this.state = state;

    this.container = new Container();
    this.container.visible = false;
    this.container.alpha = 0.85;
    this.container.y = 4;

    this.bg = new Graphics();
    this.container.addChild(this.bg);

    const style = new TextStyle({
      fontFamily: 'Courier New, monospace',
      fontSize: 10,
      fill: '#44cc88',
      lineHeight: 14,
    });

    this.text = new Text({ text: '', style });
    this.text.x = 6;
    this.text.y = 5;
    this.container.addChild(this.text);

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') {
        this.visible = !this.visible;
        this.container.visible = this.visible;
      }
    });
  }

  update(): void {
    if (!this.visible) return;

    const plan = this.reelController.activePlan;
    const phase = this.reelController.spinPhase;
    const travel = this.reelController.travelInSymbols;
    const totalTravel = plan ? plan.totalSymbolTravel : 0;

    const targetIdx = this.reelController.fixedTargetIndex;
    const targetSyms = this.reelController.fixedTargetSymbols;
    const hasTarget = targetIdx >= 0 && phase !== 'idle';

    const lines = [
      `Idx: ${this.reelModel.currentTopIndex}  Phase: ${phase}`,
      `Now: ${this.reelModel.getVisibleSymbols().join('|')}`,
      `Travel: ${travel.toFixed(1)} / ${totalTravel}`,
      `Bal: $${this.state.balance}  Win: $${this.state.lastWin}`,
    ];

    if (hasTarget) {
      lines.push(`--- target (locked at spin start) ---`);
      lines.push(`Target: ${targetIdx}  [${targetSyms.join('|')}]`);
    }

    this.text.text = lines.join('\n');

    this.bg.clear();
    const panelWidth = Math.max(this.text.width + 12, 190);
    const panelHeight = this.text.height + 10;
    this.bg.roundRect(0, 0, panelWidth, panelHeight, 4);
    this.bg.fill({ color: 0x111118, alpha: 0.75 });
    this.container.x = LOGICAL_WIDTH - panelWidth - 8;
  }
}

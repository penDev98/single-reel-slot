import { Container } from 'pixi.js';
import { SpinButton } from './SpinButton';
import { BalancePanel } from './BalancePanel';
import { WinPanel } from './WinPanel';
import {
  LOGICAL_WIDTH,
  LOGICAL_HEIGHT,
  BUTTON_SCALE,
  BALANCE_Y_RATIO,
  BUTTON_Y_RATIO,
  WIN_Y_RATIO,
} from '../Config';

export class HUD {
  readonly container: Container;
  readonly spinButton: SpinButton;
  readonly balancePanel: BalancePanel;
  readonly winPanel: WinPanel;

  constructor() {
    this.container = new Container();

    this.balancePanel = new BalancePanel();
    this.spinButton = new SpinButton();
    this.winPanel = new WinPanel();

    this.balancePanel.container.x = LOGICAL_WIDTH / 2;
    this.balancePanel.container.y = Math.round(LOGICAL_HEIGHT * BALANCE_Y_RATIO);

    this.spinButton.container.x = LOGICAL_WIDTH / 2;
    this.spinButton.container.y = Math.round(LOGICAL_HEIGHT * BUTTON_Y_RATIO);
    this.spinButton.container.scale.set(BUTTON_SCALE);

    this.winPanel.container.x = LOGICAL_WIDTH / 2;
    this.winPanel.container.y = Math.round(LOGICAL_HEIGHT * WIN_Y_RATIO);

    this.container.addChild(this.balancePanel.container);
    this.container.addChild(this.winPanel.container);
    this.container.addChild(this.spinButton.container);
  }

  update(deltaMs: number): void {
    this.winPanel.update(deltaMs);
  }
}

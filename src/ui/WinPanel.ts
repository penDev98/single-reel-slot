import { Container, Sprite, Text, TextStyle, Assets } from 'pixi.js';
import {
  REEL_SCALE, REEL_WIDTH,
  WIN_ANIM_DURATION, WIN_OVERSHOOT_SCALE, WIN_SETTLE_PHASE_START,
} from '../Config';

export class WinPanel {
  readonly container: Container;
  private readonly bg: Sprite;
  private readonly text: Text;
  private animTimer = 0;
  private animating = false;

  constructor() {
    this.container = new Container();
    this.container.visible = false;

    this.bg = new Sprite(Assets.get('WIN_BG'));
    this.bg.anchor.set(0.5);
    const bgNativeWidth = this.bg.texture.width || 185;
    this.bg.scale.set((REEL_WIDTH * REEL_SCALE) / bgNativeWidth, 0.42);
    this.bg.alpha = 0.5;
    this.container.addChild(this.bg);

    const style = new TextStyle({
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: 22,
      fontWeight: 'bold',
      fill: '#ffffff',
      dropShadow: {
        color: '#000000',
        blur: 3,
        distance: 1,
        angle: Math.PI / 4,
      },
    });

    this.text = new Text({ text: '', style });
    this.text.anchor.set(0.5);
    this.container.addChild(this.text);
  }

  showWin(amount: number): void {
    if (amount > 0) {
      this.text.text = `WIN: $${amount}`;
      this.container.visible = true;
      this.container.scale.set(0.5);
      this.animating = true;
      this.animTimer = 0;
    } else {
      this.container.visible = false;
    }
  }

  hide(): void {
    this.container.visible = false;
    this.animating = false;
  }

  update(deltaMs: number): void {
    if (!this.animating) return;

    this.animTimer += deltaMs;
    const progress = Math.min(this.animTimer / WIN_ANIM_DURATION, 1);

    // Pop in with slight overshoot then settle
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const settlePhaseLength = 1 - WIN_SETTLE_PHASE_START;
    const overshootAmount = WIN_OVERSHOOT_SCALE - 1;

    const scale = progress < WIN_SETTLE_PHASE_START
      ? easeOut * WIN_OVERSHOOT_SCALE
      : 1.0 + overshootAmount * Math.pow(1 - (progress - WIN_SETTLE_PHASE_START) / settlePhaseLength, 2);
    this.container.scale.set(Math.min(scale, WIN_OVERSHOOT_SCALE));

    if (progress >= 1) {
      this.container.scale.set(1);
      this.animating = false;
    }
  }
}

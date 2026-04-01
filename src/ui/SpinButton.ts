import { Container, Sprite, Assets } from 'pixi.js';

export class SpinButton {
  readonly container: Container;
  private readonly sprite: Sprite;
  private _enabled = true;
  private _spinning = false;

  onSpin: (() => void) | null = null;
  onQuickStop: (() => void) | null = null;

  constructor() {
    this.container = new Container();

    this.sprite = new Sprite(Assets.get('PLAY'));
    this.sprite.anchor.set(0.5);
    this.sprite.eventMode = 'static';
    this.sprite.cursor = 'pointer';

    this.sprite.on('pointerdown', () => this.handleClick());

    this.sprite.on('pointerover', () => {
      if (this.isInteractive) this.sprite.scale.set(1.05);
    });
    this.sprite.on('pointerout', () => this.sprite.scale.set(1.0));
    this.sprite.on('pointerdown', () => {
      if (this.isInteractive) this.sprite.scale.set(0.95);
    });
    this.sprite.on('pointerup', () => this.sprite.scale.set(1.0));
    this.sprite.on('pointerupoutside', () => this.sprite.scale.set(1.0));

    this.container.addChild(this.sprite);
  }

  // Button is interactive when it can start a spin OR stop a running one
  private get isInteractive(): boolean {
    return this._spinning || this._enabled;
  }

  private handleClick(): void {
    if (this._spinning) {
      this.onQuickStop?.();
    } else if (this._enabled) {
      this.onSpin?.();
    }
  }

  setEnabled(enabled: boolean): void {
    this._enabled = enabled;
    this.updateTexture();
  }

  setSpinning(spinning: boolean): void {
    this._spinning = spinning;
    this.updateTexture();
  }

  // Three states:
  //   spinning         -> PLAY.png (clickable for quick stop)
  //   idle + can spin  -> PLAY.png (clickable to start)
  //   idle + no money  -> PLAY_DISABLED.png (not interactive)
  private updateTexture(): void {
    const disabled = !this._enabled && !this._spinning;
    this.sprite.texture = Assets.get(disabled ? 'PLAY_DISABLED' : 'PLAY');
    this.sprite.cursor = disabled ? 'default' : 'pointer';
  }
}

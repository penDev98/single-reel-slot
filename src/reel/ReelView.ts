import { Container, Sprite, Graphics, Assets, Texture } from 'pixi.js';
import { ReelModel } from './ReelModel';
import {
  REEL_WIDTH, REEL_HEIGHT,
  SYMBOL_SIZE,
  VIEWPORT_X, VIEWPORT_Y, VIEWPORT_W, VIEWPORT_H,
  POOL_SIZE,
} from '../Config';

export class ReelView {
  readonly container: Container;
  private readonly symbolContainer: Container;
  private readonly pool: Sprite[] = [];
  private readonly reelModel: ReelModel;

  constructor(reelModel: ReelModel) {
    this.reelModel = reelModel;
    this.container = new Container();

    const reelBackground = new Sprite(Assets.get('REEL'));
    this.container.addChild(reelBackground);

    this.symbolContainer = new Container();
    this.symbolContainer.x = VIEWPORT_X;
    this.symbolContainer.y = VIEWPORT_Y;

    const viewportMask = new Graphics();
    viewportMask.rect(VIEWPORT_X, VIEWPORT_Y, VIEWPORT_W, VIEWPORT_H);
    viewportMask.fill(0xffffff);
    this.container.addChild(viewportMask);
    this.symbolContainer.mask = viewportMask;

    this.container.addChild(this.symbolContainer);

    for (let i = 0; i < POOL_SIZE; i++) {
      const sprite = new Sprite();
      sprite.width = SYMBOL_SIZE;
      sprite.height = SYMBOL_SIZE;
      this.symbolContainer.addChild(sprite);
      this.pool.push(sprite);
    }

    this.render(reelModel.currentTopIndex, 0);
  }

  /**
   * Renders the reel at the given strip position and sub-symbol scroll offset.
   *
   * Strip mapping is reversed for downward scroll:
   *   sprite 0 (above viewport) → topVisibleSymbolIndex + 1
   *   sprite 1 (top visible)    → topVisibleSymbolIndex
   *   sprite 2 (middle)         → topVisibleSymbolIndex - 1
   *   sprite 3 (bottom)         → topVisibleSymbolIndex - 2
   *
   * When topVisibleSymbolIndex increments and offset wraps to 0,
   * every symbol shifts exactly one row downward — no visual discontinuity.
   */
  render(topVisibleSymbolIndex: number, verticalScrollOffsetPx: number): void {
    for (let i = 0; i < POOL_SIZE; i++) {
      const sprite = this.pool[i];
      const stripIndex = topVisibleSymbolIndex - (i - 1);
      const symbolId = this.reelModel.getSymbolAt(stripIndex);

      const symbolTexture: Texture = Assets.get(symbolId);
      if (sprite.texture !== symbolTexture) {
        sprite.texture = symbolTexture;
      }

      sprite.x = 0;
      sprite.y = Math.round((i - 1) * SYMBOL_SIZE + verticalScrollOffsetPx);
      sprite.width = SYMBOL_SIZE;
      sprite.height = SYMBOL_SIZE;
    }
  }

  get width(): number { return REEL_WIDTH; }
  get height(): number { return REEL_HEIGHT; }
}

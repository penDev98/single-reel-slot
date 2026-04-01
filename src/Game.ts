import { Application, Assets, Container, Ticker } from 'pixi.js';
import { LOGICAL_WIDTH, LOGICAL_HEIGHT, ASSET_MANIFEST } from './Config';
import { SlotGame } from './SlotGame';

export class Game {
  private app!: Application;
  private root!: Container;
  private slotGame!: SlotGame;

  async init(): Promise<void> {
    this.app = new Application();
    await this.app.init({
      background: '#1a1a2e',
      resizeTo: window,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    document.getElementById('game-container')!.appendChild(this.app.canvas);

    this.root = new Container();
    this.app.stage.addChild(this.root);

    await this.loadAssets();

    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());

    this.slotGame = new SlotGame(this.root);

    this.app.ticker.add((ticker: Ticker) => {
      this.slotGame.update(ticker.deltaMS);
    });
  }

  private async loadAssets(): Promise<void> {
    const entries = Object.entries(ASSET_MANIFEST);
    for (const [alias, src] of entries) {
      Assets.add({ alias, src });
    }
    await Assets.load(entries.map(([alias]) => alias));
  }

  private handleResize(): void {
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;
    const scale = Math.min(viewW / LOGICAL_WIDTH, viewH / LOGICAL_HEIGHT);

    this.root.scale.set(scale);
    this.root.x = Math.round((viewW - LOGICAL_WIDTH * scale) / 2);
    this.root.y = Math.round((viewH - LOGICAL_HEIGHT * scale) / 2);
  }
}

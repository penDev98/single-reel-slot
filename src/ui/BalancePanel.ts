import { Container, Text, TextStyle } from 'pixi.js';
import { STARTING_BALANCE } from '../Config';

export class BalancePanel {
  readonly container: Container;
  private readonly text: Text;

  constructor() {
    this.container = new Container();

    const style = new TextStyle({
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: 28,
      fontWeight: 'bold',
      fill: '#e0e0e0',
      dropShadow: {
        color: '#000000',
        blur: 4,
        distance: 2,
        angle: Math.PI / 4,
      },
    });

    this.text = new Text({ text: `BALANCE: $${STARTING_BALANCE}`, style });
    this.text.anchor.set(0.5, 0);
    this.container.addChild(this.text);
  }

  updateBalance(balance: number): void {
    this.text.text = `BALANCE: $${balance}`;
  }
}

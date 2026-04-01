import { SpinPlanData, SPIN_DURATION, VISUAL_SPIN_TRAVEL } from '../Config';

export class SpinPlan implements SpinPlanData {
  readonly startIndex: number;
  readonly targetIndex: number;
  readonly totalSymbolTravel: number;
  readonly duration: number;

  constructor(data: SpinPlanData) {
    this.startIndex = data.startIndex;
    this.targetIndex = data.targetIndex;
    this.totalSymbolTravel = data.totalSymbolTravel;
    this.duration = data.duration;
  }

  static create(startIndex: number, targetIndex: number): SpinPlan {
    return new SpinPlan({
      startIndex,
      targetIndex,
      totalSymbolTravel: VISUAL_SPIN_TRAVEL,
      duration: SPIN_DURATION,
    });
  }
}

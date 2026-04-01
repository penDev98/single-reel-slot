import {
  SpinPhase, SymbolId,
  EPSILON,
  SYMBOL_SIZE,
  VISIBLE_COUNT,
  STRIP_LENGTH,
  QUICK_STOP_DURATION,
  ANTICIPATION_DURATION,
  ANTICIPATION_DISTANCE,
  STOP_DURATION,
  STOP_OVERSHOOT,
  STOP_OSCILLATIONS,
  SPLICE_THRESHOLD,
} from '../Config';
import { ReelModel } from './ReelModel';
import { ReelView } from './ReelView';
import { SpinPlan } from './SpinPlan';

function cubicEaseOut(progress: number): number {
  const inverse = 1 - progress;
  return 1 - inverse * inverse * inverse;
}

// C1-continuous three-phase easing: accel → cruise → decel.
// Derivative is continuous at all zone boundaries (no velocity spikes).
function spinEasing(progress: number): number {
  if (progress <= 0) return 0;
  if (progress >= 1) return 1;

  const accelEnd = 0.1;
  const decelStart = 0.7;
  const cruiseSpeed = 2 / (decelStart - accelEnd + 1);

  if (progress < accelEnd) {
    const accelProgress = progress / accelEnd;
    return (cruiseSpeed * accelEnd / 2) * accelProgress * accelProgress;
  }
  if (progress <= decelStart) {
    return cruiseSpeed * accelEnd / 2 + cruiseSpeed * (progress - accelEnd);
  }

  const decelLength = 1 - decelStart;
  const decelProgress = (progress - decelStart) / decelLength;
  const decelArea = cruiseSpeed * decelLength / 2;
  const distanceAtDecelStart = cruiseSpeed * (decelStart - accelEnd / 2);
  return distanceAtDecelStart + decelArea * (2 * decelProgress - decelProgress * decelProgress);
}

function quickStopEasing(progress: number): number {
  if (progress <= 0) return 0;
  if (progress >= 1) return 1;
  return cubicEaseOut(progress);
}

export class ReelController {
  private reelModel: ReelModel;
  private reelView: ReelView;

  private currentPhase: SpinPhase = 'idle';
  private currentSpinPlan: SpinPlan | null = null;
  private elapsedMs = 0;
  private phaseElapsedMs = 0;
  private onSpinComplete: (() => void) | null = null;
  private isQuickStopping = false;
  private quickStopCarryOverFraction = 0;
  private currentTravelInSymbols = 0;

  // Locked at spin start; quick stop changes the path but never the destination
  private _fixedTargetIndex = -1;
  private _fixedTargetSymbols: SymbolId[] = [];

  /** Fired when reel reaches target — used for screen shake */
  onImpact: (() => void) | null = null;

  constructor(reelModel: ReelModel, reelView: ReelView) {
    this.reelModel = reelModel;
    this.reelView = reelView;
  }

  get spinPhase(): SpinPhase { return this.currentPhase; }
  get activePlan(): SpinPlan | null { return this.currentSpinPlan; }
  get travelInSymbols(): number { return this.currentTravelInSymbols; }
  get fixedTargetIndex(): number { return this._fixedTargetIndex; }
  get fixedTargetSymbols(): ReadonlyArray<SymbolId> { return this._fixedTargetSymbols; }

  start(plan: SpinPlan, onSpinComplete: () => void): void {
    this.currentSpinPlan = plan;
    this.onSpinComplete = onSpinComplete;
    this.elapsedMs = 0;
    this.phaseElapsedMs = 0;
    this.isQuickStopping = false;
    this.quickStopCarryOverFraction = 0;
    this.currentTravelInSymbols = 0;

    this._fixedTargetIndex = plan.targetIndex;
    this._fixedTargetSymbols = [
      this.reelModel.getSymbolAt(plan.targetIndex),
      this.reelModel.getSymbolAt(plan.targetIndex - 1),
      this.reelModel.getSymbolAt(plan.targetIndex - 2),
    ];

    this.currentPhase = 'anticipation';
  }

  quickStop(): void {
    if (this.currentPhase !== 'spinning' || !this.currentSpinPlan) return;

    const travel = this.currentTravelInSymbols;

    // Snap to nearest whole symbol, preserving fractional offset for visual continuity
    let wholeSymbolsTraveled = Math.floor(travel + EPSILON);
    let fractionalTravel = travel - wholeSymbolsTraveled;
    if (fractionalTravel < EPSILON) fractionalTravel = 0;
    if (fractionalTravel > 1 - EPSILON) { fractionalTravel = 0; wholeSymbolsTraveled += 1; }

    this.quickStopCarryOverFraction = fractionalTravel;

    // Just enough travel to clear all visible symbols off-screen.
    // The splice logic handles target-relative rendering automatically
    // since minClearance < SPLICE_THRESHOLD.
    const remainingTravel = VISIBLE_COUNT + 1;

    this.currentSpinPlan = new SpinPlan({
      startIndex: this.currentSpinPlan.startIndex + wholeSymbolsTraveled,
      targetIndex: this.currentSpinPlan.targetIndex,
      totalSymbolTravel: remainingTravel,
      duration: QUICK_STOP_DURATION,
    });

    this.elapsedMs = 0;
    this.isQuickStopping = true;
    this.currentPhase = 'quickStopping';
  }

  update(deltaMs: number): void {
    switch (this.currentPhase) {
      case 'idle': return;
      case 'anticipation': this.updateAnticipation(deltaMs); return;
      case 'spinning':     this.updateSpinning(deltaMs); return;
      case 'quickStopping': this.updateSpinning(deltaMs); return;
      case 'bouncing':     this.updateBounce(deltaMs); return;
    }
  }

  private updateAnticipation(deltaMs: number): void {
    this.phaseElapsedMs += deltaMs;
    const progress = Math.min(this.phaseElapsedMs / ANTICIPATION_DURATION, 1);

    // Negative offset pulls upward (wind-up before downward spin)
    const windUpOffset = cubicEaseOut(progress) * ANTICIPATION_DISTANCE;
    this.reelView.render(this.reelModel.currentTopIndex, -Math.round(windUpOffset));

    if (progress >= 1) {
      this.currentPhase = 'spinning';
      this.elapsedMs = 0;
      this.phaseElapsedMs = 0;
    }
  }

  private updateSpinning(deltaMs: number): void {
    if (!this.currentSpinPlan) return;

    this.elapsedMs += deltaMs;
    const progress = Math.min(this.elapsedMs / this.currentSpinPlan.duration, 1);

    const easing = this.isQuickStopping ? quickStopEasing : spinEasing;
    let travelledSymbols = easing(progress) * this.currentSpinPlan.totalSymbolTravel;

    // Blend out fractional carry so quick-stop doesn't cause a position jump
    if (this.quickStopCarryOverFraction > 0) {
      travelledSymbols += this.quickStopCarryOverFraction * (1 - progress);
    }

    this.currentTravelInSymbols = travelledSymbols;

    let wholeSymbolsTraveled = Math.floor(travelledSymbols + EPSILON);
    let fractionalTravel = travelledSymbols - wholeSymbolsTraveled;
    if (fractionalTravel < EPSILON) fractionalTravel = 0;
    if (fractionalTravel > 1 - EPSILON) { fractionalTravel = 0; wholeSymbolsTraveled += 1; }

    // ── Splice logic ──
    // During the early/fast phase: show sequential strip symbols (decorative).
    // During the last SPLICE_THRESHOLD symbols: switch to target-anchored
    // rendering so the result symbols naturally decelerate into view.
    //
    // Key: topVisibleIndex must INCREASE over time in both modes to maintain
    // smooth downward scroll. Target-anchored uses a virtual start position
    // (targetIndex − totalTravel) so that at wholeSymbolsTraveled = totalTravel,
    // topVisibleIndex lands exactly on targetIndex.
    const totalTravel = this.currentSpinPlan.totalSymbolTravel;
    const remainingSymbols = Math.max(0, totalTravel - wholeSymbolsTraveled);

    let topVisibleIndex: number;
    if (remainingSymbols <= SPLICE_THRESHOLD) {
      // Target-anchored: virtual start ensures smooth landing on targetIndex
      const virtualStart = this.currentSpinPlan.targetIndex - totalTravel;
      topVisibleIndex = virtualStart + wholeSymbolsTraveled;
    } else {
      // Start-relative: sequential strip traversal (classic reel spin look)
      topVisibleIndex = this.currentSpinPlan.startIndex + wholeSymbolsTraveled;
    }

    const scrollOffsetPx = Math.round(fractionalTravel * SYMBOL_SIZE);
    this.reelView.render(topVisibleIndex % STRIP_LENGTH, scrollOffsetPx);

    if (progress >= 1) {
      this.reelModel.advanceTo(this.currentSpinPlan.targetIndex);
      this.reelView.render(this.currentSpinPlan.targetIndex, 0);
      this.currentTravelInSymbols = this.currentSpinPlan.totalSymbolTravel;
      this.currentPhase = 'bouncing';
      this.phaseElapsedMs = 0;
      this.onImpact?.();
    }
  }

  private updateBounce(deltaMs: number): void {
    if (!this.currentSpinPlan) return;

    this.phaseElapsedMs += deltaMs;
    const progress = Math.min(this.phaseElapsedMs / STOP_DURATION, 1);

    // Damped spring: overshoot in direction of travel, then settle
    const decay = Math.exp(-6 * progress);
    const oscillation = Math.cos(progress * Math.PI * STOP_OSCILLATIONS);
    const bounceOffsetPx = STOP_OVERSHOOT * decay * oscillation;
    this.reelView.render(this.currentSpinPlan.targetIndex, Math.round(bounceOffsetPx));

    if (progress >= 1) {
      this.reelView.render(this.currentSpinPlan.targetIndex, 0);
      this.currentPhase = 'idle';
      if (this.onSpinComplete) {
        this.onSpinComplete();
        this.onSpinComplete = null;
      }
    }
  }
}

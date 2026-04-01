// ── Types ──────────────────────────────────────────────

export type SymbolId = 'SYM1' | 'SYM2' | 'SYM3' | 'SYM4' | 'SYM5' | 'SYM6';

export type SpinPhase = 'idle' | 'anticipation' | 'spinning' | 'quickStopping' | 'bouncing';

export interface SpinPlanData {
  readonly startIndex: number;
  readonly targetIndex: number;
  readonly totalSymbolTravel: number;
  readonly duration: number;
}

// ── Canvas ─────────────────────────────────────────────

export const LOGICAL_WIDTH = 1280;
export const LOGICAL_HEIGHT = 720;

// Floating-point snap threshold
export const EPSILON = 1e-6;

// ── Reel asset dimensions (pixels in REEL.png) ────────

export const REEL_WIDTH = 140;
export const REEL_HEIGHT = 396;
export const SYMBOL_SIZE = 128;
export const VISIBLE_COUNT = 3;

// Inner viewport within REEL.png: 3×128 = 384, padding = (396-384)/2 = 6
export const VIEWPORT_X = 6;
export const VIEWPORT_Y = 6;
export const VIEWPORT_W = 128;
export const VIEWPORT_H = SYMBOL_SIZE * VISIBLE_COUNT;

// Sprite pool for recycled reel rendering (VISIBLE_COUNT + 3 buffer)
export const POOL_SIZE = 6;

// ── Layout (proportional slices of LOGICAL_HEIGHT) ────

export const BALANCE_Y_RATIO = 18 / LOGICAL_HEIGHT;
export const REEL_TOP_Y_RATIO = 0.12;
export const REEL_BOTTOM_Y_RATIO = 0.72;
export const WIN_Y_RATIO = 0.79;
export const BUTTON_Y_RATIO = 0.91;

// Derived layout values
export const REEL_DISPLAY_HEIGHT = LOGICAL_HEIGHT * (REEL_BOTTOM_Y_RATIO - REEL_TOP_Y_RATIO);
export const REEL_SCALE = REEL_DISPLAY_HEIGHT / REEL_HEIGHT;
export const BUTTON_SIZE = 80;
export const BUTTON_SCALE = BUTTON_SIZE / 185;

// ── Game rules ─────────────────────────────────────────

export const STARTING_BALANCE = 100;
export const SPIN_COST = 1;
export const WIN_2_MATCH = 2;
export const WIN_3_MATCH = 3;

// ── Spin timing (ms) ──────────────────────────────────

export const SPIN_DURATION = 3000;
export const QUICK_STOP_DURATION = 200;
export const ANTICIPATION_DURATION = 150;
export const ANTICIPATION_DISTANCE = 10;

// ── Stop / impact feel ────────────────────────────────

export const STOP_DURATION = 250;
export const STOP_OVERSHOOT = 8;
export const STOP_OSCILLATIONS = 2;
export const SCREEN_SHAKE_DURATION = 120;
export const SCREEN_SHAKE_INTENSITY = 3;

// ── Win panel animation ───────────────────────────────

export const WIN_ANIM_DURATION = 200;
export const WIN_OVERSHOOT_SCALE = 1.08;
export const WIN_SETTLE_PHASE_START = 0.6;

// ── Spin travel ───────────────────────────────────────

/** Fixed visual travel distance for every normal spin (symbols).
 *  The spin animation always scrolls exactly this many symbols in SPIN_DURATION.
 *  Result symbols are "spliced in" near the end via target-relative rendering. */
export const VISUAL_SPIN_TRAVEL = 50;

/** When this many symbols of travel remain, rendering switches from
 *  start-relative (sequential strip traversal) to target-relative
 *  (counting down to the actual result). Set high so the swap happens
 *  deep in cruise phase at max speed — completely invisible to the eye.
 *  First ~10 symbols are start-relative for continuity from anticipation. */
export const SPLICE_THRESHOLD = 40;

// ── Reel strip (102 symbols) ──────────────────────────

export const REEL_STRIP: SymbolId[] = [
  'SYM1', 'SYM5', 'SYM1', 'SYM3', 'SYM4', 'SYM3', 'SYM2', 'SYM4', 'SYM3', 'SYM6',
  'SYM3', 'SYM1', 'SYM6', 'SYM1', 'SYM2', 'SYM1', 'SYM2', 'SYM2', 'SYM2', 'SYM1',
  'SYM2', 'SYM1', 'SYM4', 'SYM1', 'SYM3', 'SYM6', 'SYM1', 'SYM3', 'SYM2', 'SYM5',
  'SYM3', 'SYM1', 'SYM2', 'SYM2', 'SYM2', 'SYM1', 'SYM4', 'SYM1', 'SYM4', 'SYM1',
  'SYM3', 'SYM2', 'SYM4', 'SYM4', 'SYM5', 'SYM2', 'SYM3', 'SYM1', 'SYM1', 'SYM1',
  'SYM4', 'SYM5', 'SYM2', 'SYM2', 'SYM2', 'SYM1', 'SYM5', 'SYM6', 'SYM1', 'SYM3',
  'SYM4', 'SYM2', 'SYM5', 'SYM2', 'SYM1', 'SYM5', 'SYM1', 'SYM2', 'SYM1', 'SYM1',
  'SYM1', 'SYM4', 'SYM4', 'SYM3', 'SYM3', 'SYM5', 'SYM5', 'SYM4', 'SYM2', 'SYM5',
  'SYM2', 'SYM1', 'SYM3', 'SYM2', 'SYM3', 'SYM1', 'SYM4', 'SYM3', 'SYM4', 'SYM2',
  'SYM3', 'SYM4', 'SYM1', 'SYM1', 'SYM1', 'SYM2', 'SYM6', 'SYM3', 'SYM2', 'SYM3',
  'SYM1', 'SYM5',
];

export const STRIP_LENGTH = REEL_STRIP.length;

// ── Assets ────────────────────────────────────────────

export const ASSET_MANIFEST = {
  REEL: 'assets/REEL.png',
  PLAY: 'assets/PLAY.png',
  PLAY_DISABLED: 'assets/PLAY_DISABLED.png',
  WIN_BG: 'assets/WIN_BG.png',
  SYM1: 'assets/SYM01.png',
  SYM2: 'assets/SYM02.png',
  SYM3: 'assets/SYM03.png',
  SYM4: 'assets/SYM04.png',
  SYM5: 'assets/SYM05.png',
  SYM6: 'assets/SYM06.png',
} as const;

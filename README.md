# Slot Game

Single-reel slot machine built with PIXI.js, TypeScript, and Vite.

## Features

- One reel with three visible symbols, drawn from a 102-symbol deterministic strip
- Fixed 50-symbol visual travel over 3 seconds with C1-continuous easing (acceleration → cruise → deceleration)
- Splice-based result reveal: target symbols are seamlessly anchored during deceleration
- Quick stop on button click during spin — resolves to the same predetermined outcome
- Damped-spring bounce on stop for mechanical feel
- Payout: 3× bet on three-of-a-kind, 2× on any two matching
- Balance tracked per session; spin button disables at zero balance
- Debug overlay toggled with `D` — shows strip index, phase, travel, target, and balance

## Architecture

```
src/
  Config.ts          — types, constants, reel strip, asset manifest
  Game.ts            — PIXI application bootstrap, asset loading, resize
  SlotGame.ts        — spin orchestration, screen shake, win calculation
  GameState.ts       — balance, bet, win state, change callbacks
  DebugOverlay.ts    — real-time diagnostic panel

  reel/
    ReelModel.ts     — strip data, index wrapping, symbol lookup
    ReelView.ts      — sprite pool rendering with mask
    ReelController.ts— spin phases, easing, splice logic, quick stop, bounce
    SpinPlan.ts      — fixed visual travel and duration

  ui/
    HUD.ts           — layout container for UI components
    SpinButton.ts    — spin / quick-stop input, disabled state
    BalancePanel.ts  — balance display
    WinPanel.ts      — animated win display
```

`Game` initializes PIXI and hands a root container to `SlotGame`, which wires together state, reel, UI, and debug systems. The reel subsystem follows an MVC split — `ReelModel` owns strip state, `ReelView` renders a recycled sprite pool, and `ReelController` drives the spin through discrete phases (anticipation → spinning → bouncing → idle).

## Implementation Notes

- **Deterministic outcomes.** Target index is selected and locked before the spin starts. Quick stop changes the easing curve and travel path but never the destination.
- **Splice-based animation.** Every spin scrolls exactly 50 symbols in 3 seconds. During the fast cruise phase, the reel shows sequential strip symbols from the current position. A target-anchored virtual start is spliced in at cruise speed (invisible to the eye), so the result symbols naturally decelerate into view during the final phase — no visual discontinuity at the landing.
- **Stop continuity.** Quick stop captures the fractional sub-symbol offset at the moment of interruption and blends it out over the shortened duration — no visual discontinuity.
- **Sprite reuse.** The reel renders with a fixed pool of 6 sprites. No allocations during spin; only texture swaps and position updates per frame.
- **Numerical stability.** Floating-point snapping with epsilon guards prevents index drift at wrap boundaries. All strip indices are wrapped to `[0, STRIP_LENGTH)`.

## Controls

| Input | Action |
|---|---|
| Click button | Start spin |
| Click during spin | Quick stop |
| `D` key | Toggle debug overlay |

## Running Locally

```
npm install
npm run dev
```

Production build:

```
npm run build
npm run preview
```

## Notes

The implementation prioritizes correctness, readability, and maintainability over scope.

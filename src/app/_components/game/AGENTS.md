# AGENTS — `src/app/_components/game/`

> Scoped agent rules for the 3D darts mini-game.
> Read the root `AGENTS.md` first, then this file before editing anything in this directory.

## Architecture

The game is a single-page Three.js scene rendered via `@react-three/fiber`. All state flows through a reducer + context; no component holds game logic locally.

| File | Role |
|------|------|
| `game-page.tsx` | Top-level client wrapper: mounts `GameProvider`, `LocaleProvider`, the canvas, and the name dialog. |
| `game-context.tsx` | `GameProvider` + `useGame()`. Holds the `reducer`, action dispatchers, and the `inputRef` (flight impulses). Persists each completed round to Supabase once. |
| `types.ts` | `DartOutcome`, `GameState`, `GameAction`, `Direction`, `FlightInput`. |
| `dart-logic.ts` | Pure dartboard geometry/scoring: wedge numbers, board position, `randomOutcome()`, `computeOutcomeFromBoardPosition()`. |
| `game-canvas.tsx` | `<Canvas>` setup: camera, lights, fog, OrbitControls, scene contents. |
| `dartboard-model.tsx` | 3D dartboard mesh (rings, wedges, number labels). |
| `darts.tsx` | 3 dart meshes + flight physics (`useFrame`). Spawns, steers, lands, calls `dartLanded`. |
| `game-hud.tsx` | Canvas-texture HUD: total score, round summary, throw button. |
| `game-controls.tsx` | Input: on-screen arrow buttons, keyboard, full-screen touch steering. Blocks OrbitControls while interacting. |
| `game-result.tsx` | Round-result popup with "next throw" button. |
| `game-leaderboard.tsx` | Live top-throws leaderboard panel (reads `game_throw`). |
| `leaderboard-api.ts` | Supabase browser client calls + `useTopThrows` hook. |
| `name-dialog.tsx` | MUI dialog for entering the player name before first throw. |

## Rules

- **Every 3D component must start with `"use client"`.** Three.js / R3F touch the browser.
- Keep geometry/scoring logic in `dart-logic.ts` as pure functions. Components only consume them.
- All game state transitions go through `dispatch({ type: ... })` — never mutate `state` directly.
- Textures and materials that never change are created **once at module scope** (e.g. `steelMat`, `getNumberTexture` cache). Do not recreate them per render/frame.
- `useFrame` callbacks must be cheap: read from refs, avoid allocations, early-out when inactive.
- The `inputRef` (impulses + held directions) is intentionally a ref, not state, so steering does not trigger re-renders.
- Round persistence (`saveThrow`) fires from a `useEffect` keyed on `state.leaderboardDirtyKey` to guarantee exactly one write per completed round.
- OrbitControls must be disabled while the user is steering a dart; re-enable on release. Use the `useOrbitBlock` helper.
- Dart physics constants (`FORWARD_V0`, `IMPULSE_V`, `DAMP`, ...) are tuned by feel — change one at a time and test in the browser.

## Performance

- Canvas textures are cached in module-level `let` singletons (`hudResources`, `lbResources`, `arrowCache`, `numberTextureCache`). Respect the cache; do not bypass it.
- Dart meshes are hidden via `visible = false` and moved off-screen rather than unmounted, so they can be reused across rounds without re-creating geometry.

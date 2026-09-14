# Architecture

This page explains how the engine's modules fit together. The starting point for
terminology and fields is `src/js/main.ts`.

## The public barrel

`src/index.ts` re-exports every engine module, so consumers can either import
from deep paths (`src/js/functions.ts`) or from the barrel:

```ts
export * from "./js/classes.ts" // entity(object), hitboxes, button, slider, camera, timeout, sound
export * from "./js/events.ts" // on / emit / off
export * from "./js/functions.ts" // setup, clear, draw helpers, math
export * from "./js/listeners.ts" // input state + hitbox queries
export * from "./js/loader.ts" // asset loading
export * from "./js/main.ts" // engineState, time, screen, canvas, ctx, registries
export * from "./js/types.ts" // shared types + DEG_TO_RAD
```

There is no runtime build step for the engine itself — it is plain TypeScript
consumed through Vite. The engine is zero-runtime-dependency vanilla DOM / Canvas.

## Module map

```
src/js/main.ts          state singleton (engineState, time, screen), exports,
                        canvas + ctx, asset registries, registerPlugin
src/js/events.ts        typed event wrapper over window Events
src/js/loader.ts        asset loading + readiness loop (reads main.ts state)
src/js/functions.ts     setup() + the game loop, clear, drawText, shake, math
                        (imports loader for waitForLoad, main for state)
src/js/listeners.ts     keyboard/mouse/touch handlers, hitbox query helpers
                        (imports functions for distance/setup, main for state)
src/js/types.ts         shared types (platform — no runtime imports)
src/js/classes.ts       barrel over src/js/classes/*
src/js/classes/entity.ts   base drawable entity (exported as object)
src/js/classes/hitbox.ts   colliders (+ collision tests)
src/js/classes/button.ts   clickable button (extends entity)
src/js/classes/slider.ts   slider + sliderv over an internal _slider
src/js/classes/camera.ts   canvas crop + scaled replay camera
src/js/classes/timeout.ts  timed self-resetting boolean
src/js/classes/sound.ts    sound + multiSound audio players
src/js/classes/utils.ts    applyTexture, clamp
```

## Central mutable state

Almost everything flows through three singletons created in `src/js/main.ts`:

| Singleton     | Role                                                                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `engineState` | the mutable engine registry: arrays of objects/buttons/sliders/hitboxes/cameras/soundPlayers/plugins plus the asset counters and lifecycle flags |
| `time`        | per-frame timing (deltaTime, fixedDeltaTime, time, frameCount)                                                                                   |
| `screen`      | DOM/canvas handles: the canvas element, its 2d context, document/body refs, loading-screen elements and root computed styles                     |

The class modules push their instances into `engineState` in their constructors
(objects, buttons, sliders, hitboxes, cameras, sound players), which is what lets
the game loop and the GUI discover and manage them. Because these are plain
arrays, ordering follows creation order.

## Import-time side effects

Importing engine modules mutates the world immediately. This matters because
setup and behavior depend on it:

- `main.ts` import creates the `<canvas>` element and its 2d context, snapshots
  `:root` computed styles, and looks up the loading-screen DOM elements.
- `loader.ts` import starts a `setInterval` (every 100ms) that updates the loading
  bar and flips `engineState.assetsLoaded` when all requested assets are done.
- `listeners.ts` import registers all global `window`/canvas event listeners and
  creates the persistent `"mouse"` pointer.

So even before `setup()` is awaited, input handlers are attached and the loading
bar is ticking.

## Dependency direction

The layering is roughly:

- `types.ts` — pure types, imported everywhere (no dependencies).
- `events.ts` — depends only on `window`.
- `main.ts` — state home; imports only types + events.
- `loader.ts` — reads `main.ts` state, emits events.
- `functions.ts` — the "runner" (loop, setup); imports `types`, `main`, `events`, `loader`.
- `listeners.ts` — input; imports `functions` (for `distance`, `setup`) and `main`.
- `classes/*` — entities/UI; import `main`, `functions` (drawText), `listeners`
  (isClicking/isHovering), and `types`.
- `plugins/*` — side-effect modules that call `registerPlugin`; import `main` /
  `events` / types, and (for GUI) `functions`, `listeners`.

There is one notable circularity: `functions.setup` re-scales the canvas on
`resize` (registered by `listeners.ts`), and `listeners.ts` imports `setup` from
`functions.ts`. ES modules tolerate this since `setup` is only _called_ at
runtime, not at module-evaluation time.

## Types and naming

- `Vec2` is `[number, number]`, used everywhere for positions and sizes
  (`[x, y]` and `[width, height]`).
- The `entity` class is exported under the runtime name **`object`** (its original
  public API name) because `object` cannot be a class declaration identifier in
  TypeScript (`src/js/classes/entity.ts:159-161`).
- Sliders share one internal `_slider` class; `slider` (horizontal) and `sliderv`
  (vertical) are thin subclasses that pass the orientation (`src/js/classes/slider.ts:56-423`).

## Plugin architecture

Plugins are side-effect modules: importing them calls `registerPlugin(info)` which
pushes a `PluginInfo` into `engineState.plugins` and emits `newPlugin`
(`src/js/main.ts:75-78`). The GUI listens for `newPlugin` to refresh its plugin
panel live. See [plugins](14-plugins.md).

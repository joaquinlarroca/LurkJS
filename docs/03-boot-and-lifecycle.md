# Boot and lifecycle

This page walks through everything that happens from page load to the first frame,
and how objects get disposed.

## 1. Module evaluation (page load)

Importing the engine modules has side effects, in this order:

1. **`main.ts`** creates the canvas element and 2d context, snapshots `:root`
   computed styles, resolves `#_loading_screen` / `#_loading_bar` (which may be
   `null` — see [getting-started](01-getting-started.md)), and seeds
   `engineState.plugins` with an entry for the engine itself ("LurkJS plugin
   support"). (`src/js/main.ts:102-117`)
2. **`loader.ts`** starts a `setInterval` that runs every **100ms**:
    - computes the loaded percentage (`assetsToLoadDone / assetsToLoadCount`); if
      no assets were requested it reads as 100%,
    - repaints `--loading-bar` `background` as a linear gradient
      (`--loading-bar-done-color` up to the percent, then `--loading-bar-color`),
    - when `assetsToLoadCount === assetsToLoadDone` it sets
      `engineState.assetsLoaded = true` and clears the interval,
    - then fades the loading screen: after **200ms** sets `opacity: 0`, after a
      further **300ms** sets `display: none`.
      (`src/js/loader.ts:14-35`)
3. **`listeners.ts`** attaches all keyboard/mouse/touch/resize/blur/contextmenu
   handlers and creates the persistent `"mouse"` pointer. Input is live from this
   moment, even before `setup()`. (`src/js/listeners.ts:37-321`)

## 2. `setup()` — canvas and loop start

`setup(width, height, marginMultiplier = 1, targetFixedFps = 60)` is async
(`src/js/functions.ts:16-128`).

**First call only:**

1. Sets the canvas' internal resolution to `width × height`
   (`screen.canvas.width/height`).
2. Loads the built-in `noTexture` placeholder image into the `images` registry.
3. `await waitForLoad()` — resolves once `engineState.assetsLoaded` is true.
   While waiting, the loading bar keeps being repainted by the interval.
4. When assets are done and the engine has not started yet, `waitForLoad` queues
   `engineState.started = true` and emits **`started`** on the next tick
   (`setTimeout(..., 0)`). Callbacks subscribed to `on("started")` run here.
   (`src/js/loader.ts:38-55`)

**Every call (including re-entry from the resize handler):**

5. Clamps out-of-range `marginMultiplier` (`< 0` or `> 1` → `1`).
6. Computes an **aspect-fit** size so the canvas fits inside the viewport
   (`clientWidth`/`clientHeight`), then multiplies both dimensions by
   `marginMultiplier` (so `0.99` leaves a small edge). The canvas' internal
   resolution never changes — only its CSS display size.
7. Sets `imageSmoothingEnabled = false` on the context (pixelated scaling).
8. On first call only: appends the canvas to `engineState.appendTo`
   (default `document.body`), records the margin multiplier, marks
   `engineState.setUp = true` and starts the `requestAnimationFrame` loop.

The `resize` handler in `listeners.ts:51-53` calls `setup` again with the canvas'
current resolution and stored margin multiplier, so the canvas re-fits the window
without restarting the loop.

## 3. The started flag and events

- `engineState.started` becomes `true` only after assets finish loading, via
  `waitForLoad`. It is not driven by the rAF loop.
- The first frame can run before `started` — the loop starts immediately after
  setup; `on("started")` just fires when loading finished.
- The loop's own lifecycle events are `update`, `fixedUpdate`, `afterUpdate`
  (see [game-loop](04-game-loop.md)).

## 4. Disposal: `destroy()` and the per-frame sweep

Every constructible has `destroy()` which sets `toDelete = true`:

| Class                          | File                                   |
| ------------------------------ | -------------------------------------- |
| `entity` / `object`, `button`  | `src/js/classes/entity.ts:134-136`     |
| `slider` / `sliderv` (_slider) | `src/js/classes/slider.ts:358-366`     |
| `camera`                       | `src/js/classes/camera.ts:72-74`       |
| `sound`, `multiSound`          | `src/js/classes/sound.ts:55-57, 96-98` |

At the **end of every frame**, right after the events fire, the loop sweeps the
registries (`src/js/functions.ts:88-122`):

1. If any entity or slider is doomed, it re-filters:
    - `engineState.objects` removes doomed entities,
    - `engineState.buttons` removes doomed entities (buttons are entities),
    - `engineState.hitboxes` removes any hitbox whose `entry.object` is a doomed
      entity **or** a doomed slider,
    - `engineState.sliders` removes doomed sliders.
2. `engineState.cameras` is filtered for `toDelete`.
3. `engineState.soundPlayers` is filtered for `toDelete`.

So `destroy()` takes effect at the next frame boundary, not immediately.

### Special case: sliders

`slider.destroy()` **also** removes both of its hitboxes (track + thumb) from
`engineState.hitboxes` immediately (`src/js/classes/slider.ts:360-364`). This is
because the thumb hitbox is owned by `this.thumb`, a plain object, not by the
slider — the generic sweep would not match it. The track hitbox is owned by the
slider (a doomed slider), so it would be caught anyway; both are spliced out
eagerly for correctness and immediacy.

## 5. Behavior summary (cheat sheet)

- Closing/never-including the loading markup is fine — the engine guards every
  loading DOM access with `?`/null checks.
- `setup()` may be called multiple times (resize) — it only re-sizes; it never
  re-creates or re-starts the loop.
- `setup()` is idempotent for the loop, but the _canvas sizing block_ runs on
  every invocation.
- `started` fires once, `setTimeout 0` after loading completes.
- Nothing auto-removes an object with `toDelete` outside of the frame sweep;
  `destroy()` on an unstarted engine still works (the loop sweeps once started).

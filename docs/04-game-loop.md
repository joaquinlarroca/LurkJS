# Game loop and timing

The game loop lives entirely inside `setup()` in `src/js/functions.ts:16-128`.

## The loop

Once started (first `setup()` call), the loop runs via
`requestAnimationFrame(update)` every frame:

```ts
function update(currentTimestamp: number) {
    time.frameCount += 1
    const deltaTime = (currentTimestamp - timestamp) / 1000
    time.deltaTime = deltaTime
    time.time += deltaTime
    if (deltaTime > 0) engineState.fps = Number((1 / deltaTime).toFixed(0))
    timestamp = currentTimestamp

    accumulator += deltaTime
    let steps = 0
    while (accumulator >= fixedDeltaTime && steps < MAX_FIXED_STEPS) {
        time.fixedDeltaTime = fixedDeltaTime
        emit("fixedUpdate")
        accumulator -= fixedDeltaTime
        steps += 1
    }
    if (steps >= MAX_FIXED_STEPS) accumulator = 0 // drop leftover time

    emit("update")
    emit("afterUpdate")

    // ...dispose sweep (see boot-and-lifecycle)...
    requestAnimationFrame(update)
}
```

## Event order per frame

Within a single frame the engine emits, in order:

1. **`fixedUpdate`** — zero or more times (see accumulator below).
2. **`update`** — exactly once.
3. **`afterUpdate`** — exactly once; conventionally used for debug/HUD drawing
   that must appear on top (the GUI plugin draws its overlays here).

## Timing state (`time`)

| Field                 | Meaning                                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------------------- |
| `time.frameCount`     | increments once per rendered frame                                                                        |
| `time.deltaTime`      | seconds since the previous frame (`(now - prev) / 1000`)                                                  |
| `time.time`           | accumulated seconds since the loop started                                                                |
| `time.fixedDeltaTime` | the **constant** `1 / targetFixedFps` (e.g. `1/60`); used inside `fixedUpdate` for physics-style stepping |
| `engineState.fps`     | `round(1 / deltaTime)` for the previous frame; `0` until the second frame                                 |

`time.fixedDeltaTime` is set to the target constant on every fixed step — it is
**not** the measured wall-clock of the previous fixed tick.

## The fixed-timestep accumulator

- `fixedDeltaTime = 1 / targetFixedFps` is computed once when the loop starts
  (default `targetFixedFps = 60`).
- Each rendered frame adds `deltaTime` to an `accumulator`.
- While the accumulator holds at least one fixed step (`>= fixedDeltaTime`), the
  engine emits `fixedUpdate` and subtracts the step. A slow frame can therefore
  produce several `fixedUpdate` emissions in one visual frame — logic that must
  run at a constant rate (movement, physics) belongs here.
- **Spiral of death guard:** `MAX_FIXED_STEPS = 10`. If a single visual frame
  would need more than 10 fixed steps (e.g. after a long tab-pause), the loop
  emits up to 10 and then **discards the remaining accumulated time** so the
  catch-up cannot spiral. This means a huge frame gap will drop fixed steps rather
  than replay them.
- `time.time` and `time.deltaTime` only advance with rendered frames, so they are
  smooth in `update` but stepped inside `fixedUpdate` integration.

## Event dispatch mechanics

`emit(event)` dispatches a plain `new Event(event)` on `window`
(`src/js/events.ts:5-7`). `on(event, cb)` is `window.addEventListener`, so legacy
code that used `window.addEventListener("update", ...)` directly keeps working.
Because the events are plain DOM events, any page-level listener hears them too.

## Disposal sweep ordering

The sweep that removes `toDelete` objects, sliders, cameras and sound players runs
**after** `afterUpdate`, once per frame (see
[boot-and-lifecycle](03-boot-and-lifecycle.md#4-disposal-destroy-and-the-per-frame-sweep)).

## Behavior notes

- `update` is emitted before `requestAnimationFrame(update)` is re-queued, so
  there is no loop-skew: the next frame's `frameCount` increments first.
- `engineState.fps` is derived from `deltaTime`, so backgrounded tabs report ~0.
- Loading completion is decoupled from the loop: the loop can render frames before
  `started` fires (see [boot-and-lifecycle](03-boot-and-lifecycle.md)).

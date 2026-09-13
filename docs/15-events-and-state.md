# Events and global state

## Events — `src/js/events.ts`

A typed wrapper over plain DOM events dispatched on `window`:

```ts
type EngineEventName = "update" | "fixedUpdate" | "afterUpdate" | "started" | "newPlugin"

emit(event) // window.dispatchEvent(new Event(event))
on(event, callback) // window.addEventListener(event, callback)
off(event, callback) // window.removeEventListener(event, callback)
```

| Event         | Emitted by       | When                                                                                 |
| ------------- | ---------------- | ------------------------------------------------------------------------------------ |
| `fixedUpdate` | the game loop    | one or more times per frame on the fixed timestep (see [game-loop](04-game-loop.md)) |
| `update`      | the game loop    | once per rendered frame                                                              |
| `afterUpdate` | the game loop    | once, right after `update` (debug/HUD layer)                                         |
| `started`     | `waitForLoad`    | once, when asset loading completes (queued `setTimeout 0`)                           |
| `newPlugin`   | `registerPlugin` | every plugin registration                                                            |

Because they are plain `Event`s, `window.addEventListener("update", ...)` works
too, and page-level listeners hear everything. `on`/`off` are type-safe passthroughs.

## `engineState` — `src/js/main.ts:18-72`

The one mutable registry. All class constructors push into it; the game loop and
GUI read it.

| Field                | Type                      | Meaning                                                                               |
| -------------------- | ------------------------- | ------------------------------------------------------------------------------------- |
| `appendTo`           | `HTMLElement`             | where the canvas is appended (default `document.body`)                                |
| `disableMouseEvents` | `boolean`                 | when true, mousedown/move are ignored (auto toggled by canvas `mouseover`/`mouseout`) |
| `assetsToLoadCount`  | `number`                  | requested assets, incremented per `loadImage/Sound/Font`                              |
| `assetsToLoadDone`   | `number`                  | completed (or failed) assets                                                          |
| `assetsLoaded`       | `boolean`                 | true when `Count === Done` (set by the loader interval)                               |
| `started`            | `boolean`                 | true once asset loading finished (`waitForLoad`)                                      |
| `setUp`              | `boolean`                 | true once the loop has been started                                                   |
| `loopStarted`        | `boolean`                 | _reserved/unused currently_                                                           |
| `fixedLoopStarted`   | `boolean`                 | _reserved/unused currently_                                                           |
| `shakingScreen`      | `boolean`                 | true while `shakeScreen` is active                                                    |
| `canvas`             | `{ marginMultiplier }`    | the stored fit margin                                                                 |
| `fps`                | `number`                  | `round(1 / deltaTime)` of the previous frame                                          |
| `hitboxes`           | `hitbox[]`                | every registered collider                                                             |
| `objects`            | `entity[]`                | every `object`/`button` (typed `entity[]`)                                            |
| `buttons`            | `button[]`                | every button                                                                          |
| `sliders`            | `(slider \| sliderv)[]`   | every slider                                                                          |
| `cameras`            | `camera[]`                | every camera                                                                          |
| `soundPlayers`       | `(sound \| multiSound)[]` | every audio player                                                                    |
| `plugins`            | `PluginInfo[]`            | registered plugins (seeded with the engine itself)                                    |

The arrays are **bookkeeping**, not render lists — the engine never draws them
automatically; it manages lifecycle, GUI counts and disposal from them.

## `time` — `src/js/main.ts:88-99`

| Field            | Meaning                                    |
| ---------------- | ------------------------------------------ |
| `frameCount`     | rendered frames since the loop started     |
| `deltaTime`      | seconds since the last frame               |
| `time`           | accumulated seconds since the loop started |
| `fixedDeltaTime` | the constant `1 / targetFixedFps`          |

See [game-loop](04-game-loop.md) for semantics.

## `screen` — `src/js/main.ts:104-117`

Dangling handles for the DOM:

| Field                | Meaning                                               |
| -------------------- | ----------------------------------------------------- |
| `doc`                | `document.documentElement`                            |
| `body`               | `document.body`                                       |
| `loading.background` | `#_loading_screen` or `null` (optional load markup)   |
| `loading.bar`        | `#_loading_bar` or `null`                             |
| `css.root`           | `:root` element                                       |
| `css.computedStyles` | the `:root` computed style snapshot (taken at import) |
| `canvas`             | the engine `<canvas>` element                         |
| `context`            | its 2d context                                        |

## `canvas` / `ctx`

`canvas` is created in `main.ts` at import and `ctx = canvas.getContext("2d")!`.
The demo draws directly via `import { ctx }` (e.g. `ctx.fillStyle = "white"`) and
uses `update`/`draw` helpers for everything else. Both are on `screen` too.

## Asset registries — `src/js/main.ts:81-85`

```ts
images: Record<string, HTMLImageElement>
sounds: Record<string, HTMLAudioElement>
fonts: Record<string, FontFace>
```

Populated by `loadImage` / `loadSound` / `loadFont`. `setup()` pre-loads
`images["noTexture"]` (the placeholder). See [assets](05-assets.md) and
[textures](06-textures.md).

## `engine` — `src/js/main.ts:15`

```ts
export const engine = { name: "LurkJS", version: "0.0.1" }
```

## `registerPlugin` — `src/js/main.ts:75-78`

Pushes into `engineState.plugins` and emits `newPlugin` (see [plugins](14-plugins.md)).

## Input surface

Keyboard and pointer state live in `src/js/listeners.ts`: `preventKeys`,
`pressedKeys`, `mouse`, `pointers` — see [input](07-input.md).

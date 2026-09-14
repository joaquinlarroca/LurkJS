# Full API reference

Every symbol exported by the public entry point `src/index.ts` (which re-exports
`classes`, `events`, `functions`, `listeners`, `loader`, `main`, `types`), plus
the plugin classes (reached by importing the plugin modules directly).

## `src/js/main.ts` — state, canvas, plugins

| Symbol           | Signature                                      | Notes                                                                   |
| ---------------- | ---------------------------------------------- | ----------------------------------------------------------------------- |
| `engine`         | `{ name: "LurkJS", version: "0.0.1" }`         | engine metadata                                                         |
| `engineState`    | `EngineState`                                  | mutable global registry; see [events-and-state](15-events-and-state.md) |
| `registerPlugin` | `(plugin: PluginInfo) => void`                 | push + emit `newPlugin`                                                 |
| `images`         | `Record<string, HTMLImageElement>`             | loaded image registry                                                   |
| `sounds`         | `Record<string, HTMLAudioElement>`             | loaded audio registry                                                   |
| `fonts`          | `Record<string, FontFace>`                     | loaded font registry                                                    |
| `time`           | `TimeState`                                    | `frameCount`, `deltaTime`, `time`, `fixedDeltaTime`                     |
| `canvas`         | `HTMLCanvasElement`                            | the engine canvas (created at import)                                   |
| `ctx`            | `CanvasRenderingContext2D`                     | canvas 2d context (non-null)                                            |
| `screen`         | see [events-and-state](15-events-and-state.md) | DOM handles + loading refs + computed styles                            |
| `EngineState`    | interface                                      | exported for typing                                                     |
| `TimeState`      | interface                                      | exported for typing                                                     |

## `src/js/events.ts`

| Symbol            | Signature                                                                |
| ----------------- | ------------------------------------------------------------------------ |
| `EngineEventName` | `"update" \| "fixedUpdate" \| "afterUpdate" \| "started" \| "newPlugin"` |
| `emit`            | `(event: EngineEventName) => void`                                       |
| `on`              | `(event: EngineEventName, callback: () => void) => void`                 |
| `off`             | `(event: EngineEventName, callback: () => void) => void`                 |

## `src/js/functions.ts`

| Symbol             | Signature                                                                                                                                                                    | Notes                                                                               |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `setup`            | `(width: number, height: number, marginMultiplier?: number, targetFixedFps?: number) => Promise<void>`                                                                       | creates canvas, fits to window, starts loop; awaits assets on first call            |
| `clear`            | `() => void`                                                                                                                                                                 | fills canvas with `--canvas-bg` (fallback `#000`)                                   |
| `drawText`         | `(text?: string, [x, y]?: Vec2, fontSize?: number, fontFamily?: string, baseline?: CanvasTextBaseline, textAlign?: CanvasTextAlign, angle?: number, alpha?: number) => void` | defaults `"undefined"`, `[0,0]`, `24`, `"sans-serif"`, `"top"`, `"start"`, `0`, `1` |
| `measureTextWidth` | `(text: string \| number, fontSize: number, fontFamily: string) => number`                                                                                                   |                                                                                     |
| `distance`         | `(x1,y1,x2,y2) => number`                                                                                                                                                    | Euclidean                                                                           |
| `lerp`             | `(start,end,t) => number`                                                                                                                                                    | unclamped                                                                           |
| `shakeScreen`      | `(intensity: number, duration: number) => void`                                                                                                                              | coalescing transform jitter                                                         |
| `isValidColor`     | `(color: string) => boolean`                                                                                                                                                 | CSS parse test                                                                      |
| `getTimeElapsed`   | `(startTime: number) => string`                                                                                                                                              | `"MM:SS"`                                                                           |

## `src/js/loader.ts`

| Symbol        | Signature                                                   | Notes                                                  |
| ------------- | ----------------------------------------------------------- | ------------------------------------------------------ |
| `waitForLoad` | `() => Promise<void>`                                       | resolves when `assetsLoaded`; fires `started` once     |
| `loadImage`   | `(url: string, name?: string) => Promise<HTMLImageElement>` | cached + deduped; stores at `images[name ?? url]`      |
| `loadSound`   | `(url: string, name?: string) => Promise<HTMLAudioElement>` | resolves on `canplay`; stores at `sounds[name ?? url]` |
| `loadFont`    | `(url: string, name: string) => Promise<FontFace>`          | requires name; `document.fonts.add` on success         |

## `src/js/listeners.ts`

| Symbol         | Signature                                                      | Notes                                                                         |
| -------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `preventKeys`  | `ReadonlySet<string>`                                          | `Control,Alt,Meta,Enter,Tab,F1-F12` (preventDefault only when canvas focused) |
| `pressedKeys`  | `Set<string>`                                                  | held keys, uppercased                                                         |
| `keyPressed`   | `(key: string) => boolean`                                     | `"space"`→`" "`; uppercases                                                   |
| `mouse`        | `{ x, y, down, show, preventRightClick }`                      | `show` getter/setter toggles cursor                                           |
| `pointers`     | `Record<string, Pointer>`                                      | always has `"mouse"`                                                          |
| `isHovering`   | `(hitbox: HitboxLike) => boolean`                              | any pointer over                                                              |
| `isClicking`   | `(hitbox: HitboxLike, disablePointerSet?: boolean) => boolean` | edge-triggered; consumes by default                                           |
| `isPointer`    | `(hitbox: HitboxLike) => Pointer \| undefined`                 | first pointer over                                                            |
| `drawPointers` | `() => void`                                                   | debug red squares                                                             |

## `src/js/types.ts`

| Symbol          | Signature                                                                          |
| --------------- | ---------------------------------------------------------------------------------- |
| `DEG_TO_RAD`    | `0.017453292519943295`                                                             |
| `Vec2`          | `[number, number]`                                                                 |
| `HitboxType`    | `"hitbox-rect" \| "hitbox-rect-fixed" \| "hitbox-circle" \| "hitbox-circle-fixed"` |
| `HitboxLike`    | structural collider interface                                                      |
| `ColliderOwner` | `{ x, y, width, height, halfwidth?, halfheight? }`                                 |
| `TextureArg`    | `string \| HTMLImageElement \| null \| undefined`                                  |
| `TextureState`  | `{ usingColor, color, texture }`                                                   |
| `Pointer`       | `{ key, type: "mouse"\|"touch", down, attached?, x, y }`                           |
| `PluginInfo`    | `{ name, version, author, description, path, config }`                             |

## `src/js/classes.ts` — constructibles and helpers

### entities

| Symbol                           | Signature                                                                                                                              | Notes                                |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `entity` / `object`              | `new object(texture: TextureArg, [x,y]?: Vec2, [w,h]?: Vec2)`                                                                          | base drawable; exported as `object`  |
| ― `.update()`                    | `() => void`                                                                                                                           | refresh half-sizes + anchor          |
| ― `.draw()`                      | `() => void`                                                                                                                           | textured/colored rounded-rect sprite |
| ― `.collidesWith(other: entity)` | `() => boolean`                                                                                                                        | any-hitbox vs any-hitbox             |
| ― `.setTexture(texture)`         | `(texture: TextureArg) => void`                                                                                                        |                                      |
| ― `.destroy()`                   | `() => void`                                                                                                                           | `toDelete = true` (frame sweep)      |
| ― `.angleToPoint(point: Vec2)`   | `() => void`                                                                                                                           | degrees, from center                 |
| ― `.move(steps: number)`         | `() => void`                                                                                                                           | along current `angle`                |
| ― fields                         | `x,y,width,height,halfwidth,halfheight,offset,anchor,angle,scale,alpha,borderRadius,stroke,usingColor,color,texture,hitboxes,toDelete` |                                      |

### hitboxes

| Symbol                        | Signature                                                                                                                        |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `hitbox`                      | `new hitbox(owner, sizeMultiplier?)` or `new hitbox(position: Vec2, size: Vec2)` or `new hitbox(position: Vec2, radius: number)` |
| `hitboxFixed`                 | `(position: Vec2, size: Vec2)`                                                                                                   |
| `hitboxCircle`                | `(owner, sizeMultiplier? = 1)`                                                                                                   |
| `hitboxCircleFixed`           | `(position: Vec2, radius? = 32)`                                                                                                 |
| `.updateDimensions()`         | `() => void`                                                                                                                     |
| `.collide(other: HitboxLike)` | `() => boolean`                                                                                                                  |
| `.draw()`                     | `() => void`                                                                                                                     |
| `HitboxList`                  | `hitbox[] & { draw(): void }`                                                                                                    |

### button

| Symbol                               | Signature                                                                  |
| ------------------------------------ | -------------------------------------------------------------------------- |
| `button`                             | `(texture, [x,y], [w,h], [text, color, size, fontFamily], timeVal? = 500)` |
| — `.update()` `.draw()` `.destroy()` | overrides entity                                                           |
| — fields                             | `clicked`, `hovered`, `disabled`, `text: ButtonText`, `timeout`            |
| `ButtonText`                         | `{ text, color, size, fontFamily, align, baseline, pos }`                  |

### sliders

| Symbol                                                              | Signature                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `slider`                                                            | `(bgTexture, thumbTexture, fillTexture, [x,y], [w,h], thumbWidth, [min, max], currentValue, step?)`                                                                                                                                                 |
| `sliderv`                                                           | same, `thumbHeight` for the vertical axis                                                                                                                                                                                                           |
| — `.update()` `.draw()` `.setTexture(bg, thumb, fill)` `.destroy()` |                                                                                                                                                                                                                                                     |
| — fields                                                            | `orientation`, `percentage`, `minpercentage`, `maxpercentage`, `step`, `thumb: SliderThumb`, `background: SliderPart`, `fill: SliderPart & {inverted}`, `hover`, `click`, `blocked` (via `thumb.blocked`), `drag`, `angle`, `alpha`, `borderRadius` |
| `SliderPart`                                                        | `{ usingColor, color, texture }`                                                                                                                                                                                                                    |
| `SliderThumb`                                                       | `SliderPart & { x,y,width,height,blocked,borderRadius }`                                                                                                                                                                                            |
| `DragState`                                                         | `{ hasSet, pointer?, offset }`                                                                                                                                                                                                                      |
| `drawPart`                                                          | `(screen: {context}, part: SliderPart, x, y, w, h) => void`                                                                                                                                                                                         |

### camera

| Symbol                                               | Signature                                                  |
| ---------------------------------------------------- | ---------------------------------------------------------- |
| `camera`                                             | `([x,y,w,h], [vx,vy,vw,vh])` dest rect + viewport src rect |
| — `.crop()` `.draw()` `.drawCropArea()` `.destroy()` |                                                            |
| — fields                                             | `snapshot`, `viewport`, `x,y,width,height`, `toDelete`     |

### timeout

| Symbol       | Signature                                                                |
| ------------ | ------------------------------------------------------------------------ |
| `timeout`    | `new timeout(time? = 1000)`                                              |
| — `.start()` | no-op while active                                                       |
| — fields     | `time`, `active`, `currentTime`, `timeLeft`, `timeElapsed`, `updateTime` |

### sound

| Symbol                                                                   | Signature                                                       |
| ------------------------------------------------------------------------ | --------------------------------------------------------------- |
| `sound`                                                                  | `(audioSrc, playbackRate?, volume?, loop?)`                     |
| — `.play()` `.pause()` `.stop()` `.setCurrentTime(seconds)` `.destroy()` |                                                                 |
| — fields                                                                 | `audio`, `canplay`, `ended`, `currentTime`, `toDelete`          |
| `multiSound`                                                             | `(audioSrc, playbackRate?, volume?)`                            |
| — `.play()` (clone per call) `.stopAll()` `.destroy()`                   |                                                                 |
| — fields                                                                 | `playbackRate`, `volume`, `audioSrc`, `audioClones`, `toDelete` |

### utils

| Symbol         | Signature                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------ |
| `applyTexture` | `(target: TextureState, texture: TextureArg, fallback: HTMLImageElement \| null = null) => void` |
| `clamp`        | `(value, min, max) => number`                                                                    |

## Plugin exports

### `src/plugins/gui/gui.ts`

| Symbol | Notes                                                                                                                                                                |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `gui`  | `{ info, debugInfo, debugTab, debugResizeHandle, debugContainer, leftContainer, middleContainer, thirdContainer, stats, toggleButton, numberConfig, pluginDisplay }` |

### `src/plugins/particles/particles.ts`

| Symbol              | Signature                                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `Particle`          | `(x, y, size, color, speedX, speedY, lifespan, alphaReducer)`; `.update()` `.draw()`                                      |
| `ParticleGenerator` | `(x, y, particleCount, sizeRange, color, speedY, speedX, lifespanRange, alphaReducer)`; `.update()` `.create()` `.draw()` |

### `src/plugins/localStorage/ls.ts`

| Symbol               | Signature                                                   |
| -------------------- | ----------------------------------------------------------- |
| `localStoragePlugin` | `{ set(name, val) => string, get(name) => string \| null }` |

### `src/plugins/synth/synth.ts`

| Symbol      | Signature                                                   |
| ----------- | ----------------------------------------------------------- |
| `tone`      | `(frequency, duration = 0.15, type = "sine", volume = 0.2)` |
| `coinTone`  | `(step = 0)`                                                |
| `boomTone`  | `()`                                                        |
| `shootTone` | `()`                                                        |
| `clickTone` | `()`                                                        |

### `src/plugins/confetti/confetti.ts`

| Symbol     | Signature                                                            |
| ---------- | -------------------------------------------------------------------- |
| `confetti` | `{ burst(x, y, count?, spread?), rain(duration?, total?), clear() }` |

### `src/plugins/screenshot/screenshot.ts`

| Symbol           | Signature                |
| ---------------- | ------------------------ |
| `screenshot`     | `(filename?) => void`    |
| `copyScreenshot` | `() => Promise<boolean>` |

## Notes on consumption

- Everything above can be imported from `src/index.ts` (or the compiled package
  entry) **except** the plugin classes, which live in the plugin modules and are
  imported for both classes and side-effect registration.
- TS consumers: use `.ts` extensions in dev imports (`allowImportingTsExtensions`);
  the build (`tsc --noEmit && vite build`) resolves them via Vite.
- The `object`/`entity` naming: `object` is the public class name (`entity` is the
  internal declaration name, exported under `object`).

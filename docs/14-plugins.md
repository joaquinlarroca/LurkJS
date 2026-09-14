# Plugins

Plugins are self-registering side-effect modules. Importing one registers it with
the engine and hands it metadata the GUI can display.

## The plugin system

### Registering

`registerPlugin(plugin: PluginInfo)` (`src/js/main.ts:75-78`):

```ts
export function registerPlugin(plugin: PluginInfo): void {
    engineState.plugins.push(plugin)
    emit("newPlugin")
}
```

- Pushes the `PluginInfo` into `engineState.plugins`, **then** emits `newPlugin`.
- `PluginInfo` (`src/js/types.ts:57-64`): `name`, `version`, `author`,
  `description`, `path`, `config: Record<string, unknown>`.
- `engineState.plugins` is pre-seeded with an entry for the engine itself — the
  built-in "LurkJS plugin support" (`src/js/main.ts:62-71`).

### Listing

The GUI reads `engineState.plugins` to render its plugin panel. Because
`registerPlugin` emits `newPlugin` _after_ the push, the GUI can respond to fresh
registrations live — see the GUI's `on("newPlugin")` below. Consumers can also
read `engineState.plugins` directly at any time.

### Icons

Each plugin folder ships an `icon.png`. The GUI resolves it with
`import.meta.glob("../*/icon.png")` and falls back to `no-icon.png`
(`src/plugins/gui/gui.ts:10-20`).

## Built-in plugins

There are six, all under `src/plugins/`:

| Module         | Registers as    | Purpose                                                               |
| -------------- | --------------- | --------------------------------------------------------------------- |
| `gui`          | "GUI"           | debug overlays: hitboxes, pointers, camera crop areas, FPS readouts   |
| `particles`    | "Particles"     | `Particle` + `ParticleGenerator` classes                              |
| `localStorage` | "Local Storage" | `set` / `get` shortcuts                                               |
| `synth`        | "Synth"         | procedural Web Audio tones and SFX presets                            |
| `confetti`     | "Confetti"      | self-driving gravity-bouncy bursts and rain drawn on top of the scene |
| `screenshot`   | "Screenshot"    | save the canvas as a PNG or copy it to the clipboard                  |

### GUI — `src/plugins/gui/gui.ts`

The debug interface, fixed to the bottom of the screen. DOM structure:

```
debugInfo (_gui_debug_info)
├── debugTab (_gui_debug_tab)  — header row + chevron-down.svg
└── debugContainer (_gui_debug_container)  — collapsible
    ├── leftContainer (_gui_left_container) "Rendering options"
    │   ├── title
    │   └── content: toggles — hitboxes, pointers, cameras crop areas, fps,
    │       anchors, boundaries, angles, grid, screen center, pointer coords,
    │       velocity vectors — plus a "cell size (px)" number input
    ├── middleContainer (_gui_middle_container) "Plugins"
    │   ├── title
    │   └── content: one _gui_plugin row per registered plugin
    └── thirdContainer (_gui_third_container) "Debug"
        ├── title
        └── content: the _gui_stats engine readout
```

Behavior:

- **Collapse**: clicking `debugTab` toggles `debugContainer` between `flex` and
  `none`, flipping the chevron. `config.open_on_start` (default `false`) controls
  the initial open state — by default the panel starts closed
  (`src/plugins/gui/gui.ts:121-126`).
- **Rendering-option toggles** (`afterUpdate` handler, `src/plugins/gui/gui.ts:385`):
  each enabled toggle draws its overlay on top of the scene:
    - _hitboxes_ → `hitbox.draw()` for every `engineState.hitboxes` entry,
    - _pointers_ → `drawPointers()` (red 8×8 squares),
    - _cameras crop areas_ → `drawCropArea()` on every camera,
    - _fps_ → two text readouts top-right: real `FPS` (from `engineState.fps`) and
      _Fixed FPS_ (from `1 / time.fixedDeltaTime`), with black outline + white fill,
    - _anchors_ → crosshair on every object/slider anchor,
    - _boundaries_ → `strokeRect` of every object's x/y/width/height,
    - _angles_ → a line from each object anchor along `element.angle`,
    - _grid_ → a full-canvas grid with lines every `cell size (px)` px
      (`numberConfig`, default 45, range `[8, 240]`); the input is disabled while
      the grid toggle is off,
    - _screen center_ → crosshair through the center of the canvas,
    - _pointer coords_ → `(x, y)` text next to every active pointer,
    - _velocity vectors_ → an arrow (with head) from each object anchor along
      its `vel` magnitude (capped at 150px).
- **Auto enable/disable** (`checkToDisable`, `src/plugins/gui/gui.ts:331`): the
  _hitboxes_ toggle is disabled when `engineState.hitboxes` is empty, the
  _cameras crop areas_ toggle when `engineState.cameras` is empty, and the
  _"cell size (px)"_ input is disabled while the grid toggle is unchecked.
  Re-checked on every `newPlugin` and every 2.5s (interval, `gui.ts:380`).
  Disabling unchecks the checkbox.
- **Persistent options**: every toggle, the grid cell size and the panel open
  state live in `info.config` (seeded from `guiConfigDefaults` and merged with
  anything saved earlier — `loadGuiConfig`, `gui.ts:42-57`). Any change is
  written back to `info.config` and persisted to localStorage under
  `lurkjs.gui.config` (`saveGuiConfig`, `gui.ts:312-337`), so a page refresh
  restores the exact debug setup without re-entering test config.
- **Live plugin panel** (`on("newPlugin")`, `src/plugins/gui/gui.ts:375`):
  re-renders the plugin list and re-runs `checkToDisable` whenever a new plugin
  registers, so the panel stays current without a page reload.
- Exports a `gui` object of the DOM nodes/classes (`gui.ts:593-606`) for whoever
  wants to reach into it.

### Particles — `src/plugins/particles/particles.ts`

```ts
new Particle(x, y, size, color, speedX, speedY, lifespan, alphaReducer)
new ParticleGenerator(
    x,
    y,
    particleCount,
    sizeRange,
    color,
    speedY,
    speedX,
    lifespanRange,
    alphaReducer,
)
```

- **`Particle.update()`** (per frame, dt-scaled):
    - moves `x += speed.x * time.deltaTime`, `y += speed.y * time.deltaTime`,
    - fades `alpha -= alphaReducer ** time.deltaTime` (exponential decay via
      `pow`, so the fade rate is frame-rate independent), clamped to `[0, 1]`,
    - once per particle arms a `setTimeout(lifespan)` that sets `lifespan = -1`
      (the expiry marker).
- **`Particle.draw()`**: filled rect of `size` centered on `(x, y)`, with
  `globalAlpha = alpha`.
- **`ParticleGenerator`** owns a `particles: Particle[]` pool:
    - `create()` spawns `particleCount` particles _sharing the generator origin_
      (`this.x/y`), each with random `size ∈ [0, sizeRange)`,
      `speed = random() * 0.25 * configured speed`, and random lifespan
      `∈ [0, lifespanRange)`.
    - `update()` advances every particle then **filters out** those expired
      (`lifespan <= 0` or `alpha <= 0`) or off-screen (outside 0..canvas
      width/height).
    - `draw()` draws all alive particles.
- Call `create()`, then `update() + draw()` each frame in your loop.

### Local Storage — `src/plugins/localStorage/ls.ts`

```ts
import { localStoragePlugin } from "./plugins/localStorage/ls.ts"

localStoragePlugin.set("score", String(42)) // returns the stored value
localStoragePlugin.get("score") // string | null
```

Thin typed wrapper over `localStorage.setItem` / `getItem`.

### Synth — `src/plugins/synth/synth.ts`

```ts
tone(frequency, (duration = 0.15), (type = "sine"), (volume = 0.2))
```

- Lazily creates a single `AudioContext` on first use and resumes it whenever it
  has been suspended, so calls are safe before and after user interaction
  (browsers only let audio actually start once a gesture has happened).
- Each `tone` plays one oscillator with an exponential fade-out
  (`exponentialRampToValueAtTime`).
- Presets: `coinTone(step = 0)` — a rising "coin" blip; pass `step` to climb a
  semitone scale — plus `boomTone()`, `shootTone()` and `clickTone()`.

```ts
import { coinTone, boomTone } from "./plugins/synth/synth.ts"

coinTone(score) // pitch climbs with every pickup
boomTone()
```

### Confetti — `src/plugins/confetti/confetti.ts`

Self-driving: importing the module hooks `on("update")` for physics and
`on("afterUpdate")` to draw on top of the scene, so there is nothing to call each
frame.

```ts
confetti.burst(x, y, (count = 40), (spread = 320)) // spray of pieces at a point
confetti.rain((duration = 2000), (total = 120)) // snowfall from the top for a while
confetti.clear() // drop every piece
```

- Pieces randomize size, color and rotation; gravity pulls them down, they bounce
  off the bottom edge with a damped `velocityY`, and fade out through `alpha`.
- All motion is `time.deltaTime`-scaled, so it is frame-rate independent.

### Screenshot — `src/plugins/screenshot/screenshot.ts`

```ts
screenshot(filename?) // downloads the current canvas frame as a PNG
await copyScreenshot() // copies it to the clipboard; resolves to false when unsupported
```

- `screenshot()` defaults the filename to `lurkjs-screenshot-<timestamp>.png` and
  uses `canvas.toBlob` plus a synthetic `<a download>` click.
- `copyScreenshot()` writes a `ClipboardItem` and resolves `false` when
  `navigator.clipboard` is unavailable.

## Writing your own plugin

1. Create a folder under `src/plugins/<name>/` (with an `icon.png` if you want an
   icon in the GUI panel).
2. At module top-level, call `registerPlugin({ name, version, author, description,
path: "<name>", config: {...} })`.
3. Provide your functionality as exported classes/functions; hook engine events
   with `on("update")` / `on("afterUpdate")` / `on("fixedUpdate")` etc.
4. Import the plugin somewhere for side effects:
   `import "./plugins/<name>/<name>.ts"`.

The GUI picks up your registration automatically via `newPlugin`.

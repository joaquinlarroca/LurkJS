# LurkJS

A tiny, zero-dependency 2D canvas game engine for TypeScript and JavaScript.

Everything runs on a plain `<canvas>` — no WebGL, no install-time trickery. You import the engine,
load a few assets, and start spawning objects.

> **Status:** early development. The public API is still settling while the engine gets
> nicer names, so expect breaking changes between versions.

## Quick start

```bash
npm install
npm run dev      # launches the Vite dev server with the interactive demo
```

Open the URL Vite prints (usually `http://localhost:5173`). You should see the
demo scene: a bunny you steer with the mouse or WASD, spinning coins to collect,
live physics and particle sliders, a BOOM button that shakes the screen and sprays
particles and debris, and a picture-in-picture "camera" inset that tracks the
player. A debug GUI (fixed to the bottom of the screen) can toggle
hitbox/pointer/camera rendering and a FPS readout.

> **Documentation:** the in-depth API + behavior docs live in
> [docs/](docs/README.md) (start with `01-getting-started.md`, use
> `16-api-reference.md` as the symbol reference).

## Project layout

```
index.html                 demo shell + loading screen markup
docs/                      API + behavior documentation (see docs/README.md)
src/
├── demo.ts                the demo game — copy this to start your own
├── index.ts               public entry point (barrel re-export of the whole engine)
├── js/
│   ├── main.ts            engineState, time, canvas/ctx, image/sound/font registries
│   ├── functions.ts       setup, clear, drawText, math + screen-shake helpers
│   ├── listeners.ts       keyboard + mouse/touch input, pointers, hover/click queries
│   ├── loader.ts          asset loading + ready-state tracking
│   ├── events.ts          typed on/emit/off wrapper around the engine events
│   ├── classes.ts         barrel that re-exports the class modules below
│   └── classes/
│       ├── entity.ts      the base drawable (`entity`, exported as `object`)
│       ├── hitbox.ts      rect/circle colliders + collision checks
│       ├── button.ts      clickable button with text
│       ├── slider.ts      horizontal (`slider`) and vertical (`sliderv`) sliders
│       ├── camera.ts      canvas crop + scaled redraw camera
│       ├── timeout.ts     timed self-resetting boolean
│       ├── sound.ts       `sound` (single player) and `multiSound` (overlapping)
│       └── utils.ts       applyTexture, clamp
├── plugins/               optional add-on plugins, each self-registers on import
│   ├── gui/               debug GUI (hitboxes, pointers, FPS)
│   ├── particles/         Particle + ParticleGenerator classes
│   └── localStorage/      localStorage shortcuts
└── css/                   demo + loading screen styles
```

## Hello world

```ts
// main.ts — the entry your index.html points at
import { button, camera, object } from "./js/classes.ts"
import { clear, drawText, setup } from "./js/functions.ts"
import { keyPressed } from "./js/listeners.ts"
import { on } from "./js/events.ts"
import { time } from "./js/main.ts"

await setup(1920, 1080, 0.99, 60)

const player = new object("color: #36b213", [960, 540], [100, 100])
const btn = new button(
    "color: #2d9111",
    [200, 200],
    [200, 100],
    ["CLICK", "white", 48, "sans-serif"],
    500,
)

on("update", () => {
    clear()
    player.draw()
    btn.update()
    btn.draw()
    drawText(`frames: ${time.frameCount}`, [16, 16], 32, "sans-serif")
})

on("fixedUpdate", () => {
    if (keyPressed("a")) player.x -= 300 * time.fixedDeltaTime
    if (keyPressed("d")) player.x += 300 * time.fixedDeltaTime
})
```

## Core ideas

- **The game loop** — call `setup(width, height, marginMultiplier, targetFixedFps)` once.
  It creates the canvas, scales it to fit the window, and fires four events via the
  typed `on("…")` helper from `js/events.ts`: `update` (per frame), `fixedUpdate`
  (fixed timestep, defaults to 60/s), `afterUpdate` (for debug/HUD drawing), and
  `started` (when the loading screen is gone).
- **Textures** — everywhere a texture is accepted you can pass a `"color:#rrggbb"` string,
  an `HTMLImageElement`, or `null`. `entity.setTexture(...)` swaps it at runtime.
- **Input** — `keyPressed("a")` checks held keys; `mouse` and `pointers` track the cursor
  and every touch. `isHovering(hitbox)`, `isClicking(hitbox)` and `isPointer(hitbox)`
  query the registered colliders.
- **Plugins** — import a plugin module for its side effects (`import "./plugins/gui/gui.ts"`)
  and it registers itself with `registerPlugin`. The GUI lists every registered plugin.
- **Disposal** — every constructible (`object`/`button`, `slider`/`sliderv`, `camera`,
  `sound`/`multiSound`) has a `destroy()` method that removes it from `engineState` at the
  next frame boundary, so long-lived scenes don't leak.

## Scripts

| Command             | What it does                              |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | start the Vite dev server                 |
| `npm run build`     | typecheck, then build the demo to `dist/` |
| `npm run typecheck` | run `tsc --noEmit`                        |
| `npm run format`    | format with Prettier                      |
| `npm run preview`   | preview the production build              |

## License

MIT — see [LICENSE](LICENSE).

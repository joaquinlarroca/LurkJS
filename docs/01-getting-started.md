# Getting started

## Install and run

```bash
npm install
npm run dev   # launches the Vite dev server with the interactive demo
```

Open the URL Vite prints (usually `http://localhost:5173`). You should see the
demo scene: a bunny you steer with the mouse or WASD, spinning coins to collect,
live physics and particle sliders, a BOOM button that shakes the screen and sprays
particles and debris, and a picture-in-picture "camera" inset that tracks the
player. A debug GUI fixed to the bottom of the screen can toggle
hitbox/pointer/camera/FPS overlays.

## Scripts

| Command             | What it does                                      |
| ------------------- | ------------------------------------------------- |
| `npm run dev`       | start the Vite dev server                         |
| `npm run build`     | typecheck (`tsc --noEmit`), then build to `dist/` |
| `npm run typecheck` | run `tsc --noEmit`                                |
| `npm run format`    | format everything with Prettier                   |
| `npm run preview`   | preview the production build                      |

The compiler is strict (`strict: true`, `noUncheckedIndexedAccess`,
`noImplicitOverride`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`,
`useDefineForClassFields: false`) — see `tsconfig.json`.

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

Key things to note:

- `setup(...)` must be awaited once before drawing; it creates the canvas, sizes
  it and starts the game loop (see [boot-and-lifecycle](03-boot-and-lifecycle.md)).
- Game logic goes into `on("update", ...)` (per frame) and `on("fixedUpdate", ...)`
  (fixed timestep, see [game-loop](04-game-loop.md)).
- Interactive UI classes (`button`, `slider`, `sliderv`) need their `update()`
  called every frame to track hover/click/drag state.
- Plain drawables (`object`, `camera`) can be drawn with `draw()`.
- Imports use `.ts` extensions because Vite's dev server resolves them directly;
  the public entry point `src/index.ts` re-exports everything from one keg.

## The HTML shell

`index.html` is minimal — a CSS link, an optional loading screen, and the module
entry:

```html
<link rel="stylesheet" href="src/css/main.css" />
<link rel="stylesheet" href="src/css/_loading.css" />
<div id="_loading_screen">
    <div id="_loading_bar"><svg id="_loading_logo">…</svg></div>
</div>
<script type="module" src="/src/demo.ts"></script>
```

The engine creates its own `<canvas>` at runtime and appends it to
`document.body` (or whatever `engineState.appendTo` points at) — you never write
a `<canvas>` tag yourself.

### Loading screen

The `#_loading_screen` / `#_loading_bar` / `#_loading_logo` markup is **optional**.
The engine resolves them with `getElementById(...)` **without** a `!` assertion
(`src/js/main.ts:107-110`) and guards every access, so a page that omits the
markup simply has no loading screen — it does not crash. The loading bar shows
asset-load progress as a gradient; once loading finishes it fades out
(see [boot-and-lifecycle](03-boot-and-lifecycle.md)).

## CSS variables

The demo styles define a few variables the engine reads at import time (`src/css/main.css:21-30`):

| Variable                      | Used for                                                         |
| ----------------------------- | ---------------------------------------------------------------- |
| `--canvas-bg`                 | background color of `<canvas>` CSS and the color `clear()` fills |
| `--body-bg`                   | the `<body>` background behind the canvas                        |
| `--loading-bar-done-color`    | the loaded (leading) color of the loading bar gradient           |
| `--loading-bar-color`         | the trailing color of the loading bar gradient                   |
| `--loading-screen-background` | the loading screen and logo background                           |

The engine reads these from the computed styles of `:root` at module import time
(`functions.ts:7`, `loader.ts:4-7`), with hardcoded fallbacks (`#000000` /
`#A9F249`).

## The demo game

`src/demo.ts` is a self-contained example — copy it as the starting point for your
own game. It touches a slice of every major engine feature:

- loading an image, a background and a font (`loadImage`, `loadFont`),
- `setup(1920, 1080, 0.99, 60)` on a `1920×1080` logical canvas,
- an `object` subclass (`Player`) steered with `mouse` and `keyPressed` in `fixedUpdate`,
- `hitboxCircle` colliders attached to entities plus `collidesWith` for the
  collectible coins,
- a live controls panel: a `slider` (max speed), a `slider` (particle trail) and a
  `sliderv` (gravity) whose `percentage` is read every frame to drive the physics,
- a `button` that triggers `shakeScreen`, a particle burst and self-destructing
  `Debris` objects (faded via `alpha`, reclaimed via `destroy()` + the frame sweep),
- a `timeout` used as the boom-button cooldown,
- a `camera` inset whose moving `viewport` tracks the player with a `lerp` smear —
  cropped and redrawn each frame as a mini picture-in-picture,
- `ParticleGenerator` trails and explosions from the particles plugin,
- `drawText` HUD using the loaded font plus `getTimeElapsed` time formatting,
- the `distance` / `clamp` / `lerp` math helpers driving physics and camera,
- importing the GUI plugin for its side effects (the hitbox/pointer/camera/FPS
  toggles).

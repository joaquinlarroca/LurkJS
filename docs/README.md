# LurkJS documentation

Technical documentation for the **LurkJS** 2D canvas game engine (TypeScript + Vite).

These docs describe the public API **and** the runtime behavior — how the engine
actually behaves when it boots, updates, reacts to input and disposes objects.
Every doc references the source file and line it was derived from, so the docs
stay traceable to the code.

## How to read these docs

- Start with [01-getting-started](01-getting-started.md) if you are new.
- Read [02-architecture](02-architecture.md) to understand how the modules fit together.
- Use [16-api-reference](16-api-reference.md) as the exhaustive symbol reference.
- The remaining docs go deep on a single concern, in the same order the source is laid out.

## Table of contents

| #   | Doc                                                      | What it covers                                                                      |
| --- | -------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 01  | [getting-started](01-getting-started.md)                 | install, scripts, hello world, demo, HTML shell, loading screen, CSS variables      |
| 02  | [architecture](02-architecture.md)                       | module map, public barrel, singleton state, import-time side effects                |
| 03  | [boot-and-lifecycle](03-boot-and-lifecycle.md)           | startup sequence, loading behavior, `setup()`, lifecycle + disposal                 |
| 04  | [game-loop](04-game-loop.md)                             | requestAnimationFrame loop, event order, fixed-timestep accumulator                 |
| 05  | [assets](05-assets.md)                                   | `loadImage` / `loadSound` / `loadFont` behavior, registries, dedupe                 |
| 06  | [textures](06-textures.md)                               | `TextureArg` parsing, `applyTexture`, `noTexture` fallback, `setTexture`            |
| 07  | [input](07-input.md)                                     | keyboard, mouse, touch pointers, hover/click/pointer queries                        |
| 08  | [rendering](08-rendering.md)                             | canvas scaling, `clear`, `drawText`, `measureTextWidth`, colors                     |
| 09  | [screen-effects-and-math](09-screen-effects-and-math.md) | `shakeScreen`, `distance`, `lerp`, `clamp`, `angleToPoint`, `move`, time formatting |
| 10  | [entities](10-entities.md)                               | `entity` / `object`: fields, methods, draw pipeline, transforms                     |
| 11  | [hitboxes](11-hitboxes.md)                               | the four collider classes, collision resolution, debug drawing                      |
| 12  | [ui](12-ui.md)                                           | `button`, `slider` / `sliderv`, `timeout`                                           |
| 13  | [camera-and-sound](13-camera-and-sound.md)               | `camera` crop/replay, `sound`, `multiSound`                                         |
| 14  | [plugins](14-plugins.md)                                 | plugin system + the GUI, particles and localStorage plugins                         |
| 15  | [events-and-state](15-events-and-state.md)               | `on` / `emit` / `off`, full `engineState` / `time` / `screen` reference             |
| 16  | [api-reference](16-api-reference.md)                     | every exported symbol with signature, grouped by module                             |

## Source layout (where things live)

```
src/
├── demo.ts                     demo game (copy this to start your own)
├── index.ts                    public entry point – re-exports the whole engine
├── js/
│   ├── main.ts                 engineState, time, screen, canvas, ctx, registries
│   ├── functions.ts            setup, clear, drawText, shakeScreen, math helpers
│   ├── listeners.ts            keyboard + mouse/touch input, hitbox queries
│   ├── loader.ts               asset loading + readiness tracking
│   ├── events.ts               typed on/emit/off wrapper
│   ├── types.ts                shared types + DEG_TO_RAD
│   ├── classes.ts              barrel over the class modules
│   └── classes/                entity, hitbox, button, slider, camera, timeout, sound, utils
└── plugins/
    ├── gui/                    debug GUI plugin
    ├── particles/              Particle + ParticleGenerator
    └── localStorage/           localStorage shortcuts
```

## Versioning note

LurkJS is in early development (`engine.version` is `0.0.1`). The public API is
still settling, so expect breaking changes between versions; these docs describe
the current state of the tree.

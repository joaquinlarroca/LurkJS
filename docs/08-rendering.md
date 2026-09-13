# Rendering

This page covers canvas sizing, the coordinate system and the text/measurement
draw helpers. Entity/sprite drawing has its own page ([entities](10-entities.md)).

## Canvas sizing (aspect-fit)

`setup(width, height, marginMultiplier, targetFixedFps)` sets the canvas'
**internal resolution** to `width × height` once, then computes a **display size**
so the canvas fits the viewport while preserving the aspect ratio
(`src/js/functions.ts:38-51`):

```ts
if (clientWidth / clientHeight > width / height) {
    adjustedHeight = clientHeight
    adjustedWidth = (clientHeight * width) / height
} else {
    adjustedWidth = clientWidth
    adjustedHeight = (clientWidth * height) / width
}
adjustedWidth *= marginMultiplier
adjustedHeight *= marginMultiplier
```

- The canvas CSS `width`/`height` change, never the internal resolution — so all
  drawing coordinates are in _game_ pixels, stable across any window size.
- `marginMultiplier` scales the fit; a value `< 0` or `> 1` is coerced to `1`.
- `imageSmoothingEnabled = false` is set once, so scaled rendering stays crisp
  (nearest-neighbor).
- The `resize` handler re-runs this fit automatically
  (`src/js/listeners.ts:51-53`).
- Input coordinates are mapped from CSS pixels back into game pixels — see
  [input](07-input.md#coordinate-mapping).

## `clear()`

Fills the entire internal canvas with the background color
(`src/js/functions.ts:131-136`):

```ts
screen.context.save()
screen.context.fillStyle = canvasBG
screen.context.fillRect(0, 0, screen.canvas.width, screen.canvas.height)
screen.context.restore()
```

- `canvasBG` is read once at module import: the computed `--canvas-bg` CSS
  variable of `:root`, falling back to `#000000` (`src/js/functions.ts:7`).
- It saves/restores the context, so callers never need to reset state themselves.
- The loop does **not** clear automatically — clearing is your job at the start of
  `update` (the demo calls `clear()` first thing each frame).

## `drawText(...)`

`drawText(text, [x, y], fontSize, fontFamily, baseline, textAlign, angle, alpha)`
(`src/js/functions.ts:139-158`).

Defaults:

| Param        | Default                        |
| ------------ | ------------------------------ |
| `text`       | `"undefined"`                  |
| `[x, y]`     | `[0, 0]`                       |
| `fontSize`   | `24`                           |
| `fontFamily` | `"sans-serif"`                 |
| `baseline`   | `"top"` (`CanvasTextBaseline`) |
| `textAlign`  | `"start"` (`CanvasTextAlign`)  |
| `angle`      | `0` (degrees)                  |
| `alpha`      | `1.0`                          |

Behavior: saves the context, applies baseline/align/font
(`${fontSize}px ${fontFamily}`), translates to `(x, y)`, rotates by
`angle * DEG_TO_RAD`, sets `globalAlpha`, draws with `fillText(text, 0, 0)`, then
restores. The result is clean fill text — no stroke; `angle` rotates around the
anchor point `(x, y)`.

## `measureTextWidth(text, fontSize, fontFamily)`

Returns the rendered width in pixels for the given font
(`src/js/functions.ts:161-172`):

```ts
screen.context.font = `${fontSize}px ${fontFamily}`
return screen.context.measureText(text.toString()).width
```

Accepts `string | number`, converts to string, saves/restores the context around
the call.

## Colors and alpha

- Text and fills always go through the canvas' standard CSS color parsing
  (`fillStyle`). `"color:#..."` texture strings translate to entity fills via
  `applyTexture` (see [textures](06-textures.md)).
- Entities, sliders and text all apply `globalAlpha` for transparency; the demo
  sets `drawText(..., alpha)` via the last argument.
- `measureTextWidth` and `drawText` respect their own save/restore so stray font
  or alignment settings never leak between calls.

## Draw ordering

Ordering is explicit: whatever you call last in `update` draws on top. The engine
never reorders drawables (objects in `engineState.objects` are _not_ drawn
automatically — you `draw()` them yourself; the registry is for state/disposal,
not for the render pass). Debug/HUD content is conventionally drawn in
`afterUpdate` (the GUI plugin does this) so it sits above game content. Camera
replays (`camera.draw()`) stamp whatever is already painted — see
[camera-and-sound](13-camera-and-sound.md).

## Behavior notes

- `clear()` covers the whole canvas — with `aspect-fit` margins the canvas CSS
  background (`--canvas-bg`) fills the letterbox around it.
- All text is drawn asynchronously from layout (pure canvas), so fonts loaded via
  `loadFont` (which registers with `document.fonts`) are available immediately
  after their `await` completes.
- There is no built-in sprite batch or culling; draw performance is entirely up to
  your `update` callback.

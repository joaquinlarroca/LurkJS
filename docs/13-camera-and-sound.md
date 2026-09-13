# Camera and sound

## `camera` — `src/js/classes/camera.ts`

A camera is a **canvas-crop + scaled-redraw** device: it freezes whatever is
painted, then draws a region of that snapshot scaled into a viewport.

```ts
new camera([x, y, w, h], [vx, vy, vw, vh])
new camera(crop rect x,y,w,h, viewport rect vx,vy,vw,vh)
```

- `x, y, width, height` — the **destination** rect on the main canvas.
- `viewport: { x, y, width, height }` — the **source** rectangle (region of the
  frozen canvas to replay).
- Registers itself in `engineState.cameras` on construction.

### `crop()` — `src/js/classes/camera.ts:31-37`

Captures the _entire current canvas_ into a hidden offscreen canvas
(`snapshot`). It draws the canvas into a same-size copy with 2d
`drawImage(canvas, 0, 0)`. Call `crop()` after the scene is drawn; it captures
everything up to that point (frozen).

### `draw()` — `src/js/classes/camera.ts:40-55`

If a snapshot exists, stamps it into the destination, scaled:

```ts
drawImage(snapshot, viewport.x, viewport.y, viewport.width, viewport.height, x, y, width, height)
```

Source = `viewport`, destination = `camera.x/y/width/height`. Any later draw the
user performs will paint _over_ the camera stamp — order matters.

### `drawCropArea()` — `src/js/classes/camera.ts:58-69`

Debug overlay: blue (`#0000FF`) stroke rectangle over the `viewport` region, with
a line width scaled to the canvas aspect (`(canvas.width / canvas.height) * 2`).
The GUI's "cameras crop areas" toggle calls this for every camera each frame.

### `destroy()`

Sets `toDelete`; the frame sweep removes it from `engineState.cameras`.

### Typical usage

```ts
// inside update(), after drawing the scene:
cam.crop() // freeze everything drawn so far
cam.draw() // replay it into the camera rect, scaled from the viewport

// the demo moves cam.viewport each frame so the inset tracks the player:
cam.viewport.x = clamp(lerp(cam.viewport.x, player.x - 150, 0.1), 0, width - 300)
cam.viewport.y = clamp(lerp(cam.viewport.y, player.y - 110, 0.1), 0, height - 220)
```

`crop()` must be re-called before each `draw()` if you want the snapshot fresh —
the snapshot does not update itself.

## `sound` — `src/js/classes/sound.ts:4-58`

A single persistent `HTMLAudioElement` player:

```ts
new sound(audioSrc, playbackRate?, volume?, loop?)
```

- Creates `new Audio(audioSrc)`; applies `loop`, `playbackRate`, `volume` defaults
  (`false`, `1.0`, `1.0`).
- Registers in `engineState.soundPlayers` on construction.
- Listens on the audio element:
    - `ended` → sets `ended = true`,
    - `timeupdate` → updates `currentTime`,
    - `canplaythrough` → sets `canplay = true`.
- **`play()`**: no-ops until `canplay` is true, then resets `ended` and calls
  `audio.play()` (swallowing rejections — e.g. autoplay policy).
- `pause()` — pauses; `stop()` — pauses and rewinds to 0;
  `setCurrentTime(seconds)` — seeks, guarded to `[0, duration]`.
- Public fields: `audio`, `canplay`, `ended`, `currentTime`, `toDelete`.
- `destroy()` sets `toDelete`; the sweep removes the player. The underlying audio
  element is not explicitly released.

## `multiSound` — `src/js/classes/sound.ts:61-99`

For **overlapping** sounds: each `play()` creates a fresh `Audio` clone from the
same src, so repeated calls overlap naturally.

```ts
new multiSound(audioSrc, playbackRate?, volume?)
```

- **`play()`**: creates `new Audio(audioSrc)`, applies the stored
  `playbackRate`/`volume`, plays it (rejection swallowed), pushes it onto
  `audioClones`, and registers an `ended` listener that removes that clone.
- **`stopAll()`**: pauses + rewinds _all_ clones and empties the list.
- Fields: `playbackRate`, `volume`, `audioSrc`, `audioClones`, `toDelete`.
- No canplay gating — clones just play when the browser allows.
- `destroy()` marks `toDelete` for the same sweep.

## Behavior notes

- `sound` is for a single voice (e.g. music, one-shot HUD beeps); `multiSound`
  for rapid repeats (e.g. firing, footsteps) where each shot should restart cleanly.
- `multiSound` clones re-decode the audio each time; they share the src string,
  not a decoded buffer.
- Both classes rely on the engine-level `soundPlayers` registry purely for
  lifecycle — nothing plays them automatically.
- Use `loadSound()` (the loader) if you want assets pre-tracked by the loading
  bar and stored in the `sounds` registry; these classes accept a URL/destination
  directly and are independent of the loader.
- Audio elements are browser-gated: `audio.play()` may reject under autoplay
  policies until the user interacts; the engine swallows the rejection, so call
  sites never throw.

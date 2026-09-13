# Screen effects and math helpers

## Screen shake — `shakeScreen(intensity, duration)`

`shakeScreen(intensity, duration)` (`src/js/functions.ts:185-212`) randomly jitters
the canvas transform for `duration` milliseconds.

How it behaves:

1. It **coalesces**: if `engineState.shakingScreen` is already `true`, a call does
   nothing — concurrent shakes don't stack (`src/js/functions.ts:186`).
2. It snapshots the current context transform matrix (`a-f`), plus the origin
   `startX = matrix.e`, `startY = matrix.f`.
3. A rAF loop runs until `currentTime - start >= duration`:
    - each tick sets the transform to the original matrix **plus a uniform random
      offset in `[-intensity, +intensity]` on both axes**,
    - the random value uses `Math.random() * 2 - 1`, so the shake magnitude is
      `±intensity` uniformly distributed.
4. When `duration` elapses it restores the exact original transform and sets
   `engineState.shakingScreen = false`.

Caveats:

- The shake applies to _everything_ drawn after it starts — include it in your
  frame as a visual effect around the scene, or call it then draw.
- If `clear()` runs before the shake, the background fill also gets offset
  because `clear()` fills the canvas untransformed — call order matters.
- The transform is made absolute each tick (from the snapshot), so the shake is
  bounded (`±intensity`) rather than a random walk.

## Math helpers

### `distance(x1, y1, x2, y2): number`

Euclidean distance via `Math.hypot(x2 - x1, y2 - y1)` (`src/js/functions.ts:175-177`).
Used internally by the hitbox circle tests and `isHovering`.

### `lerp(startValue, endValue, interpolation): number`

`startValue + (endValue - startValue) * interpolation`
(`src/js/functions.ts:180-182`). Standard linear interpolation; `interpolation` is
_not clamped_, so values outside `[0, 1]` extrapolate.

### `clamp(value, min, max): number`

`Math.max(Math.min(value, max), min)` (`src/js/classes/utils.ts:33-35`). Inclusive;
used by the sliders to keep the percentage and thumb within range.

### `DEG_TO_RAD`

`0.017453292519943295` (`src/js/types.ts:2`). Degrees→radians factor; users rarely
need it because every angle in the engine API (entity `angle`, `drawText`
`angle`, `angleToPoint`) is in **degrees**.

## Direction helpers (`entity`)

### `angleToPoint(point)` — `src/js/classes/entity.ts:139-147`

Points the entity's `angle` (degrees) toward `point` (a `Vec2`). It recomputes
`update()` first and uses the **center** of the entity
(`y + halfheight`, `x + halfwidth`) as the origin, then converts `atan2` from
radians to degrees.

### `move(steps)` — `src/js/classes/entity.ts:150-156`

Moves the entity `steps` pixels along its current `angle`:

```ts
const angleRad = (this.angle * Math.PI) / 180
this.x += Math.cos(angleRad) * steps
this.y += Math.sin(angleRad) * steps
```

`angle` 0 = moving +X; positive angle rotates clockwise (canvas convention).
`steps` may be negative to move backward.

## Time formatting — `getTimeElapsed(startTime)`

`getTimeElapsed(startTime)` (`src/js/functions.ts:222-233`) formats the elapsed
wall-clock ms since `startTime` as `"MM:SS"`, zero-padded:

- minutes = `floor((Date.now() - startTime) / 60000)`, seconds = remaining,
- both padded to 2 digits (`"00:00"` … `"99:59"`).

It uses `Date.now()`, so it measures real time even if the game loop is paused
(background tab).

## Color validation — `isValidColor(color)`

`isValidColor(color)` (`src/js/functions.ts:215-219`) returns `true` when the
browser parses `color` as a CSS color, via the `Option().style.color` trick:

```ts
const validate = new Option().style
validate.color = color
return validate.color !== ""
```

An empty/unknown color string yields `""` → `false`; any valid CSS color
(`"red"`, `"#36b213"`, `"rgb(...)"`, ...) yields `true`.

## Behavior notes

- All helpers are pure except `angleToPoint` / `move` (they mutate the entity) and
  `shakeScreen` (mutates global transform + state).
- `lerp` and `clamp` accept any numbers; there are no type guards — garbage in,
  garbage out.

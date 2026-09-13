# Entities

`entity` (`src/js/classes/entity.ts`) is the base drawable sprite, exported to
users under the name **`object`** (`entity as object`, `src/js/classes/entity.ts:161`).
`button` extends it; `slider`/`sliderv` model their own visual (see
[ui](12-ui.md)).

## Constructor

```ts
new object(texture, ([x, y] = [0, 0]), ([width, height] = [32, 32]))
```

- Pushes the instance into `engineState.objects` (the registry).
- Applies the texture (see [textures](06-textures.md)), defaulting to the
  `noTexture` fallback image.
- Sets position, size, `halfwidth`/`halfheight`, creates the default hitbox list
  (`[new hitbox(this, 1)]`, enhanced with a `draw()` helper), and computes the
  initial `anchor`.

## Fields

| Field                            | Default                                    | Meaning                                                                 |
| -------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------- |
| `x`, `y`                         | from ctor                                  | top-left position (game pixels)                                         |
| `width`, `height`                | from ctor                                  | size in game pixels                                                     |
| `halfwidth`, `halfheight`        | `w/2`, `h/2`                               | cached half-sizes (recomputed by `update()`)                            |
| `center`                         | —                                          | not stored; `halfwidth`/`halfheight` are the halves of `width`/`height` |
| `offset`                         | `[0.5, 0.5]`                               | fractional origin; `[0,0]` = top-left, `[1,1]` = bottom-right           |
| `anchor`                         | `{x, y}`                                   | the rotation/scale pivot: `x + width*offset[0]`, `y + height*offset[1]` |
| `angle`                          | `0`                                        | rotation in **degrees** (clockwise)                                     |
| `scale`                          | `[1, 1]`                                   | per-axis scale (negative values mirror)                                 |
| `alpha`                          | `1`                                        | global opacity 0..1                                                     |
| `borderRadius`                   | `0`                                        | corner radius for the clip path (and stroke path)                       |
| `stroke`                         | `{active:false, color:"#FFFFFF", width:5}` | optional outline                                                        |
| `usingColor`, `color`, `texture` | from texture                               | resolved texture state                                                  |
| `hitboxes`                       | `[hitbox]`                                 | array of attached colliders + `draw()` helper                           |
| `toDelete`                       | `false`                                    | true → removed by the frame sweep at the next boundary                  |

## Behavior

### `update()` — `src/js/classes/entity.ts:70-77`

Refreshes cached state:

```ts
this.halfwidth = this.width / 2
this.halfheight = this.height / 2
this.anchor = { x: this.x + this.width * this.offset[0], y: this.y + this.height * this.offset[1] }
```

`draw()` calls it automatically. Call it manually (e.g. in a fixed-update
integration) if you mutate size/offset and need the cache fresh before queries.

### `draw()` — the render pipeline — `src/js/classes/entity.ts:80-126`

1. `update()` (sync caches).
2. `save()`; `globalAlpha = this.alpha`.
3. `translate(anchor.x, anchor.y)` — pivot at the anchor.
4. `rotate(angle * DEG_TO_RAD)`.
5. `scale(scale[0], scale[1])`.
6. Builds a `roundRect` from `(-w*offset[0], -h*offset[1], w, h, borderRadius)` —
   the rect is _local_, centered around the pivot by `offset`.
7. If `stroke.active`: strokes with `stroke.color` / `stroke.width`.
8. `clip()` to the rounded rect, then fill (if `usingColor`) with `this.color`, or
   `drawImage(texture, ...)` over the same rect.
9. `restore()`.

Net effect: `x,y` is the top-left, the anchor is `x,y` translated by the offset
fraction of `w,h`, and rotation/scale happen about the anchor.

### `collidesWith(other)`

`bool` — checks every hitbox of `this` against every hitbox of `other`
(`src/js/classes/entity.ts:58-67`). Returns `true` on the first `collide()` hit.

### `setTexture(texture)`

Re-applies `applyTexture` with the current `noTexture` fallback
(`src/js/classes/entity.ts:129-131`).

### `destroy()`

Sets `toDelete = true` (`src/js/classes/entity.ts:134-136`). The loop's sweep
removes the entity from `engineState.objects`/`buttons` and detaches its hitboxes
at the next frame boundary (see [boot-and-lifecycle](03-boot-and-lifecycle.md)).

## Orientation helpers

- `angleToPoint(point)` — sets `angle` toward `point` (degrees), computed from the
  entity center. Covered in [screen-effects-and-math](09-screen-effects-and-math.md).
- `move(steps)` — translate along the current `angle`.

## Behavior notes

- Entities are **not** auto-drawn. `engineState.objects` is a bookkeeping list
  (registration/disposal), not a render list — you must call `draw()` in your
  `update` callback.
- The default hitbox covers the full rect (`sizeMultiplier = 1`), is _attached_,
  and is pushed into `engineState.hitboxes` at construction — so `button`s,
  `object`s and slider thumbs register their colliders automatically.
- Negative `scale[0]` mirrors horizontally (the demo flips the player on `a`/`d`)
  — this also flips non-symmetric textures, which is why the demo separates
  `dir` from `scale`.
- `borderRadius` clips the texture to rounded corners and also rounds the outline.
- Because the texture draw is clipped to the rounded rect, colors and images share
  exactly the same outline behavior.

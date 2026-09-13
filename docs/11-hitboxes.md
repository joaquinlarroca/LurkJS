# Hitboxes

All colliders live in `src/js/classes/hitbox.ts`. A `hitbox` knows its shape
(rect or circle), whether it is **attached** to an owner or **fixed** in world
space, and can test against any other hitbox.

## The four classes

| Class               | Shape                    | Attached/Fixed | Constructor                                                |
| ------------------- | ------------------------ | -------------- | ---------------------------------------------------------- |
| `hitbox`            | rect (default) or circle | either         | `(owner, sizeMultiplier?)` or `(position, size \| radius)` |
| `hitboxFixed`       | rect                     | fixed          | `(position: Vec2, size: Vec2)`                             |
| `hitboxCircle`      | circle                   | attached       | `(owner, sizeMultiplier = 1)`                              |
| `hitboxCircleFixed` | circle                   | fixed          | `(position: Vec2, radius = 32)`                            |

`hitbox` itself is overloaded: passed an array `[x, y]` plus either an array
(size → `"hitbox-rect-fixed"`) or a number (radius → `"hitbox-circle-fixed"`),
it makes a fixed hitbox; passed a `ColliderOwner` it makes an attached
`"hitbox-rect"` with the given `sizeMultiplier`. The specialized subclasses just
set the type explicitly (`src/js/classes/hitbox.ts:23-55, 136-156`).

```ts
type HitboxType =
    | "hitbox-rect" // attached rect
    | "hitbox-rect-fixed" // fixed rect
    | "hitbox-circle" // attached circle
    | "hitbox-circle-fixed" // fixed circle
```

## Construction side effects

Every construction pushes the hitbox into `engineState.hitboxes`
(`src/js/classes/hitbox.ts:27`) — so attaching colliders automatically makes them
discoverable by hover/click queries, the GUI hitbox toggle and the disposal sweep.
Entities create `[new hitbox(this, 1)]` in their constructor; sliders create a
track and a thumb hitbox.

## Fields

| Field                            | Meaning                                                                             |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| `type`                           | the `HitboxType` discriminator                                                      |
| `object`                         | the owning `ColliderOwner` for attached hitboxes, else `null`                       |
| `sizeMultiplier`                 | 0..1 shrink factor for the collider (attached only, default 1)                      |
| `x`, `y`                         | top-left (rects) / center (circles) — recomputed by `updateDimensions` for attached |
| `width`, `height`                | rect dimensions                                                                     |
| `left`, `right`, `top`, `bottom` | computed rect bounds                                                                |
| `radius`                         | circle radius                                                                       |

`ColliderOwner` (`src/js/types.ts:27-34`) is anything with `x`, `y`, `width`,
`height` (and optional halves) — satisfied by `entity` and slider parts.

## `updateDimensions()`

Recomputes bounds from the owner's _current_ position/size; fixed hitboxes are
static after construction (`src/js/classes/hitbox.ts:58-82`):

- **Rects:** `x = owner.x`, `y = owner.y`, `width/height` copied, then shrink:
  `shrink = (1 - sizeMultiplier) * 0.5` applied to all four sides. So
  `sizeMultiplier = 1` → full rect; `0.5` → a centered quarter-area rect.
- **Circles:** center = owner center (`halfwidth`/`halfheight`, else `w/2`), and
  `radius = min(halfwidth, halfheight) * sizeMultiplier` — circles sized by the
  _smaller_ half-dimension.

`isHovering` / `isClicking` / `isPointer` and `collide()` all call
`updateDimensions()` before testing, so attached hitboxes always reflect the
owner's current geometry.

## `collide(other)` — collision matrix

Any two hitboxes can be tested (`src/js/classes/hitbox.ts:85-116`):

| this \ other | rect                                                                                                 | circle                                                                                           |
| ------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **rect**     | AABB overlap: `right ≥ other.left && left ≤ other.right && bottom ≥ other.top && top ≤ other.bottom` | closest point on the rect to the circle center inside the circle: `hypot(dx, dy) ≤ other.radius` |
| **circle**   | mirrored closest-point test using `this` center/radius                                               | center-distance test: `hypot(other.x - x, other.y - y) ≤ radius + other.radius`                  |

Both hitboxes are re-dimensioned first. This is a symmetric, solid-AABB +
solid-circle definition (rects have area, circles are disks).

## `entity.collidesWith(other)`

`entity` exposes `collidesWith(other): boolean`
(`src/js/classes/entity.ts:58-67`) that crosses every hitbox of both entities and
returns the first `collide() === true`.

## Debug drawing

`hitbox.draw()` (`src/js/classes/hitbox.ts:119-132`) renders the collider as a
red 2px stroke: `strokeRect(left, top, width, height)` for rects, an `arc` for
circles. It re-dimensions first. The GUI plugin's **hitboxes** toggle calls
`hitbox.draw()` for every entry in `engineState.hitboxes` each `afterUpdate`
(see [plugins](14-plugins.md)). A composite `(hitboxes as HitboxList).draw()` is
also available on entities (each individual hitbox draws).

## Interaction with the input system

- `isHovering(hitbox)` / `isClicking(hitbox)` / `isPointer(hitbox)` accept any
  `HitboxLike` (the structural shape — including sizeMultiplier'd attached bounds
  and fixed shapes).
- Sliders register their track hitbox (attached, `sizeMultiplier = 1`) as
  `hitboxes[0]` and the thumb hitbox (attached, `sizeMultiplier = 1`) as
  `hitboxes[1]`. Because the thumb belongs to a plain `SliderThumb` object, the
  normal entity-based disposal sweep does not know it — that's why
  `slider.destroy()` detaches its thumbs eagerly (see
  [boot-and-lifecycle](03-boot-and-lifecycle.md#special-case-sliders)).

## Behavior notes

- Attached hitboxes are _references to live geometry_ — they stay in sync with
  the owner automatically, no manual calls needed before queries/tests.
- `sizeMultiplier` only shrinks; it cannot grow the collider beyond the owner.
- Circle centers follow the owner's **center**, defined as
  `x + halfwidth`.
- You can mix-and-match: a rect collider testing a circle is exactly as valid as
  the reverse; the matrix is symmetric.

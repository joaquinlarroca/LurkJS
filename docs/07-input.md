# Input

All input handling lives in `src/js/listeners.ts`. State is exposed as plain
mutable module-level variables; handlers are attached at import time.

## Keyboard

| API               | Description                                       |
| ----------------- | ------------------------------------------------- |
| `keyPressed(key)` | `true` while the key is held                      |
| `pressedKeys`     | `Set<string>` of currently held keys (uppercased) |

- `keyPressed` expects a case-insensitive name (compare using `KeyboardEvent.key`
  convention): `keyPressed("a")`, `keyPressed("Control")`. `key"space"` is
  normalized to `" "` (`src/js/listeners.ts:28-36`). If a non-string is passed it
  returns `false`.
- `pressedKeys` stores `event.key.toUpperCase()`; keydown adds, keyup removes.
- **`preventKeys`** (`src/js/listeners.ts:6-24`): a `ReadonlySet<string>` of keys
  the engine blocks by default — `Control`, `Alt`, `Meta`, `Enter`, `Tab`, and
  `F1`–`F12`. `preventDefault()` is called for those keys **only when the canvas
  is focused** (`document.activeElement === screen.canvas`), so browser UI (tab
  navigation, save, devtools) still works outside the game.
- On `window` `blur`, the engine clears `pressedKeys`, clears `mouse.down`, and
  removes all touch pointers (see below) so no key/pointer stays stuck when the
  tab loses focus.

## Mouse

`mouse` is a mutable object:

```ts
mouse = { x: 0, y: 0, down: false, show: true, preventRightClick: true }
```

- `mouse.x` / `mouse.y` are the cursor position in **canvas coordinates**, already
  scaled from CSS pixels (see Coordinate mapping below).
- `mouse.down` is true while the left button is held (mouseup clears it even when
  `disableMouseEvents` is set).
- **`mouse.show`** is a getter/setter (`src/js/listeners.ts:62-75`) that toggles
  `screen.canvas.style.cursor` between `"default"` and `"none"`.
- **`mouse.preventRightClick`** — when `true` and the cursor is inside the canvas,
  the `contextmenu` event is `preventDefault()`ed (`src/js/listeners.ts:256-264`).
- Handlers: `mousedown` only reacts to `e.button === 0` (left); `mousemove`
  updates position; `mouseup` clears both `mouse.down` and the mouse pointer's
  `down`.

### `disableMouseEvents`

- Default `false`. While **true**, mousedown/mousemove are ignored entirely (the
  mouse pointer keeps its last known position) — `mouseup` handling is **not**
  skipped (`src/js/listeners.ts:201-206`).
- The engine flips it automatically: `mouseover` on the canvas sets it `false`,
  `mouseout` sets it `true` (`src/js/listeners.ts:237-243`). Set it manually to
  force-disable mouse tracking (e.g. during menus).

## Touch

Touch creates dynamic pointers keyed by the touch `identifier`:

- `touchstart` adds a pointer per changed touch (down: `true`).
- `touchmove` updates x/y, preserving the existing `type` and `attached`.
- `touchend` / `touchcancel` delete the pointer.
- All touch handling `preventDefault()`s and only reacts when the touch target is
  inside the canvas; touch events are ignored otherwise
  (`src/js/listeners.ts:266-321`).
- On `blur`, all touch pointers (key !== `"mouse"`) are removed.

## Pointers

`pointers` is a `Record<string, Pointer>`. There is always a `"mouse"` pointer
(created at import, `src/js/listeners.ts:192-199`). Touch pointers are added by
identifier.

```ts
interface Pointer {
    key: string
    type: "mouse" | "touch"
    down: boolean
    attached?: unknown // set while something is dragging this pointer
    x: number
    y: number
}
```

- `pointer.attached` is a drag lock: when a slider grabs a pointer it sets
  `attached`, and `isClicking` only considers pointers with
  `attached === undefined` — see [ui](12-ui.md).
- Initial mouse coordinates are `(-1, -1)` until the first mousemove.

## Hitbox queries

The three query helpers operate on any `HitboxLike` (a `hitbox` or anything with
the same shape):

### `isHovering(hitbox)`

`true` when **any** pointer (mouse or touch) is over the hitbox; recomputes
`updateDimensions()` first. Rect test: within `left/right/top/bottom`. Circle
test: distance to center ≤ radius. (`src/js/listeners.ts:80-101`)

### `isClicking(hitbox, disablePointerSet = false)`

`true` once per **press** while clicking the hitbox — it only considers pointers
that are `down` and **not attached** (`src/js/listeners.ts:104-146`). By default
it **consumes the click**: the matched pointer's `down` is set to `false`, so a
subsequent `isClicking` call in the same press returns `false`. Pass
`disablePointerSet = true` to check without consuming. Only reacts to
pointer-down over the shape (not drag).

> This is why a slider's `update()` calls `isClicking(thumbHitbox, true)` — it
> wants to observe the raw press without stealing it from other UI.
> (`src/js/classes/slider.ts:169`)

### `isPointer(hitbox)`

Returns the first pointer currently over the hitbox (not necessarily down), or
`undefined` (`src/js/listeners.ts:149-180`).

### `drawPointers()`

Debug helper: draws every active pointer as a red 8×8 square centered on its
position (`src/js/listeners.ts:183-190`). Used by the GUI plugin's "pointers"
toggle.

## Coordinate mapping

All mouse/touch coordinates are converted from CSS pixels to **canvas pixels**
using the canvas' current bounding rect and its internal resolution
(`src/js/listeners.ts:208-212`):

```
scaledX = (clientX - rect.left) * (canvas.width / rect.width)
scaledY = (clientY - rect.top)  * (canvas.height / rect.height)
```

This is what makes input match the aspect-fit scaled canvas (see
[rendering](08-rendering.md)). The conversion uses `engineState.disableMouseEvents`
as a gate for the mouse, but touch always converts.

## Behavior summary

- Keyboard is global (window-level), mouse/touch are canvas-reactive (touch gated
  on canvas containment; mouse additionally gated by focus + `disableMouseEvents`).
- `isClicking` is edge-triggered (one shot per press) unless
  `disablePointerSet = true`.
- Nothing here needs `setup()` to have run, apart from default `(-1, -1)` / empty
  pointer positions — the handlers are live from import.

# Textures

## The texture argument

Everywhere a texture is accepted, the type is `TextureArg`
(`src/js/types.ts:37`):

```ts
type TextureArg = string | HTMLImageElement | null | undefined
```

- **`"color:#rrggbb"`** — a solid fill. `applyTexture` treats a string starting
  with `color:` as a color and **falls back to `null` texture** for any other
  string. Parsing uses `texture.startsWith("color:")` (not `split`), so
  `"color:red"` or `"color: #36b213"` both work.
- **`HTMLImageElement`** — stamped directly (usually a value from the `images`
  registry, e.g. the result of `loadImage`).
- **`null` / `undefined`** — no texture; resolves to the fallback.

## `applyTexture`

`applyTexture(target, texture, fallback)` (`src/js/classes/utils.ts:7-30`) writes
a `TextureState` (`usingColor: boolean`, `color: string`,
`texture: HTMLImageElement | null`) onto `target`:

| Input                | `usingColor` | `color`                | `texture`   |
| -------------------- | ------------ | ---------------------- | ----------- |
| `"color:xxx"` string | `true`       | `xxx` (after `color:`) | `null`      |
| non-`color:` string  | `false`      | unchanged              | `fallback`  |
| `HTMLImageElement`   | `false`      | unchanged              | the element |
| `null` / `undefined` | `false`      | unchanged              | `fallback`  |

So a garbage string is _not_ an error — it renders as the fallback texture.

## The `noTexture` fallback

The built-in `src/images/noTexture.png` is loaded by `setup()` into
`images["noTexture"]` and used as the fallback wherever no real texture is
available. `entity` constructors and `setTexture()` pass
`images["noTexture"] ?? null` as the fallback (`src/js/classes/entity.ts:37, 130`).
This is what you see as the pink placeholder if a requested texture ends up null.

## Where textures are used

| Consumer                       | Texture slots                                                                                  |
| ------------------------------ | ---------------------------------------------------------------------------------------------- |
| `entity` / `object` / `button` | one drawable texture (`src/js/classes/entity.ts:8-10`)                                         |
| `slider` / `sliderv`           | three separate parts: **background**, **thumb**, **fill** (`src/js/classes/slider.ts:129-134`) |

`slider` parts implement the `SliderPart` interface (`usingColor`, `color`,
`texture`); the fill also carries an `inverted` flag (see [ui](12-ui.md)).

## Setters

- `entity.setTexture(texture)` re-applies `applyTexture` with the `noTexture`
  fallback (`src/js/classes/entity.ts:129-131`). Objects and buttons share this.
- `_slider.setTexture(background, thumb, fill)` re-applies all three parts
  (`src/js/classes/slider.ts:329-337`).
- `_slider` parts can also be mutated directly (`speedSlider.thumb.borderRadius = 15`,
  `gravitySlider.borderRadius = 15` — as the demo does).

## Behavior notes

- A `button` that wants to hover-flash simply calls `setTexture(...)` each frame —
  cheap because it is just an object write.
- Textures are plain images; the alpha/rotation/scaling applied at draw time is
  per-entity (see [entities](10-entities.md)), never baked into the texture.
- `usingColor` entities draw nothing from the image registry — the color is filled
  directly. This means a `"color:#..."` texture works even before any image asset
  finishes loading (which is why the demo's button and player render instantly).
- Setting `alpha` on a drawable scales color fills too — `globalAlpha` is applied
  before the fill.

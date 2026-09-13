# Assets: loading and registries

All loading lives in `src/js/loader.ts`. Loaded assets are stored in the global
registries from `src/js/main.ts`:

| Registry | Type                               | Keyed by          |
| -------- | ---------------------------------- | ----------------- |
| `images` | `Record<string, HTMLImageElement>` | `name` or the URL |
| `sounds` | `Record<string, HTMLAudioElement>` | `name` or the URL |
| `fonts`  | `Record<string, FontFace>`         | `name` (required) |

## `waitForLoad()`

`await waitForLoad()` resolves once `engineState.assetsLoaded` is `true`
(`src/js/loader.ts:38-55`). It polls every 25ms. While waiting for assets it does
nothing special; when assets are done it resolves, and if the engine has not
started yet it queues `engineState.started = true` and emits **`started`** on the
next tick (`setTimeout 0` — guarded so it happens at most once).

- `assetsLoaded` itself is set by the 100ms loading-bar interval in `loader.ts`
  once `assetsToLoadCount === assetsToLoadDone`.
- `setup()` awaits `waitForLoad()` on its **first** call, so asset loading gates
  the loop start.

## `loadImage(url, name?)`

`loadImage(url, name?)` returns `Promise<HTMLImageElement>` that resolves with the
loaded image and stores it at `images[name ?? url]` (`src/js/loader.ts:58-87`).

Behavior:

1. **Cache hit** — if `images[key]` already exists, it returns the cached element
   immediately without a new request.
2. **Dedupe** — if a load for the same `key` is already in flight
   (`pendingImages`), it returns that same promise instead of issuing a second
   request. This makes concurrent same-key `loadImage` calls share one network load.
3. Otherwise it increments `engineState.assetsToLoadCount`, creates an `Image`,
   hooks `onload`/`onerror`, and sets `.src = url`. Handlers are attached
   **before** `src` is set (an important ordering fix for cache-completed loads).
4. On `onload`: increments `assetsToLoadDone` and resolves.
5. On `onerror`: increments `assetsToLoadDone` and rejects with
   `Failed to load texture: <url>`.
6. On success the element is stored in `images[key]`; the pending entry is deleted
   in a `finally`.

## `loadSound(url, name?)`

Same pattern as `loadImage`, storing to `sounds[name ?? url]`
(`src/js/loader.ts:90-119`). It creates `new Audio()`, and resolves on
`oncanplay` (not `onload`) with `assetsToLoadDone` incremented. `onerror` rejects
with `Failed to load sound: <url>`.

## `loadFont(url, name)`

Fonts require an explicit `name` (the font-family you pass to draw calls)
(`src/js/loader.ts:122-153`):

1. Cache / dedupe on `fonts[name]` / `pendingFonts[name]`.
2. Creates `new FontFace(name, url(<url>))` and awaits `fontFace.load()`.
3. On success increments `assetsToLoadDone`, registers the face with
   `document.fonts.add(fontFace)`, stores it in `fonts[name]`.
4. On failure increments `assetsToLoadDone` and rejects with
   `Failed to load font: <url>` (with `{ cause }`).
5. **Cleanup on failure:** the error path deletes `fonts[name]` (so a stale entry
   never persists) and rethrows; pending is cleared in `finally`.

## Asset counters and the loading bar

`engineState.assetsToLoadCount` / `assetsToLoadDone` are the engine's loading
progress. Every successful or failed load ticks `Done` by exactly one — so a
failed load cannot stall the bar. The bar itself is only cosmetic: the real gate
is `assetsLoaded`, set when counts match.

## Behavior notes

- Loads are fire-and-forget as far as the caller is concerned: even if you never
  `await` the returned promise, the load completes, the registry updates and
  `Done` increments (unless rejected).
- Calling `loadImage(bunny, "bunny")` twice returns the same element; the second
  call is free.
- Failed loads still advance the loading bar (no deadlock on the boot await), but
  `setup()` proceeds even if an asset failed — the promise rejection is on the
  caller to handle.
- Use `name` to keep friendly identifiers rather than raw URLs (the demo loads
  `bunny`, `park`, `bubbly`).

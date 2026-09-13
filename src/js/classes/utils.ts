import type { TextureArg, TextureState } from "../types.ts"

/**
 * Applies a raw texture (a `"color:#..."` string, an image, or nothing) onto
 * `target`, falling back to `fallback` for non-color strings and empty values.
 */
export function applyTexture(
    target: TextureState,
    texture: TextureArg,
    fallback: HTMLImageElement | null = null,
): void {
    if (typeof texture === "string") {
        if (texture.startsWith("color:")) {
            target.usingColor = true
            target.color = texture.slice(6)
            target.texture = null
            return
        }
        target.usingColor = false
        target.texture = fallback
        return
    }
    if (texture instanceof HTMLImageElement) {
        target.usingColor = false
        target.texture = texture
        return
    }
    target.usingColor = false
    target.texture = fallback
}

/** Clamps `value` into the inclusive range `[min, max]`. */
export function clamp(value: number, min: number, max: number): number {
    return Math.max(Math.min(value, max), min)
}

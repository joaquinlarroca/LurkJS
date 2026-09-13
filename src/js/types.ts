/** Degrees to radians conversion factor. */
export const DEG_TO_RAD = 0.017453292519943295

/** A 2D coordinate or size pair. */
export type Vec2 = [number, number]

/** Discriminator for the four supported collider shapes. */
export type HitboxType =
    "hitbox-rect" | "hitbox-rect-fixed" | "hitbox-circle" | "hitbox-circle-fixed"

/** Structural type of anything the pointer/hitbox helpers can operate on. */
export interface HitboxLike {
    type: HitboxType
    x: number
    y: number
    width: number
    height: number
    left: number
    right: number
    top: number
    bottom: number
    radius: number
    updateDimensions(): void
}

/** Anything that can own an attached collider (objects, slider thumbs, ...). */
export interface ColliderOwner {
    x: number
    y: number
    width: number
    height: number
    halfwidth?: number
    halfheight?: number
}

/** Accepted raw texture input: a "color:#..." string, an image, or none. */
export type TextureArg = string | HTMLImageElement | null | undefined

/** Resolved texture state used across all drawables. */
export interface TextureState {
    usingColor: boolean
    color: string
    texture: HTMLImageElement | null
}

/** A mouse or touch input pointer. */
export interface Pointer {
    key: string
    type: "mouse" | "touch"
    down: boolean
    attached?: unknown
    x: number
    y: number
}

/** Metadata describing a registered engine plugin. */
export interface PluginInfo {
    name: string
    version: string
    author: string
    description: string
    path: string
    config: Record<string, unknown>
}

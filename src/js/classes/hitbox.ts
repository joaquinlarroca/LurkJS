import { engineState, screen } from "../main.ts"
import type { ColliderOwner, HitboxLike, HitboxType, Vec2 } from "../types.ts"

/**
 * A collider. Constructed from an owner object for attached shapes, or from
 * plain coordinates for fixed shapes.
 */
export class hitbox {
    type: HitboxType
    /** The owning entity for attached hitboxes, null for fixed ones. */
    object: ColliderOwner | null
    sizeMultiplier: number
    x: number
    y: number
    width: number
    height: number
    left: number
    right: number
    top: number
    bottom: number
    radius: number

    constructor(object: ColliderOwner, sizeMultiplier?: number)
    constructor(position: Vec2, size: Vec2)
    constructor(position: Vec2, radius: number)
    constructor(a: ColliderOwner | Vec2, b?: number | Vec2) {
        engineState.hitboxes.push(this)
        this.sizeMultiplier = 1
        this.radius = 0
        this.x = 0
        this.y = 0
        this.width = 0
        this.height = 0
        this.left = 0
        this.right = 0
        this.top = 0
        this.bottom = 0
        if (Array.isArray(a)) {
            this.object = null
            this.x = a[0] ?? 0
            this.y = a[1] ?? 0
            if (Array.isArray(b)) {
                this.type = "hitbox-rect-fixed"
                this.width = b[0] ?? 0
                this.height = b[1] ?? 0
            } else {
                this.type = "hitbox-circle-fixed"
                this.radius = typeof b === "number" ? b : 32
            }
        } else {
            this.object = a ?? null
            this.sizeMultiplier = typeof b === "number" ? b : 1
            this.type = "hitbox-rect"
        }
    }

    /** Recomputes bounds/center from the current owner state (fixed shapes are static). */
    updateDimensions(): void {
        if (this.type === "hitbox-rect" || this.type === "hitbox-rect-fixed") {
            if (this.object) {
                this.x = this.object.x
                this.y = this.object.y
                this.width = this.object.width
                this.height = this.object.height
            }
            const shrink = (1 - this.sizeMultiplier) * 0.5
            this.left = this.x + this.width * shrink
            this.right = this.x + this.width - this.width * shrink
            this.top = this.y + this.height * shrink
            this.bottom = this.y + this.height - this.height * shrink
        } else {
            if (this.object) {
                this.x = this.object.x + (this.object.halfwidth ?? this.object.width / 2)
                this.y = this.object.y + (this.object.halfheight ?? this.object.height / 2)
                this.radius =
                    Math.min(
                        this.object.halfwidth ?? this.object.width / 2,
                        this.object.halfheight ?? this.object.height / 2,
                    ) * this.sizeMultiplier
            }
        }
    }

    /** Tests for collision against another hitbox. */
    collide(other: HitboxLike): boolean {
        this.updateDimensions()
        other.updateDimensions()
        switch (this.type) {
            case "hitbox-rect":
            case "hitbox-rect-fixed":
                if (other.type === "hitbox-rect" || other.type === "hitbox-rect-fixed") {
                    return (
                        this.right >= other.left &&
                        this.left <= other.right &&
                        this.bottom >= other.top &&
                        this.top <= other.bottom
                    )
                }
                {
                    const dx = other.x - Math.max(this.left, Math.min(other.x, this.right))
                    const dy = other.y - Math.max(this.top, Math.min(other.y, this.bottom))
                    return Math.hypot(dx, dy) <= other.radius
                }
            case "hitbox-circle":
            case "hitbox-circle-fixed": {
                if (other.type === "hitbox-rect" || other.type === "hitbox-rect-fixed") {
                    const dx = this.x - Math.max(other.left, Math.min(this.x, other.right))
                    const dy = this.y - Math.max(other.top, Math.min(this.y, other.bottom))
                    return Math.hypot(dx, dy) <= this.radius
                }
                return Math.hypot(other.x - this.x, other.y - this.y) <= this.radius + other.radius
            }
            default:
                return false
        }
    }

    /** Debug visualization. */
    draw(): void {
        this.updateDimensions()
        screen.context.save()
        screen.context.strokeStyle = "red"
        screen.context.lineWidth = 2
        if (this.type === "hitbox-rect" || this.type === "hitbox-rect-fixed") {
            screen.context.strokeRect(this.left, this.top, this.width, this.height)
        } else {
            screen.context.beginPath()
            screen.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI)
            screen.context.stroke()
        }
        screen.context.restore()
    }
}

/** A rectangle collider with a fixed position and size. */
export class hitboxFixed extends hitbox {
    constructor(position: Vec2, size: Vec2) {
        super(position, size)
    }
}

/** A circle collider anchored to an owner object. */
export class hitboxCircle extends hitbox {
    constructor(object: ColliderOwner, sizeMultiplier = 1) {
        super(object, sizeMultiplier)
        this.type = "hitbox-circle"
    }
}

/** A circle collider with a fixed center and radius. */
export class hitboxCircleFixed extends hitbox {
    constructor(position: Vec2, radius = 32) {
        super(position, radius)
        this.type = "hitbox-circle-fixed"
    }
}

/** A list of hitboxes with a convenience `draw()` helper attached. */
export type HitboxList = hitbox[] & { draw(): void }

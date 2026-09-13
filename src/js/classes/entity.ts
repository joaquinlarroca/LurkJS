import { engineState, images, screen } from "../main.ts"
import { DEG_TO_RAD, type TextureArg, type Vec2 } from "../types.ts"
import { hitbox, type HitboxList } from "./hitbox.ts"
import { applyTexture } from "./utils.ts"

/** Base drawable entity with position, size, transform and a default hitbox. */
export class entity {
    usingColor = false
    color = "rgba(0,0,0,0)"
    texture: HTMLImageElement | null = null
    x: number
    y: number
    offset: Vec2 = [0.5, 0.5]
    toDelete = false
    width: number
    height: number
    halfwidth: number
    halfheight: number
    scale: Vec2 = [1, 1]
    hitboxes: HitboxList
    anchor: { x: number; y: number }
    angle = 0
    alpha = 1
    borderRadius = 0
    stroke = {
        active: false,
        color: "#FFFFFF",
        width: 5,
    }

    constructor(
        texture: TextureArg,
        [x = 0, y = 0]: Vec2 = [0, 0],
        [width = 32, height = 32]: Vec2 = [32, 32],
    ) {
        engineState.objects.push(this)
        applyTexture(this, texture, images["noTexture"] ?? null)
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.halfwidth = width / 2
        this.halfheight = height / 2
        this.hitboxes = Object.assign([new hitbox(this, 1)], {
            draw: () => {
                for (const hitbox of this.hitboxes) {
                    hitbox.draw()
                }
            },
        })
        this.anchor = {
            x: this.x + this.width * this.offset[0],
            y: this.y + this.height * this.offset[1],
        }
    }

    /** True when any of this object's hitboxes collide with the other's. */
    collidesWith(other: entity): boolean {
        for (const hitboxes of this.hitboxes) {
            for (const otherHitboxes of other.hitboxes) {
                if (hitboxes.collide(otherHitboxes)) {
                    return true
                }
            }
        }
        return false
    }

    /** Refreshes cached half-dimensions and the anchor point. */
    update(): void {
        this.halfwidth = this.width / 2
        this.halfheight = this.height / 2
        this.anchor = {
            x: this.x + this.width * this.offset[0],
            y: this.y + this.height * this.offset[1],
        }
    }

    /** Draws the texture via the current transform, clipped to a rounded rect. */
    draw(): void {
        this.update()
        screen.context.save()
        screen.context.globalAlpha = this.alpha

        screen.context.translate(this.anchor.x, this.anchor.y)
        screen.context.rotate(DEG_TO_RAD * this.angle)
        screen.context.scale(this.scale[0], this.scale[1])

        screen.context.fillStyle = "rgba(0,0,0,0)"
        screen.context.beginPath()
        screen.context.roundRect(
            -this.width * this.offset[0],
            -this.height * this.offset[1],
            this.width,
            this.height,
            this.borderRadius,
        )
        if (this.stroke.active) {
            screen.context.strokeStyle = this.stroke.color
            screen.context.lineWidth = this.stroke.width
            screen.context.stroke()
        }
        screen.context.closePath()
        screen.context.clip()
        if (this.usingColor) {
            screen.context.fillStyle = this.color
            screen.context.beginPath()
            screen.context.roundRect(
                -this.width * this.offset[0],
                -this.height * this.offset[1],
                this.width,
                this.height,
                this.borderRadius,
            )
            screen.context.fill()
        } else if (this.texture) {
            screen.context.drawImage(
                this.texture,
                -this.width * this.offset[0],
                -this.height * this.offset[1],
                this.width,
                this.height,
            )
        }
        screen.context.restore()
    }

    /** Replaces the drawable texture. */
    setTexture(texture: TextureArg): void {
        applyTexture(this, texture, images["noTexture"] ?? null)
    }

    /** Marks this entity for removal from the engine at the next frame boundary. */
    destroy(): void {
        this.toDelete = true
    }

    /** Points the object towards `point` (angle in degrees). */
    angleToPoint(point: Vec2): void {
        this.update()
        this.angle =
            Math.atan2(
                point[1] - (this.y + this.halfheight),
                point[0] - (this.x + this.halfwidth),
            ) *
            (180 / Math.PI)
    }

    /** Moves `steps` pixels along the current angle. */
    move(steps: number): void {
        const angleRad = (this.angle * Math.PI) / 180
        const deltaX = Math.cos(angleRad) * steps
        const deltaY = Math.sin(angleRad) * steps
        this.x += deltaX
        this.y += deltaY
    }
}

// `object` cannot be a class declaration name in TS, so the class is exported
// under its original public API name.
export { entity as object }

import { isClicking, isHovering, isPointer, pointers } from "../listeners.ts"
import { engineState, screen } from "../main.ts"
import { DEG_TO_RAD, type Pointer, type TextureArg, type Vec2 } from "../types.ts"
import { hitbox, type HitboxList } from "./hitbox.ts"
import { applyTexture, clamp } from "./utils.ts"

/** A fill: either a solid color or an image texture. */
export interface SliderPart {
    usingColor: boolean
    color: string
    texture: HTMLImageElement | null
}

/** The draggable thumb of a slider. */
export interface SliderThumb extends SliderPart {
    x: number
    y: number
    width: number
    height: number
    blocked: boolean
    borderRadius: number
}

/** In-progress drag pointer tracking. */
export interface DragState {
    hasSet: boolean
    pointer: Pointer | undefined
    offset: { x: number; y: number }
}

interface DrawScreen {
    context: CanvasRenderingContext2D
}

/** Fills or stamps `part` at the given rect, depending on its texture state. */
export function drawPart(
    screen: DrawScreen,
    part: SliderPart,
    x: number,
    y: number,
    width: number,
    height: number,
): void {
    if (part.usingColor) {
        screen.context.fillStyle = part.color
        screen.context.fillRect(x, y, width, height)
        screen.context.fillStyle = "rgba(0,0,0,0)"
    } else if (part.texture) {
        screen.context.drawImage(part.texture, x, y, width, height)
    }
}

type Orientation = "horizontal" | "vertical"

/** Shared slider implementation; `slider` and `sliderv` are thin wrappers over it. */
class _slider {
    orientation: Orientation
    minpercentage: number
    maxpercentage: number
    percentage: number
    thumb: SliderThumb
    background: SliderPart
    fill: SliderPart & { inverted: boolean }
    x: number
    y: number
    width: number
    height: number
    halfwidth: number
    halfheight: number
    offset: Vec2 = [0.5, 0.5]
    anchor: { x: number; y: number }
    angle = 0
    alpha = 1
    borderRadius = 0
    drag: DragState
    hitboxes: HitboxList
    hover = false
    click = false
    toDelete = false

    constructor(
        background_texture: TextureArg,
        thumb_texture: TextureArg,
        fill_texture: TextureArg,
        [x, y]: Vec2,
        [width, height]: Vec2,
        thumb_size: number,
        [minpercentage, maxpercentage]: [number, number],
        currentpercentage: number,
        orientation: Orientation,
    ) {
        engineState.sliders.push(this)
        this.orientation = orientation
        this.maxpercentage = maxpercentage
        this.minpercentage = minpercentage
        this.percentage = clamp(currentpercentage, minpercentage, maxpercentage)

        this.x = x
        this.y = y
        this.width = width
        this.height = height

        const ratio = (this.percentage - minpercentage) / (maxpercentage - minpercentage)
        this.thumb = {
            usingColor: false,
            color: "rgba(0,0,0,0)",
            texture: null,
            x: x,
            y: y,
            height: height,
            width: width,
            blocked: false,
            borderRadius: 0,
        }
        if (orientation === "vertical") {
            this.thumb.height = thumb_size
            this.thumb.y = ratio * height + y - thumb_size * ratio
            if (thumb_size > height / 2) {
                this.thumb.height = width
            }
        } else {
            this.thumb.width = thumb_size
            this.thumb.x = ratio * width + x - thumb_size * ratio
            if (thumb_size > width / 2) {
                this.thumb.width = height
            }
        }

        this.background = { usingColor: false, color: "rgba(0,0,0,0)", texture: null }
        this.fill = { usingColor: false, color: "rgba(0,0,0,0)", texture: null, inverted: false }

        applyTexture(this.background, background_texture, null)
        applyTexture(this.thumb, thumb_texture, null)
        applyTexture(this.fill, fill_texture, null)

        this.drag = {
            hasSet: false,
            pointer: undefined,
            offset: {
                x: 0,
                y: 0,
            },
        }

        this.hitboxes = Object.assign([new hitbox(this, 1), new hitbox(this.thumb, 1)], {
            draw: () => {
                for (const hitbox of this.hitboxes) {
                    hitbox.draw()
                }
            },
        })

        this.halfwidth = width / 2
        this.halfheight = height / 2
        this.anchor = {
            x: this.x + this.width * this.offset[0],
            y: this.y + this.height * this.offset[1],
        }
    }

    /** True along the drag axis, false along the perpendicular one. */
    private get isVertical(): boolean {
        return this.orientation === "vertical"
    }

    update(): void {
        if (isHovering(this.hitboxes[0]!) && !this.thumb.blocked) {
            this.hover = true
            this.click = isClicking(this.hitboxes[1]!, true)
        } else {
            this.hover = false
            this.click = false
        }
        if (!this.thumb.blocked) {
            if (!this.drag.hasSet && this.drag.pointer === undefined) {
                const pointer = isPointer(this.hitboxes[1]!)
                if (pointer && pointer.down === true && pointer.attached === undefined) {
                    this.drag.hasSet = true
                    pointer.attached = this
                    this.drag.pointer = pointer
                    this.drag.offset.x = pointer.x - this.thumb.x
                    this.drag.offset.y = pointer.y - this.thumb.y
                }
            } else if (this.drag.pointer) {
                const pointer = pointers[this.drag.pointer.key]
                if (pointer && pointer.down) {
                    if (this.isVertical) {
                        const maxY = this.y + this.height - this.thumb.height
                        this.thumb.y = Math.min(
                            Math.max(pointer.y - this.drag.offset.y, this.y),
                            maxY,
                        )
                        this.percentage =
                            ((this.thumb.y - this.y) * (this.maxpercentage - this.minpercentage)) /
                                (this.height - this.thumb.height) +
                            this.minpercentage
                    } else {
                        const maxX = this.x + this.width - this.thumb.width
                        this.thumb.x = Math.min(
                            Math.max(pointer.x - this.drag.offset.x, this.x),
                            maxX,
                        )
                        this.percentage =
                            ((this.thumb.x - this.x) * (this.maxpercentage - this.minpercentage)) /
                                (this.width - this.thumb.width) +
                            this.minpercentage
                    }
                } else {
                    const current = pointers[this.drag.pointer.key]
                    if (current) {
                        current.attached = undefined
                    }
                    this.drag.hasSet = false
                    this.drag.pointer = undefined
                }
            }
        }
        this.percentage =
            Math.round(clamp(this.percentage, this.minpercentage, this.maxpercentage) * 100) / 100
        const ratio =
            (this.percentage - this.minpercentage) / (this.maxpercentage - this.minpercentage)
        if (this.isVertical) {
            this.thumb.y = ratio * this.height + this.y - this.thumb.height * ratio
            this.thumb.x = this.x
        } else {
            this.thumb.x = ratio * this.width + this.x - this.thumb.width * ratio
            this.thumb.y = this.y
        }

        this.halfwidth = this.width / 2
        this.halfheight = this.height / 2
        this.anchor = {
            x: this.x + this.width * this.offset[0],
            y: this.y + this.height * this.offset[1],
        }
    }

    draw(): void {
        screen.context.save()
        screen.context.translate(this.anchor.x, this.anchor.y)
        screen.context.rotate(DEG_TO_RAD * this.angle)
        screen.context.globalAlpha = this.alpha

        screen.context.fillStyle = "rgba(0,0,0,0)"
        screen.context.beginPath()
        screen.context.roundRect(
            -this.width * this.offset[0],
            -this.height * this.offset[1],
            this.width,
            this.height,
            this.borderRadius,
        )
        screen.context.closePath()
        screen.context.clip()

        drawPart(
            screen,
            this.background,
            -this.width * this.offset[0],
            -this.height * this.offset[1],
            this.width,
            this.height,
        )
        screen.context.fill()

        const percentage_slider =
            (this.percentage - this.minpercentage) / (this.maxpercentage - this.minpercentage)
        const fill = {
            x: -this.width * this.offset[0],
            y: -this.height * this.offset[1],
            width: this.width,
            height: this.height,
        }
        if (this.isVertical) {
            fill.height =
                percentage_slider * this.height -
                percentage_slider * this.thumb.height +
                this.thumb.height / 2
        } else {
            fill.width =
                percentage_slider * this.width -
                percentage_slider * this.thumb.width +
                this.thumb.width / 2
        }
        if (this.fill.inverted) {
            const inverted_percentage = 1 - percentage_slider
            if (this.isVertical) {
                fill.y = -this.height * this.offset[1] + this.height
                fill.height =
                    -inverted_percentage * this.height +
                    inverted_percentage * this.thumb.height -
                    this.thumb.height / 2
                fill.width = this.width
            } else {
                fill.x = -this.width * this.offset[0] + this.width
                fill.width =
                    -inverted_percentage * this.width +
                    inverted_percentage * this.thumb.width -
                    this.thumb.width / 2
                fill.height = this.height
            }
        }
        drawPart(screen, this.fill, fill.x, fill.y, fill.width, fill.height)
        screen.context.fillStyle = "rgba(0,0,0,0)"

        const thumbX = this.isVertical
            ? -this.width * this.offset[0]
            : -this.width * this.offset[0] + this.thumb.x - this.x
        const thumbY = this.isVertical
            ? -this.height * this.offset[1] + this.thumb.y - this.y
            : -this.height * this.offset[1]
        screen.context.beginPath()
        screen.context.roundRect(
            thumbX,
            thumbY,
            this.thumb.width,
            this.thumb.height,
            this.thumb.borderRadius,
        )
        screen.context.clip()
        screen.context.closePath()
        drawPart(screen, this.thumb, thumbX, thumbY, this.thumb.width, this.thumb.height)
        screen.context.fillStyle = "rgba(0,0,0,0)"
        screen.context.fill()
        screen.context.restore()
    }

    /** Replaces the background, thumb and fill textures. */
    setTexture(
        background_texture: TextureArg,
        thumb_texture: TextureArg,
        fill_texture: TextureArg,
    ): void {
        applyTexture(this.background, background_texture, null)
        applyTexture(this.thumb, thumb_texture, null)
        applyTexture(this.fill, fill_texture, null)
    }

    /** Marks this slider for removal from the engine at the next frame boundary. */
    destroy(): void {
        this.toDelete = true
        for (const hitbox of this.hitboxes) {
            const index = engineState.hitboxes.indexOf(hitbox)
            if (index >= 0) {
                engineState.hitboxes.splice(index, 1)
            }
        }
    }
}

/** A horizontal slider with background, fill and draggable thumb. */
export class slider extends _slider {
    constructor(
        background_texture: TextureArg,
        thumb_texture: TextureArg,
        fill_texture: TextureArg,
        position: Vec2,
        size: Vec2,
        thumb_width: number,
        range: [number, number],
        currentpercentage: number,
    ) {
        super(
            background_texture,
            thumb_texture,
            fill_texture,
            position,
            size,
            thumb_width,
            range,
            currentpercentage,
            "horizontal",
        )
    }
}

/** A vertical slider with background, fill and draggable thumb. */
export class sliderv extends _slider {
    constructor(
        background_texture: TextureArg,
        thumb_texture: TextureArg,
        fill_texture: TextureArg,
        position: Vec2,
        size: Vec2,
        thumb_height: number,
        range: [number, number],
        currentpercentage: number,
    ) {
        super(
            background_texture,
            thumb_texture,
            fill_texture,
            position,
            size,
            thumb_height,
            range,
            currentpercentage,
            "vertical",
        )
    }
}

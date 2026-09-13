import { drawText } from "../functions.ts"
import { isClicking, isHovering } from "../listeners.ts"
import { engineState, screen } from "../main.ts"
import type { TextureArg, Vec2 } from "../types.ts"
import { entity } from "./entity.ts"
import { timeout } from "./timeout.ts"

export interface ButtonText {
    text: string
    color: string
    size: number
    fontFamily: string
    align: CanvasTextAlign
    baseline: CanvasTextBaseline
    pos: {
        align: number
        baseline: number
    }
}

/** A clickable button that tracks hovered/clicked state and text. */
export class button extends entity {
    clicked = false
    hovered = false
    disabled = false
    text: ButtonText
    timeout: timeout

    constructor(
        texture: TextureArg,
        [x, y]: Vec2,
        [width, height]: Vec2,
        [text, color, size, fontFamily]: [string, string, number, string],
        timeVal = 500,
    ) {
        super(texture, [x, y], [width, height])
        engineState.buttons.push(this)
        this.text = {
            text,
            color,
            size,
            fontFamily,
            align: "center",
            baseline: "middle",
            pos: {
                align: 0,
                baseline: 0,
            },
        }
        this.timeout = new timeout(timeVal)
    }

    override update(): void {
        if (this.disabled) {
            this.hovered = false
            this.clicked = false
        } else {
            if (isHovering(this.hitboxes[0]!)) {
                this.hovered = true
            } else {
                this.hovered = false
            }
            if (isClicking(this.hitboxes[0]!) && !this.timeout.active) {
                this.clicked = true
                this.timeout.start()
            } else if (!this.timeout.active) {
                this.clicked = false
            }
        }
        super.update()
    }

    override draw(): void {
        super.draw()
        screen.context.fillStyle = this.text.color
        switch (this.text.align) {
            case "left":
                this.text.pos.align = this.x
                break
            case "right":
                this.text.pos.align = this.x + this.width
                break
            case "center":
                this.text.pos.align = this.x + this.halfwidth
                break
            default:
                this.text.pos.align = this.x + this.halfwidth
                break
        }
        switch (this.text.baseline) {
            case "top":
                this.text.pos.baseline = this.y
                break
            case "middle":
                this.text.pos.baseline = this.y + this.halfheight
                break
            case "bottom":
                this.text.pos.baseline = this.y + this.height
                break
            default:
                this.text.pos.baseline = this.y + this.halfheight
                break
        }
        drawText(
            this.text.text,
            [this.text.pos.align, this.text.pos.baseline],
            this.text.size,
            this.text.fontFamily,
            this.text.baseline,
            this.text.align,
            this.angle,
            this.alpha,
        )
    }
}

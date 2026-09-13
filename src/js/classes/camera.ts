import { engineState, screen } from "../main.ts"

/** Captures the current canvas into a crop area and redraws it scaled. */
export class camera {
    x: number
    y: number
    width: number
    height: number
    viewport: { x: number; y: number; width: number; height: number }
    snapshot: HTMLCanvasElement | undefined
    toDelete = false

    constructor(
        [x, y, w, h]: [number, number, number, number],
        [vx, vy, vw, vh]: [number, number, number, number],
    ) {
        engineState.cameras.push(this)
        this.x = x
        this.y = y
        this.width = w
        this.height = h
        this.viewport = {
            x: vx,
            y: vy,
            width: vw,
            height: vh,
        }
    }

    /** Freezes the current canvas content so `draw()` can replay it scaled. */
    crop(): void {
        const copy = document.createElement("canvas")
        copy.width = screen.canvas.width
        copy.height = screen.canvas.height
        copy.getContext("2d")?.drawImage(screen.canvas, 0, 0)
        this.snapshot = copy
    }

    /** Draws the frozen snapshot into the viewport, scaled to the camera rect. */
    draw(): void {
        if (!this.snapshot) {
            return
        }
        screen.context.drawImage(
            this.snapshot,
            this.viewport.x,
            this.viewport.y,
            this.viewport.width,
            this.viewport.height,
            this.x,
            this.y,
            this.width,
            this.height,
        )
    }

    /** Debug visualization of the crop area. */
    drawCropArea(): void {
        screen.context.save()
        screen.context.strokeStyle = "#0000FF"
        screen.context.lineWidth = (screen.canvas.width / screen.canvas.height) * 2
        screen.context.strokeRect(
            this.viewport.x,
            this.viewport.y,
            this.viewport.width,
            this.viewport.height,
        )
        screen.context.restore()
    }

    /** Marks this camera for removal from the engine at the next frame boundary. */
    destroy(): void {
        this.toDelete = true
    }
}

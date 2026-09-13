import { DEG_TO_RAD, type ColliderOwner, type Vec2 } from "./types.ts"
import { engineState, screen, time } from "./main.ts"
import { emit } from "./events.ts"
import { loadImage, waitForLoad } from "./loader.ts"
import noTextureUrl from "../images/noTexture.png"

const canvasBG = screen.css.computedStyles.getPropertyValue("--canvas-bg").trim() || "#000000"

const MAX_FIXED_STEPS = 10

/**
 * Creates the canvas, scales it to fit the window and starts the game loop.
 * Dispatches `update` every frame, `fixedUpdate` on a fixed timestep and
 * `afterUpdate` right after `update`.
 */
export async function setup(
    width: number,
    height: number,
    marginMultiplier = 1,
    targetFixedFps = 60,
): Promise<void> {
    if (!engineState.setUp) {
        screen.canvas.width = width
        screen.canvas.height = height
        loadImage(noTextureUrl, "noTexture")
        await waitForLoad()
    }
    if (typeof width === "number" && typeof height === "number" && width > 0 && height > 0) {
        if (
            typeof marginMultiplier === "number" &&
            (marginMultiplier < 0 || marginMultiplier > 1)
        ) {
            marginMultiplier = 1
        }
        const clientWidth = document.documentElement.clientWidth
        const clientHeight = document.documentElement.clientHeight

        let adjustedWidth, adjustedHeight

        if (clientWidth / clientHeight > width / height) {
            adjustedHeight = clientHeight
            adjustedWidth = (clientHeight * width) / height
        } else {
            adjustedWidth = clientWidth
            adjustedHeight = (clientWidth * height) / width
        }
        adjustedWidth *= marginMultiplier
        adjustedHeight *= marginMultiplier

        screen.canvas.style.width = `${adjustedWidth}px`
        screen.canvas.style.height = `${adjustedHeight}px`

        screen.context.imageSmoothingEnabled = false

        if (!engineState.setUp) {
            engineState.setUp = true
            engineState.canvas.marginMultiplier = marginMultiplier
            engineState.appendTo.append(screen.canvas)

            let timestamp = performance.now()
            let accumulator = 0
            const fixedDeltaTime = 1 / targetFixedFps
            function update(currentTimestamp: number) {
                time.frameCount += 1
                const deltaTime = (currentTimestamp - timestamp) / 1000
                time.deltaTime = deltaTime
                time.time += deltaTime
                if (deltaTime > 0) {
                    engineState.fps = Number((1 / deltaTime).toFixed(0))
                }
                timestamp = currentTimestamp

                accumulator += deltaTime
                let steps = 0
                while (accumulator >= fixedDeltaTime && steps < MAX_FIXED_STEPS) {
                    time.fixedDeltaTime = fixedDeltaTime
                    emit("fixedUpdate")
                    accumulator -= fixedDeltaTime
                    steps += 1
                }
                // Drop leftover time after a heavy frame so the loop doesn't spiral.
                if (steps >= MAX_FIXED_STEPS) {
                    accumulator = 0
                }
                emit("update")
                emit("afterUpdate")

                const hasDoomedEntities = engineState.objects.some((entry) => entry.toDelete)
                const hasDoomedSliders = engineState.sliders.some((entry) => entry.toDelete)
                if (hasDoomedEntities || hasDoomedSliders) {
                    const doomedEntities = new Set<ColliderOwner>(
                        engineState.objects.filter((entry) => entry.toDelete),
                    )
                    const doomedSliders = new Set<ColliderOwner>(
                        engineState.sliders.filter((entry) => entry.toDelete),
                    )
                    engineState.objects = engineState.objects.filter(
                        (entry) => !doomedEntities.has(entry),
                    )
                    engineState.buttons = engineState.buttons.filter(
                        (entry) => !doomedEntities.has(entry),
                    )
                    engineState.hitboxes = engineState.hitboxes.filter(
                        (entry) =>
                            !(
                                entry.object &&
                                (doomedEntities.has(entry.object) ||
                                    doomedSliders.has(entry.object))
                            ),
                    )
                    engineState.sliders = engineState.sliders.filter(
                        (entry) => !doomedSliders.has(entry),
                    )
                }
                if (engineState.cameras.some((entry) => entry.toDelete)) {
                    engineState.cameras = engineState.cameras.filter((entry) => !entry.toDelete)
                }
                if (engineState.soundPlayers.some((entry) => entry.toDelete)) {
                    engineState.soundPlayers = engineState.soundPlayers.filter(
                        (entry) => !entry.toDelete,
                    )
                }
                requestAnimationFrame(update)
            }
            requestAnimationFrame(update)
        }
    }
}

/** Clears the canvas with the configured background color. */
export function clear(): void {
    screen.context.save()
    screen.context.fillStyle = canvasBG
    screen.context.fillRect(0, 0, screen.canvas.width, screen.canvas.height)
    screen.context.restore()
}

/** Draws text anchored at `[x, y]`, in degrees, with optional alpha. */
export function drawText(
    text = "undefined",
    [x = 0, y = 0]: Vec2 = [0, 0],
    fontSize = 24,
    fontFamily = "sans-serif",
    baseline: CanvasTextBaseline = "top",
    textAlign: CanvasTextAlign = "start",
    angle = 0,
    alpha = 1.0,
): void {
    screen.context.save()
    screen.context.textBaseline = baseline
    screen.context.textAlign = textAlign
    screen.context.font = `${fontSize}px ${fontFamily}`
    screen.context.translate(x, y)
    screen.context.rotate(DEG_TO_RAD * angle)
    screen.context.globalAlpha = alpha
    screen.context.fillText(text, 0, 0)
    screen.context.restore()
}

/** Measures the width of `text` in the given font. */
export function measureTextWidth(
    text: string | number,
    fontSize: number,
    fontFamily: string,
): number {
    screen.context.save()
    text = text.toString()
    screen.context.font = `${fontSize}px ${fontFamily}`
    const textMetrics = screen.context.measureText(text)
    screen.context.restore()
    return textMetrics.width
}

/** Euclidean distance between two points. */
export function distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.hypot(x2 - x1, y2 - y1)
}

/** Linear interpolation between `startValue` and `endValue`. */
export function lerp(startValue: number, endValue: number, interpolation: number): number {
    return startValue + (endValue - startValue) * interpolation
}

/** Randomly shakes the canvas transform for `duration` milliseconds. */
export function shakeScreen(intensity: number, duration: number): void {
    if (!engineState.shakingScreen) {
        engineState.shakingScreen = true
        const matrix = screen.context.getTransform()
        const startX = matrix.e
        const startY = matrix.f
        const start = performance.now()
        const tick = (currentTime: number) => {
            if (currentTime - start < duration) {
                const xShift = (Math.random() * 2 - 1) * intensity
                const yShift = (Math.random() * 2 - 1) * intensity
                screen.context.setTransform(
                    matrix.a,
                    matrix.b,
                    matrix.c,
                    matrix.d,
                    startX + xShift,
                    startY + yShift,
                )
                requestAnimationFrame(tick)
            } else {
                screen.context.setTransform(matrix)
                engineState.shakingScreen = false
            }
        }
        requestAnimationFrame(tick)
    }
}

/** Returns true when `color` parses as a valid CSS color. */
export function isValidColor(color: string): boolean {
    const validate = new Option().style
    validate.color = color
    return validate.color !== ""
}

/** Formats the elapsed time since `startTime` as `MM:SS`. */
export function getTimeElapsed(startTime: number): string {
    const now = Date.now()
    const elapsed = now - startTime

    const minutes = Math.floor(elapsed / (1000 * 60))
    const seconds = Math.floor((elapsed % (1000 * 60)) / 1000)

    const formattedMinutes = minutes.toString().padStart(2, "0")
    const formattedSeconds = seconds.toString().padStart(2, "0")

    return `${formattedMinutes}:${formattedSeconds}`
}

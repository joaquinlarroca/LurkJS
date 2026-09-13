import { distance, setup } from "./functions.ts"
import { engineState, screen } from "./main.ts"
import type { HitboxLike, Pointer } from "./types.ts"

/** Keys the browser is prevented from handling while the canvas is focused. */
export const preventKeys: ReadonlySet<string> = new Set([
    "Control",
    "Alt",
    "Meta",
    "Enter",
    "Tab",
    "F1",
    "F2",
    "F3",
    "F4",
    "F5",
    "F6",
    "F7",
    "F8",
    "F9",
    "F10",
    "F11",
    "F12",
])

export const pressedKeys = new Set<string>()

export function keyPressed(key: string): boolean {
    if (typeof key !== "string") {
        return false
    }
    if (key == "space") {
        key = " "
    }
    return pressedKeys.has(key.toUpperCase())
}
window.addEventListener("keydown", (event) => {
    if (preventKeys.has(event.key) && document.activeElement === screen.canvas) {
        event.preventDefault()
    }
    pressedKeys.add(event.key.toUpperCase())
})

window.addEventListener("keyup", (event) => {
    if (preventKeys.has(event.key) && document.activeElement === screen.canvas) {
        event.preventDefault()
    }
    pressedKeys.delete(event.key.toUpperCase())
})

window.addEventListener("resize", () => {
    setup(screen.canvas.width, screen.canvas.height, engineState.canvas.marginMultiplier)
})

export let mouse = {
    x: 0,
    y: 0,
    down: false,
    show: true,
    preventRightClick: true,
}
let mouseVisible = true
Object.defineProperty(mouse, "show", {
    get() {
        return mouseVisible
    },
    set(value: boolean) {
        mouseVisible = value
        if (mouse.show) {
            screen.canvas.style.cursor = "default"
        } else {
            screen.canvas.style.cursor = "none"
        }
    },
})

export let pointers: Record<string, Pointer> = {}

/** Returns true when any pointer is over the hitbox. */
export function isHovering(hitbox: HitboxLike): boolean {
    hitbox.updateDimensions()
    const pointers_ = Object.values(pointers)
    switch (hitbox.type) {
        case "hitbox-rect":
        case "hitbox-rect-fixed":
            return pointers_.some(
                (pointer) =>
                    hitbox.left <= pointer.x &&
                    hitbox.right >= pointer.x &&
                    hitbox.top <= pointer.y &&
                    hitbox.bottom >= pointer.y,
            )
        case "hitbox-circle":
        case "hitbox-circle-fixed":
            return pointers_.some(
                (pointer) => distance(pointer.x, pointer.y, hitbox.x, hitbox.y) <= hitbox.radius,
            )
        default:
            return false
    }
}

/** Returns true once per press while clicking the hitbox; consumes the click. */
export function isClicking(hitbox: HitboxLike, disablePointerSet = false): boolean {
    hitbox.updateDimensions()
    const pointersDown = Object.values(pointers).filter(
        (pointer) => pointer.down && pointer.attached === undefined,
    )
    switch (hitbox.type) {
        case "hitbox-rect":
        case "hitbox-rect-fixed": {
            for (const pointer of pointersDown) {
                if (
                    hitbox.left <= pointer.x &&
                    hitbox.right >= pointer.x &&
                    hitbox.top <= pointer.y &&
                    hitbox.bottom >= pointer.y
                ) {
                    if (!disablePointerSet) {
                        pointer.down = false
                    }
                    return true
                }
            }
            break
        }
        case "hitbox-circle":
        case "hitbox-circle-fixed": {
            for (const pointer of pointersDown) {
                if (
                    pointer.down &&
                    distance(pointer.x, pointer.y, hitbox.x, hitbox.y) <= hitbox.radius
                ) {
                    if (!disablePointerSet) {
                        pointer.down = false
                    }
                    return true
                }
            }
            break
        }
        default:
            return false
    }
    return false
}

/** Returns the pointer currently over the hitbox, if any. */
export function isPointer(hitbox: HitboxLike): Pointer | undefined {
    hitbox.updateDimensions()
    const pointers_ = Object.values(pointers)
    switch (hitbox.type) {
        case "hitbox-rect":
        case "hitbox-rect-fixed": {
            for (const pointer of pointers_) {
                if (
                    hitbox.left <= pointer.x &&
                    hitbox.right >= pointer.x &&
                    hitbox.top <= pointer.y &&
                    hitbox.bottom >= pointer.y
                ) {
                    return pointer
                }
            }
            break
        }
        case "hitbox-circle":
        case "hitbox-circle-fixed": {
            for (const pointer of pointers_) {
                if (distance(pointer.x, pointer.y, hitbox.x, hitbox.y) <= hitbox.radius) {
                    return pointer
                }
            }
            break
        }
        default:
            return undefined
    }
    return undefined
}

/** Debug helper: draws all active pointers as red squares. */
export function drawPointers(): void {
    screen.context.save()
    for (const pointer of Object.values(pointers)) {
        screen.context.fillStyle = "red"
        screen.context.fillRect(pointer.x - 4, pointer.y - 4, 8, 8)
    }
    screen.context.restore()
}

const mousePointer: Pointer = {
    key: "mouse",
    type: "mouse",
    down: false,
    x: -1,
    y: -1,
}
pointers["mouse"] = mousePointer

function handleMouse(e: MouseEvent) {
    if (e.type === "mouseup") {
        mouse.down = false
        mousePointer.down = false
        return
    }
    if (!engineState.disableMouseEvents) {
        const rect = screen.canvas.getBoundingClientRect()
        const scaleFactorX = screen.canvas.width / rect.width
        const scaleFactorY = screen.canvas.height / rect.height
        const scaledX = (e.clientX - rect.left) * scaleFactorX
        const scaledY = (e.clientY - rect.top) * scaleFactorY
        e.preventDefault()
        switch (e.type) {
            case "mousedown":
                if (e.button === 0) {
                    mouse.down = true
                    mouse.x = scaledX
                    mouse.y = scaledY
                    mousePointer.down = true
                    mousePointer.x = scaledX
                    mousePointer.y = scaledY
                }
                break
            case "mousemove":
                mouse.x = scaledX
                mouse.y = scaledY
                mousePointer.x = scaledX
                mousePointer.y = scaledY
                break
        }
    }
}
window.addEventListener("mousedown", handleMouse)
window.addEventListener("mousemove", handleMouse)
window.addEventListener("mouseup", handleMouse)
screen.canvas.addEventListener("mouseover", () => {
    engineState.disableMouseEvents = false
})

screen.canvas.addEventListener("mouseout", () => {
    engineState.disableMouseEvents = true
})

window.addEventListener("blur", () => {
    mouse.down = false
    mousePointer.down = false
    pressedKeys.clear()
    for (const key of Object.keys(pointers)) {
        if (key !== "mouse") {
            delete pointers[key]
        }
    }
})

window.addEventListener("contextmenu", (event) => {
    if (
        mouse.preventRightClick &&
        event.target instanceof Node &&
        screen.canvas.contains(event.target)
    ) {
        event.preventDefault()
    }
})

function handleTouch(e: TouchEvent) {
    if (!(e.target instanceof Node && screen.canvas.contains(e.target))) {
        return
    }
    const rect = screen.canvas.getBoundingClientRect()
    const scaleFactorX = screen.canvas.width / rect.width
    const scaleFactorY = screen.canvas.height / rect.height

    e.preventDefault()
    switch (e.type) {
        case "touchstart": {
            for (const touch of Array.from(e.changedTouches)) {
                const key = String(touch.identifier)
                const scaledX = (touch.clientX - rect.left) * scaleFactorX
                const scaledY = (touch.clientY - rect.top) * scaleFactorY
                pointers[key] = {
                    key,
                    type: "touch",
                    down: true,
                    x: scaledX,
                    y: scaledY,
                }
            }
            break
        }
        case "touchmove": {
            for (const touch of Array.from(e.changedTouches)) {
                const key = String(touch.identifier)
                const scaledX = (touch.clientX - rect.left) * scaleFactorX
                const scaledY = (touch.clientY - rect.top) * scaleFactorY
                const existing = pointers[key]
                pointers[key] = {
                    key,
                    type: existing?.type ?? "touch",
                    attached: existing?.attached,
                    down: true,
                    x: scaledX,
                    y: scaledY,
                }
            }
            break
        }
        case "touchend":
        case "touchcancel": {
            for (const touch of Array.from(e.changedTouches)) {
                const key = String(touch.identifier)
                delete pointers[key]
            }
            break
        }
    }
}
window.addEventListener("touchstart", handleTouch)
window.addEventListener("touchmove", handleTouch)
window.addEventListener("touchend", handleTouch)
window.addEventListener("touchcancel", handleTouch)

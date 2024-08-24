import { global, screen, ctx, canvas } from "./main.js";
import { setup, distance } from "./functions.js";

//!#########################################

//! key listeners

//!#########################################

export let preventKeys = [
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
    //"F12"
]

export const pressedKeys = new Set();

export function keyPressed(key) {
    if (typeof key !== 'string') {
        return undefined;
    }
    if (key == "space") {
        key = " ";
    }
    return pressedKeys.has(key.toUpperCase());
}
window.addEventListener('keydown', event => {
    if (preventKeys.includes(event.key)) {
        event.preventDefault();
    }
    pressedKeys.add(event.key.toUpperCase());
});

window.addEventListener('keyup', event => {
    if (preventKeys.includes(event.key)) {
        event.preventDefault();
    }
    pressedKeys.delete(event.key.toUpperCase());
});

//!#########################################

//! resize listener

//!#########################################

window.addEventListener("resize", () => {
    setup(screen.canvas.width, screen.canvas.height, global.canvas.marginMultiplier);
})

//!#########################################

//! pointer listeners

//!#########################################

export let mouse = {
    x: 0,
    y: 0,
    click: false,
    show: true,
    preventRightClick: true
}

let mouseshow = true
Object.defineProperty(mouse, 'show', {
    get() { return mouseshow },
    set(value) {
        mouseshow = value
        if (mouse.show) {
            screen.canvas.style.cursor = "default"
        }
        else {
            screen.canvas.style.cursor = "none"
        }
    }
});


export function isClicking(hitbox) {
    hitbox.updateDimensions()
    const pointersDown = Object.values(pointers).filter(pointer => pointer.down);
    switch (hitbox.type) {
        case "hitbox-rect":
        case "hitbox-rect-fixed":
            return pointersDown.some(pointer => hitbox.left <= pointer.x && hitbox.right >= pointer.x && hitbox.top <= pointer.y && hitbox.bottom >= pointer.y);
        case "hitbox-circle":
        case "hitbox-circle-fixed":
            return pointersDown.some(pointer => pointer.down && distance(pointer.x, pointer.y, hitbox.x, hitbox.y) <= hitbox.radius)
        default:
            return false
    }
}
export function drawPointers() {
    for (const [key, pointer] of Object.entries(pointers)) {
        screen.context.fillRect(pointer.x - 8, pointer.y - 8, 16, 16)
    };
}

export let pointers = {}

function handlePointerEvent(event) {
    const pointerId = event.pointerId;
    let rect = screen.canvas.getBoundingClientRect();
    const scaleFactorX = screen.canvas.width / rect.width;
    const scaleFactorY = screen.canvas.height / rect.height;
    const scaledX = (event.clientX - rect.left) * scaleFactorX;
    const scaledY = (event.clientY - rect.top) * scaleFactorY;
    event.preventDefault();
    switch (event.type) {
        case 'pointerdown':
            pointers[pointerId] = {
                type: event.pointerType,
                down: true,
                x: scaledX,
                y: scaledY
            }
            if (event.pointerType == "mouse") {
                mouse.click = true
                mouse.x = scaledX
                mouse.y = scaledY
            }
            break;
        case 'pointermove':
            pointers[pointerId] = {
                ...pointers[pointerId],
                type: event.pointerType,
                x: scaledX,
                y: scaledY
            }
            if (event.pointerType == "mouse") {
                mouse.click = true
                mouse.x = scaledX
                mouse.y = scaledY
            }
            break;
        case 'pointerup':
        case 'pontercancel':
            if (event.pointerType === "mouse") {
                mouse.click = false;
                pointers[pointerId].down = false;
            } else {
                delete pointers[pointerId];
            }
            break;
    }

}

window.addEventListener("pointerdown", handlePointerEvent);
window.addEventListener("pointermove", handlePointerEvent);
window.addEventListener("pointerup", handlePointerEvent);
window.addEventListener("pontercancel", handlePointerEvent);

window.addEventListener('contextmenu', (event) => {
    if (mouse.preventRightClick) {
        event.preventDefault();
    }
});
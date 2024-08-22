import { global, screen, ctx, canvas } from "./main.js";
import { setup } from "./functions.js";

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
    "F12"
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
                x: scaledX,
                y: scaledY
            }
            break;
        case 'pointermove':
            pointers[pointerId] = {
                x: scaledX,
                y: scaledY
            }
            break;
        case 'pointerup' || 'pointercancel':
            delete pointers[pointerId];
            break;
    }

}

window.addEventListener("pointerdown", handlePointerEvent);
window.addEventListener("pointermove", handlePointerEvent);
window.addEventListener("pointerup", handlePointerEvent);
window.addEventListener("pontercancel", handlePointerEvent);
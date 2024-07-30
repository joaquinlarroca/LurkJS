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
    //if (!preventKeys.includes(event.key)) {
    //    event.preventDefault();
    //}
    pressedKeys.add(event.key.toUpperCase());
});

window.addEventListener('keyup', event => {
    //if (!preventKeys.includes(event.key)) {
    //    event.preventDefault();
    //}
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

function handlePointerEvent(event) {
    switch (event.pointerType) {
        case "mouse":
            const pointerId = event.pointerId;
            switch (event.type) {
                case 'pointerdown':
                    // Handle pointer down event
                    console.log(`mouse ${pointerId} down`);
                    break;
                case 'pointermove':
                    // Handle pointer move event
                    console.log(`mouse ${pointerId} moved`);
                    break;
                case 'pointerup':
                    // Handle pointer up event
                    console.log(`mouse ${pointerId} up`);
                    break;
                case 'pointercancel':
                    // Handle pointer cancel event
                    console.log(`mouse ${pointerId} cancelled`);
                    break;
            }

            break;

        case "pen":
            process_pointer_pen(event);
            break;

        case "touch":
            for (let i = 0; i < event.changedTouches.length; i++) {
                const touch = event.changedTouches[i];
                const pointerId = touch.identifier;
                switch (event.type) {
                    case 'pointerdown':
                        // Handle pointer down event
                        console.log(`touch ${pointerId} down`);
                        break;
                    case 'pointermove':
                        // Handle pointer move event
                        console.log(`touch ${pointerId} moved`);
                        break;
                    case 'pointerup':
                        // Handle pointer up event
                        console.log(`touch ${pointerId} up`);
                        break;
                    case 'pointercancel':
                        // Handle pointer cancel event
                        console.log(`touch ${pointerId} cancelled`);
                        break;
                }
            }
            break;
        default:
            console.log(`pointerType ${event.pointerType} is not supported`);
    }

}

// Add event listeners
window.addEventListener("pointerdown", handlePointerEvent);
window.addEventListener("pointermove", handlePointerEvent);
window.addEventListener("pointerup", handlePointerEvent);
window.addEventListener("pontercancel", handlePointerEvent);
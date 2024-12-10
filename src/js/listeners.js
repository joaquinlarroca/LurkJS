import { global, screen, ctx, canvas } from "./main.js";
import { setup, distance } from "./functions.js";

//!#########################################

//! key listeners

//!#########################################

export let preventKeys = [
    "Control",
    "Alt",
    "Meta",
    "Enter",
    "Tab",
    "F1",
    "F2",
    "F3",
    "F4",
    //"F5",
    "F6",
    "F7",
    "F8",
    "F9",
    "F10",
    //"F11",
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

export let pointers = {}

export function isHovering(hitbox) {
    hitbox.updateDimensions()
    const pointers_ = Object.values(pointers);
    switch (hitbox.type) {
        case "hitbox-rect":
        case "hitbox-rect-fixed":
            return pointers_.some(pointer => hitbox.left <= pointer.x && hitbox.right >= pointer.x && hitbox.top <= pointer.y && hitbox.bottom >= pointer.y);
        case "hitbox-circle":
        case "hitbox-circle-fixed":
            return pointers_.some(pointer => pointer.down && distance(pointer.x, pointer.y, hitbox.x, hitbox.y) <= hitbox.radius)
        default:
            return false
    }
}
export function isClicking(hitbox, disablePointerSet = false) {
    hitbox.updateDimensions()
    const pointersDown = Object.values(pointers).filter(pointer => pointer.down && pointer.attached == undefined);
    switch (hitbox.type) {
        case "hitbox-rect":
        case "hitbox-rect-fixed":
            for (let pointer of pointersDown) {
                if (hitbox.left <= pointer.x && hitbox.right >= pointer.x && hitbox.top <= pointer.y && hitbox.bottom >= pointer.y) {
                    if (!disablePointerSet) {
                        pointer.down = false;
                    }
                    return true;
                }
            }
        case "hitbox-circle":
        case "hitbox-circle-fixed":
            for (let pointer of pointersDown) {
                if (pointer.down && distance(pointer.x, pointer.y, hitbox.x, hitbox.y) <= hitbox.radius) {
                    if (!disablePointerSet) {
                        pointer.down = false;
                    }
                    return true;
                }
            }
        default:
            return false
    }
}
export function isPointer(hitbox) {
    hitbox.updateDimensions()
    const pointers_ = Object.values(pointers);
    switch (hitbox.type) {
        case "hitbox-rect":
        case "hitbox-rect-fixed":
            for (let pointer of pointers_) {
                if (hitbox.left <= pointer.x && hitbox.right >= pointer.x && hitbox.top <= pointer.y && hitbox.bottom >= pointer.y) {
                    return pointer;
                }
            }
        case "hitbox-circle":
        case "hitbox-circle-fixed":
            for (let pointer of pointers_) {
                if (distance(pointer.x, pointer.y, hitbox.x, hitbox.y) <= hitbox.radius) {
                    return pointer;
                }
            }
        default:
            return false
    }
}
export function drawPointers() {
    screen.context.save();
    for (const [key, pointer] of Object.entries(pointers)) {
        screen.context.fillStyle = "red"
        screen.context.fillRect(pointer.x - 4, pointer.y - 4, 8, 8)
    };
    screen.context.restore();
}


pointers["mouse"] = {
    key: "mouse",
    type: "mouse",
    down: false,
    attached: undefined,
    x: 0,
    y: 0
}

function handleMouse(e) {
    if(!global._disable_mouse_events){
        let rect = screen.canvas.getBoundingClientRect();
        const scaleFactorX = screen.canvas.width / rect.width;
        const scaleFactorY = screen.canvas.height / rect.height;
        const scaledX = (e.clientX - rect.left) * scaleFactorX;
        const scaledY = (e.clientY - rect.top) * scaleFactorY;
        e.preventDefault()
        switch (e.type) {
            case 'mousedown':
                mouse.click = true
                mouse.x = scaledX;
                mouse.y = scaledY;
                pointers["mouse"] = {
                    ...pointers["mouse"],
                    down: true,
                    x: scaledX,
                    y: scaledY
                };
                break;
            case 'mousemove':
                mouse.x = scaledX;
                mouse.y = scaledY;
                pointers["mouse"] = {
                    ...pointers["mouse"],
                    x: scaledX,
                    y: scaledY
                };
                break;
            case 'mouseup':
                mouse.click = false;
                pointers["mouse"].down = false;
                break;
        };
    };
};
window.addEventListener("mousedown", handleMouse);
window.addEventListener("mousemove", handleMouse);
window.addEventListener("mouseup", handleMouse);
screen.canvas.addEventListener("mouseover", () => {
    global._disable_mouse_events = false;
});

screen.canvas.addEventListener("mouseout", () => {
    global._disable_mouse_events = true;
});

window.addEventListener('contextmenu', (event) => {
    if (mouse.preventRightClick) {
        event.preventDefault();
    }
});


function handleTouch(e) {
    let rect = screen.canvas.getBoundingClientRect();
    const scaleFactorX = screen.canvas.width / rect.width;
    const scaleFactorY = screen.canvas.height / rect.height;

    e.preventDefault();
    switch (e.type) {
        case "touchstart":
            for (var i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                const scaledX = (touch.clientX - rect.left) * scaleFactorX;
                const scaledY = (touch.clientY - rect.top) * scaleFactorY;
                pointers[touch.identifier] = {
                    key: touch.identifier,
                    type: "touch",
                    down: true,
                    attached: undefined,
                    x: scaledX,
                    y: scaledY
                };
            };
            break;
        case "touchmove":
            for (var i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                const scaledX = (touch.clientX - rect.left) * scaleFactorX;
                const scaledY = (touch.clientY - rect.top) * scaleFactorY;
                pointers[touch.identifier] = {
                    ...pointers[touch.identifier],
                    down: false,
                    x: scaledX,
                    y: scaledY
                };
            };
            break;
        case "touchend":
        case "touchcancel":
            for (let i = 0; i < e.changedTouches.length; i++) {
                let touch = e.changedTouches[i];
                delete pointers[touch.identifier];
            };
            break;
    };
};
window.addEventListener("touchstart", handleTouch);
window.addEventListener("touchmove", handleTouch);
window.addEventListener("touchend", handleTouch);
window.addEventListener("tuchcancel", handleTouch);

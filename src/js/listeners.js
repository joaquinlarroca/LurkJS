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
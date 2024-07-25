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
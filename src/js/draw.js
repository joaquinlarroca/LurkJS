import { global, canvas, context } from "./main.js";
export function clear() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}
export function sortAndDrawQueuedObjects() {
    // Sort by z and then by draw order
    global._sprites_to_draw.sort((a, b) => a.z - b.z || a.drawOrder - b.drawOrder);
    for (let sprite of sprites) {
        sprite.draw(context);
    }
}

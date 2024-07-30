import { global, screen, ctx, canvas, setup, Object, loadImage } from "./src/js/index.js";
import { time } from "./src/js/main.js";
import { keyPressed } from "./src/js/listeners.js";
import { image } from "./src/js/main.js";

await loadImage("src/bunny.png")
let a = new Object(image["src/bunny.png"], [0, 0], [128, 128])
await setup(1000, 1000, 0.95, false);
window.addEventListener("started", () => {
    // start
})
window.addEventListener("update", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white"
    ctx.font = "60px serif"
    ctx.fillText(global.fps + " : " + (time.frameCount / global.fps).toFixed(1), 50, 500, 950)
    a.draw()


    if (keyPressed("a")) {
        a.x -= 5
    }
    if (keyPressed("d")) {
        a.x += 5
    }
    if (keyPressed("s")) {
        a.y += 5
    }
    if (keyPressed("w")) {
        a.y -= 5
    }
})

import { global, screen, ctx, canvas, setup, Object, loadImage } from "./src/js/index.js";
import { time } from "./src/js/main.js";
import { keyPressed } from "./src/js/listeners.js";
import { image } from "./src/js/main.js";
import { camera } from "./src/js/classes.js";

await loadImage("src/bunny.png")
await loadImage("bg.png")
let a = new Object(image["src/bunny.png"], [0, 0], [250, 250])
let park = new Object(image["bg.png"], [0, 0], [1000, 1000])
let cam = new camera(0, 0, 250, 250)
cam.viewport.width = 100
cam.viewport.height = 100
await setup(1000, 1000, 0.95, false);
window.addEventListener("started", () => {
    // start
})
window.addEventListener("update", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white"
    ctx.font = "90px serif"
    park.draw()
    ctx.fillText(global.fps, 500, 500)
    //a.draw()
    cam.drawcropArea()
    for (let index = 0; index < 1; index++) {
        cam.crop()
        cam.draw()
    }


    if (keyPressed("a")) {
        a.x -= 7
    }
    if (keyPressed("d")) {
        a.x += 7
    }
    if (keyPressed("s")) {
        a.y += 7
    }
    if (keyPressed("w")) {
        a.y -= 7
    }


    if (keyPressed("arrowleft") ) {
        cam.viewport.x -= 3
    }
    if (keyPressed("arrowright") ) {
        cam.viewport.x += 3
    }
    if (keyPressed("arrowdown") ) {
        cam.viewport.y += 3
    }
    if (keyPressed("arrowup") ) {
        cam.viewport.y -= 3
    }
})

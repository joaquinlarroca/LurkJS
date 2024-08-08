import { global, screen, ctx, canvas, time, image } from "./src/js/main.js";
import { keyPressed, mouse } from "./src/js/listeners.js";
import { camera, object } from "./src/js/classes.js";
import { loadImage } from "./src/js/loader.js";
import { setup, clear } from "./src/js/functions.js";

await loadImage("src/bunny.png")
await loadImage("bg.png")
await setup(1920, 1080, 0.99, false);

let a = new object(image["src/bunny.png"], [0, 0], [250, 250])
let park = new object(image["bg.png"], [0, 0], [1920, 864])
let cam = new camera(0, 0, 800, 500)
window.addEventListener("started", () => {
    a.offset = [0.5, 0.5]
})
window.addEventListener("update", () => {
    clear()
    ctx.fillStyle = "white"
    ctx.font = "90px serif"
    park.draw()
    ctx.fillText(global.fps, 500, 500)
    ctx.fillText(a.offset, 500, 590)
    a.draw()
    if (keyPressed("r")) {
        a.angle += time.deltaTime * 60
    }
    if (keyPressed("t")) {
        a.angle = 0
    }
    if (keyPressed("y")) {
        for (let index = 0; index < 1; index++) {
            cam.crop()
            cam.draw()
        }
        cam.drawcropArea()
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
    if (keyPressed("q") && a.offset[0] > 0) {
        a.offset[0] -= 0.01
    }
    if (keyPressed("e") && a.offset[0] < 1) {
        a.offset[0] += 0.01
    }



})

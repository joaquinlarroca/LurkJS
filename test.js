import { global, screen, ctx, canvas, setup, Object, loadImage } from "./src/js/index.js";
import { time } from "./src/js/main.js";
import { keyPressed, mouse } from "./src/js/listeners.js";
import { image } from "./src/js/main.js";
import { camera } from "./src/js/classes.js";

await loadImage("src/bunny.png")
await loadImage("bg.png")
await setup(1000, 1000, 0.95, false);

let a = new Object(image["src/bunny.png"], [0, 0], [250, 250])
let park = new Object(image["bg.png"], [0, 0], [1000, 1000])
let cam = new camera(0, 0, 250, 250)

window.addEventListener("started", () => {
    a.offset = [0.5, 0.5]
})
window.addEventListener("update", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white"
    ctx.font = "90px serif"
    park.draw()
    ctx.fillText(global.fps, 500, 500)
    ctx.fillText(a.offset, 500, 590)
    a.draw()
    if (keyPressed("r")) {
        a.angle += time.deltaTime * 20
    }
    if (keyPressed("t")) {
        a.angle = 0
    }

    //cam.drawcropArea()
    //for (let index = 0; index < 1; index++) {
    //    cam.crop()
    //    cam.draw()
    //}


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

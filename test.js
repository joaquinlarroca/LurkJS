import { global, screen, ctx, canvas, time, image } from "./src/js/main.js";
import { keyPressed } from "./src/js/listeners.js";
import { camera, hitbox, object } from "./src/js/classes.js";
import { loadImage } from "./src/js/loader.js";
import { setup, clear, drawtext } from "./src/js/functions.js";

await loadImage("./src/bunny.png", "bunny")
await loadImage("./bg.png", "park")
await loadImage("./src/images/green.png", "green")

await setup(1920, 1080, 0.99, true);

let a = new object(image["bunny"], [0, 0], [500, 500])
a.hitboxes.push(new hitbox(a, 1))

let b = new object(image["green"], [200, 200], [250, 250])
b.borderRadius = 250

let park = new object(image["park"], [0, 0], [1920, 1080])

let cam = new camera(1344, 0, 576, 324)

window.addEventListener("started", () => {
    
})
window.addEventListener("update", () => {
    clear()

    park.draw()
    a.draw()
    b.draw()
    b.hitboxes.draw()
    a.hitboxes.draw()

    ctx.fillStyle = "white"
    drawtext(`FPS ${global.fps}`, [0, 0], 32, "sans-serif", "top", "start", 0, 1.0)


    if (a.hitboxes[0].collide(b.hitboxes[0])) {
        cam.crop()
        cam.draw()
        cam.drawcropArea()
    }
    if (keyPressed("r")) {
        a.angle += time.deltaTime * 60
    }
    if (keyPressed("t")) {
        a.angle = 0
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

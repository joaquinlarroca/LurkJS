import { global, screen, ctx, canvas, time, image } from "./src/js/main.js";
import { drawPointers, isClicking, keyPressed, mouse, pointers } from "./src/js/listeners.js";
import { camera, hitbox, hitboxCircleFixed, hitboxFixed, object } from "./src/js/classes.js";
import { loadImage } from "./src/js/loader.js";
import { setup, clear, drawtext } from "./src/js/functions.js";

await loadImage("./src/bunny.png", "bunny")
await loadImage("./bg.png", "park")
await loadImage("./src/images/green.png", "green")

await setup(1920, 1080, 0.99, true);

let a = new object(image["bunny"], [0, 0], [100, 100])

let circle = new object(image["green"], [200, 200], [250, 250])
circle.borderRadius = 250
circle.hitboxes.push(new hitboxCircleFixed([900, 250], 100), new hitbox({ x: 900, y: 600, width: 200, height: 200 }, 1), new hitboxFixed([900, 0], [100, 100]))


let park = new object(image["park"], [0, 0], [1920, 1080])

let cam = new camera(1344, 0, 576, 324)

window.addEventListener("started", () => {
    mouse.show = true
    console.log(mouse.show);
    
})
window.addEventListener("update", () => {
    clear()

    park.draw()
    a.draw()
    circle.draw()
    circle.hitboxes.draw()
    a.hitboxes.draw()

    ctx.fillStyle = "white"
    drawtext(`FPS ${Object.keys(pointers).length}`, [64, 0], 128, "sans-serif", "top", "start", 0, 1.0)
    if (a.collidesWith(circle)) {
        cam.crop()
        cam.draw()
        cam.drawcropArea()
    }
    if (keyPressed("space")) {
        console.log(cam.snapshot)
    }
    if (isClicking(circle.hitboxes[3])) {
        cam.crop()
        cam.draw()
        cam.drawcropArea()
    }
    drawPointers()
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



})

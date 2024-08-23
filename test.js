import { global, screen, ctx, canvas, time, image } from "./src/js/main.js";
import { isClicking, keyPressed, mouse } from "./src/js/listeners.js";
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
    mouse.show = false
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
    drawtext(`FPS ${global.fps}`, [0, 0], 32, "sans-serif", "top", "start", 0, 1.0)


    //if (a.hitboxes[0].collide(circle.hitboxes[0])) {
    //    cam.crop()
    //    cam.draw()
    //    cam.drawcropArea()
    //}
    if (a.collidesWith(circle)) {
        cam.crop()
        cam.draw()
        cam.drawcropArea()
    }
    if (keyPressed("space")) {
        console.log(cam.snapshot)
    }
    if (isClicking(a.hitboxes[0])) {
        cam.crop()
        cam.draw()
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



})

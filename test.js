import { global, screen, ctx, canvas, time, image } from "./src/js/main.js";
import { drawPointers, isClicking, isHovering, keyPressed, mouse, pointers } from "./src/js/listeners.js";
import { button, camera, hitbox, hitboxCircleFixed, hitboxFixed, object, slider, sliderv } from "./src/js/classes.js";
import { loadFont, loadImage } from "./src/js/loader.js";
import { setup, clear, drawtext, shakeScreen, lerp } from "./src/js/functions.js";

await loadImage("./src/bunny.png", "bunny")
await loadImage("./bg.png", "park")
await loadFont("./bubbly.ttf", "bubbly")

await setup(1920, 1080, 0.99, 70, false);

let a = new object("", [0, 0], [100, 100])
a.vel = { x: 0, y: 0 }
a.dir = 1
let btn = new button("color: red", [200, 200], [200, 100], ["test", "white", 64, "bubbly"], 500)
let slde = new slider(image["bunny"], image["bunny"], "none", [200, 400], [300, 50], 50, [-1, 1], 0)
slde.thumb.borderRadius = 32
slde.borderRadius = 32
slde.fill.inverted = false
let sldd = new sliderv(image["bunny"], image["bunny"], "none", [700, 400], [25, 500], 75, [-1, 1], 0)
sldd.thumb.borderRadius = 500
sldd.borderRadius = 500
sldd.fill.inverted = false

let park = new object(image["park"], [0, 0], [1920, 1080])

let cam = new camera(1344, 0, 576, 324)

let savedY = slde.y
window.addEventListener("started", () => {
    //screen.doc.requestFullscreen();
})
window.addEventListener("update", () => {
    clear()

    park.draw()
    a.draw()
    //a.hitboxes.draw()

    ctx.fillStyle = "white"
    drawtext(`FPS ${(1 / time.fixedDeltaTime).toFixed(0)}`, [64, 0], 64, "bubbly", "top", "start", 0, 1.0)
    drawtext(`${sldd.percentage}`, [64, 128], 64, "bubbly", "top", "start", 0, 1.0)
    btn.update()
    btn.draw()

    slde.update()
    slde.draw()
    //slde.hitboxes.draw()
    slde.y = savedY - savedY * sldd.percentage
    if (slde.hover) {
        cam.crop()
        cam.draw()
    }

    sldd.update()
    sldd.draw()
    //sldd.hitboxes.draw()

    if (btn.hovered) {
        btn.setTexture("color: blue")
    }
    else {
        btn.setTexture("color: red")
    }
    if (btn.clicked) {
        btn.text.text = "clicked"
        btn.text.size = 52
        shakeScreen(5, 50)
    }
    else {
        btn.text.text = "test"
        btn.text.size = 64
    }

    drawPointers()
    if (keyPressed("arrowup")) {
        slde.percentage += 1
    }
    if (keyPressed("arrowdown")) {
        slde.percentage -= 1
    }
})
window.addEventListener("fixedUpdate", () => {
    a.vel.y += 1000 * time.fixedDeltaTime

    if (keyPressed("a")) {
        a.vel.x -= 1500 * time.fixedDeltaTime
        a.dir = -1
    }
    if (keyPressed("d")) {
        a.vel.x += 1500 * time.fixedDeltaTime
        a.dir = 1
    }
    if (keyPressed("w")) {
        a.vel.y -= 2750 * time.fixedDeltaTime
    }
    a.angle = Math.atan2(a.vel.y / 500, a.dir) * (180 / Math.PI)
    a.vel.y = Math.max(Math.min(a.vel.y, 1000), -1000)

    a.vel.x = Math.max(Math.min(a.vel.x, 1000), -1000)
    a.vel.x *= Math.pow(0.2, time.fixedDeltaTime)
    a.x += a.vel.x * time.fixedDeltaTime
    a.y += a.vel.y * time.fixedDeltaTime
    if (a.y > canvas.height - a.height) {
        a.y = canvas.height - a.height
        a.vel.y = 0
    }
})

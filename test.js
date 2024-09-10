import { global, screen, ctx, canvas, time, image } from "./src/js/main.js";
import { drawPointers, isClicking, isHovering, keyPressed, mouse, pointers } from "./src/js/listeners.js";
import { button, camera, hitbox, hitboxCircleFixed, hitboxFixed, object, slider, sliderv } from "./src/js/classes.js";
import { loadFont, loadImage } from "./src/js/loader.js";
import { setup, clear, drawtext, shakeScreen, lerp } from "./src/js/functions.js";
import { gui } from "./src/plugins/gui/gui.js";

await loadImage("./src/images/bunny.png", "bunny")
await loadImage("./bg.png", "park")
await loadFont("./bubbly.ttf", "bubbly")

await setup(1920, 1080, 0.99, 60);

let a = new object(image["bunny"], [0, 0], [100, 100])
a.vel = { x: 0, y: 0 }
a.dir = 1
let btn = new button("color: red", [200, 200], [200, 100], ["test", "white", 64, "bubbly"], 500)
btn.borderRadius = 8
let slde = new slider("color:#eee", "color:#333", "color:#00dd00", [200, 400], [300, 50], 50, [-1, 1], 0)
slde.thumb.borderRadius = 16
slde.borderRadius = 16
slde.fill.inverted = false
let sldd = new sliderv("color:#222", "color:#555", "color:#222", [700, 400], [25, 500], 75, [0, 1], 0)
sldd.thumb.borderRadius = 500
sldd.borderRadius = 500
sldd.fill.inverted = false

let park = new object(image["park"], [0, 0], [1920, 1080])

let cam = new camera(1344, 0, 576, 324)
window.addEventListener("started", () => {
    //screen.doc.requestFullscreen();
})
window.addEventListener("update", () => {
    clear()

    park.draw()
    a.draw()
    //a.hitboxes.draw()

    ctx.fillStyle = "white"
    drawtext(`${global._disable_mouse_events}`, [64, 128], 64, "bubbly", "top", "start", 0, 1.0)
    btn.update()
    btn.draw()

    slde.update()
    slde.draw()
    if (slde.hover) {
        cam.crop()
        cam.draw()
    }

    sldd.update()
    sldd.draw()

    if (btn.hovered) {
        btn.setTexture("color: #36b213")
    }
    else {
        btn.setTexture("color: #2d9111")
    }
    if (btn.clicked) {
        btn.text.text = "clicked"
        btn.text.size = 52
        shakeScreen(5, 50)
    }
    else {
        btn.text.text = "CLICK"
        btn.text.size = 64
    }
    if (keyPressed(" ")) {
        a.hitboxes.draw()
        btn.hitboxes.draw()
        slde.hitboxes.draw()
        sldd.hitboxes.draw()
    }
})
window.addEventListener("fixedUpdate", () => {
    a.vel.y += 1500 * time.fixedDeltaTime

    if (keyPressed("a")) {
        a.vel.x -= 2000 * time.fixedDeltaTime
        a.dir = -1
        a.scale = [1, -1]
    }
    if (keyPressed("d")) {
        a.vel.x += 2000 * time.fixedDeltaTime
        a.dir = 1
        a.scale = [1, 1]
    }
    if (keyPressed("w")) {
        a.vel.y -= 4000 * time.fixedDeltaTime
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

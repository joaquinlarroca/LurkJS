import { global, screen, ctx, canvas, time, image, color } from "./src/js/main.js";
import { drawPointers, isClicking, isHovering, keyPressed, mouse, pointers } from "./src/js/listeners.js";
import { button, camera, hitbox, hitboxCircleFixed, hitboxFixed, object, slider, sliderv } from "./src/js/classes.js";
import { loadColors, loadFont, loadImage } from "./src/js/loader.js";
import { setup, clear, drawtext, shakeScreen } from "./src/js/functions.js";

await loadImage("./src/bunny.png", "bunny")
await loadImage("./bg.png", "park")
await loadFont("./bubbly.ttf", "bubbly")
await loadColors()

await setup(1920, 1080, 0.99, true);

let a = new object(image["bunny"], [0, 0], [100, 100])
let btn = new button(color["red"], [200, 200], [200, 100], ["test", "white", 64, "bubbly"], 500)
let slde = new slider(color["green"], color["blue"], [200, 400], [300, 100], 50, [0, 1], "white", 0)
let sldd = new sliderv(color["white"], color["black"], [700, 400], [30, 500], 100, [0, 1], "white", 0)
sldd.thumb.borderRadius = 32
sldd.borderRadius = 32
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
    a.hitboxes.draw()

    ctx.fillStyle = "white"
    drawtext(`FPS ${global.fps}`, [64, 0], 64, "bubbly", "top", "start", 0, 1.0)
    drawtext(`${sldd.percentage}`, [64, 128], 64, "bubbly", "top", "start", 0, 1.0)
    btn.update()
    btn.draw()

    slde.update()
    slde.draw()
    slde.hitboxes.draw()
    slde.y = savedY - savedY * sldd.percentage

    sldd.update()
    sldd.draw()
    //sldd.hitboxes.draw()

    if (btn.hovered) {
        btn.texture = color["blue"]
    }
    else {
        btn.texture = color["red"]
    }
    if (btn.clicked) {
        btn.text.text = "clicked"
        btn.text.size = 52
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

import { global, screen, ctx, canvas, time, image, color } from "./src/js/main.js";
import { drawPointers, isClicking, isHovering, keyPressed, mouse, pointers } from "./src/js/listeners.js";
import { button, camera, hitbox, hitboxCircleFixed, hitboxFixed, object, slider } from "./src/js/classes.js";
import { loadColors, loadFont, loadImage } from "./src/js/loader.js";
import { setup, clear, drawtext, shakeScreen } from "./src/js/functions.js";

await loadImage("./src/bunny.png", "bunny")
await loadImage("./bg.png", "park")
await loadFont("./bubbly.ttf", "bubbly")
await loadColors()

await setup(1920, 1080, 0.99, true);

let a = new object(image["bunny"], [0, 0], [100, 100])
let btn = new button(color["red"],[200, 200], [200, 100], ["test", "white", 64, "bubbly"], 500)
let slde = new slider(color["green"], color["blue"], [200, 400], [200, 100], 20, [0, 100], "white", 0)
let park = new object(image["park"], [0, 0], [1920, 1080])

let cam = new camera(1344, 0, 576, 324)

window.addEventListener("started", () => {
    //screen.doc.requestFullscreen();
})
window.addEventListener("update", () => {
    clear()

    park.draw()
    a.draw()
    a.hitboxes.draw()

    ctx.fillStyle = "white"
    drawtext(`FPS ${global.fps}`, [64, 0], 128, "bubbly", "top", "start", 0, 1.0)
    drawtext(`${Object.keys(pointers).length}`, [64, 128], 128, "bubbly", "top", "start", 0, 1.0)
    drawtext(`${pointers["mouse"].attached}`, [64, 256], 128, "bubbly", "top", "start", 0, 1.0)
    btn.update()
    btn.draw()

    slde.draw()
    slde.hitboxes.draw()
    if(btn.hovered){
        btn.texture = color["blue"]
    }
    else{
        btn.texture = color["red"]
    }
    if(btn.clicked){
        btn.text.text = "clicked"
        btn.text.size = 52
    }
    else{
        btn.text.text = "test"
        btn.text.size = 64
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

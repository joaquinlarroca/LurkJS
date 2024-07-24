import { global, screen, ctx, canvas, setup,  Object, loadImage } from "./src/js/index.js";

let a = new Object([0,0],[128,128])
a.texture = await loadImage("src/bunny.png");
setup(500, 500, 1, false);
window.addEventListener("started",() => {
    a.draw()
})
window.addEventListener("keydown", (e) => {
    if (e.key == "a") {
        a.x -= 5
    }
    if (e.key == "d") {
        a.x += 5
    }
    if (e.key == "s") {
        a.y += 5
    }
    if (e.key == "w") {
        a.y -= 5
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    a.draw()
})
window.addEventListener("resize", () => {
    setup(screen.canvas.width, screen.canvas.height, global.canvas.marginMultiplier);
})
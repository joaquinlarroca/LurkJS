import { setup } from "./src/js/startandloop.js";
import { global, screen } from "./src/js/main.js";
setup(500, 500, 1, false);
window.addEventListener("resize", () => {
    setup(screen.canvas.width, screen.canvas.height, global.canvas.marginMultiplier);
})
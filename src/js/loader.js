import { global, screen } from "./main.js"
const loadingBarColor = screen.css.computedStyles.getPropertyValue('--loading-bar-done-color').trim();
let loadingBackgroundColor = screen.css.computedStyles.getPropertyValue('--loading-screen-background').trim();
loadingBackgroundColor = "#000000"
screen.loading.logo_bg = loadingBackgroundColor
let load = setInterval(() => {
    var percent = global._assets_to_load_done / global._assets_to_load_count * 100
    screen.loading.bar.style.background = `linear-gradient(90deg, ${loadingBarColor} ${percent}%, ${loadingBackgroundColor} ${percent}%)`
    if (global._assets_to_load_count == global._assets_to_load_done) {
        global._assets_have_loaded = true
    }
    if (global._assets_have_loaded && false) {
        clearInterval(load)
        setTimeout(() => {
            screen.loading.background.style.opacity = "0"
            setTimeout(() => {
                screen.loading.background.style.display = "none"
            }, 300)
        }, 500)
    }
}, 100)
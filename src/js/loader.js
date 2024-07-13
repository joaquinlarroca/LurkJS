import { global, screen } from "./main.js"

const loadingBarColor = screen.css.computedStyles.getPropertyValue('--loading-bar-done-color').trim();
const loadingBackgroundColor = screen.css.computedStyles.getPropertyValue('--loading-bar-color').trim();


let load = setInterval(() => {
    var percent = global._assets_to_load_done / global._assets_to_load_count * 100
    screen.loading.bar.style.background = `linear-gradient(90deg, ${loadingBarColor} ${percent}%, ${loadingBackgroundColor} ${percent}%)`
    screen.loading.indicator.innerText = `${percent.toFixed(0)}%`
    if (global._assets_to_load_count == global._assets_to_load_done) {
        global._assets_have_loaded = true
    }
    if (global._assets_have_loaded && true) {
        clearInterval(load)
        setTimeout(() => {
            screen.loading.background.style.opacity = "0"
            setTimeout(() => {
                screen.loading.background.style.display = "none"
            }, 250)
        }, 250)
    }
}, 100)
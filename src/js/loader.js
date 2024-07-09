import { global, screen } from "./main.js"
let load = setInterval(() => {
    screen.loading.assets_loaded_bar.style.width = global._assets_to_load_done / global._assets_to_load_count * 100 + "%"
    if (global._assets_to_load_count == global._assets_to_load_done) {
        global._assets_have_loaded = true
    }
    if (global._assets_have_loaded) {
        clearInterval(load)
        setTimeout(() => {
            screen.loading.background.style.opacity = "0"
            setTimeout(() => {
                screen.loading.background.style.display = "none"
            }, 300)
        }, 500)
    }
}, 100)
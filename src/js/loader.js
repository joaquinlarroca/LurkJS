import { global, screen } from "./main.js"

<<<<<<< HEAD
const loadingBarColor = screen.css.computedStyles.getPropertyValue('--loading-bar-done-color').trim() ?? "#A9F249";
const loadingBackgroundColor = screen.css.computedStyles.getPropertyValue('--loading-bar-color').trim() ?? "#000000";
screen.loading.logo_bg = loadingBackgroundColor
=======
const loadingBarColor = screen.css.computedStyles.getPropertyValue('--loading-bar-done-color').trim();
const loadingBackgroundColor = screen.css.computedStyles.getPropertyValue('--loading-bar-color').trim();

>>>>>>> d18672557c6e3e3faf4a4250c2529c4010718a0c

let load = setInterval(() => {
    var percent = global._assets_to_load_done / global._assets_to_load_count * 100
    screen.loading.bar.style.background = `linear-gradient(90deg, ${loadingBarColor} ${percent}%, ${loadingBackgroundColor} ${percent}%)`
<<<<<<< HEAD
    if (global._assets_to_load_count == global._assets_to_load_done && true) {
        global._assets_have_loaded = true
=======
    screen.loading.indicator.innerText = `${percent.toFixed(0)}%`
    if (global._assets_to_load_count == global._assets_to_load_done) {
        global._assets_have_loaded = true
    }
    if (global._assets_have_loaded && true) {
>>>>>>> d18672557c6e3e3faf4a4250c2529c4010718a0c
        clearInterval(load)
        setTimeout(() => {
            screen.loading.background.style.opacity = "0"
            setTimeout(() => {
                screen.loading.background.style.display = "none"
<<<<<<< HEAD
            }, 300)
        }, 200)
=======
            }, 250)
        }, 250)
>>>>>>> d18672557c6e3e3faf4a4250c2529c4010718a0c
    }
}, 100)

export async function waitForLoad() {
    return new Promise((resolve) => {
        const checkLoaded = () => {
            if (global._assets_have_loaded) {
                resolve();
            } else {
                setTimeout(checkLoaded, 100);
            }
        };
        checkLoaded();
    });
}

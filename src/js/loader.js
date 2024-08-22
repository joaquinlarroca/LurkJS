import { global, image, screen } from "./main.js"

const loadingBarColor = screen.css.computedStyles.getPropertyValue('--loading-bar-done-color').trim() ?? "#A9F249";
const loadingBackgroundColor = screen.css.computedStyles.getPropertyValue('--loading-bar-color').trim() ?? "#000000";
screen.loading.logo_bg = loadingBackgroundColor

let load = setInterval(() => {
    var percent = global._assetsToLoadDone / global._assetsToLoadCount * 100
    document.title = percent.toFixed(0) + "%"
    screen.loading.bar.style.background = `linear-gradient(90deg, ${loadingBarColor} ${percent}%, ${loadingBackgroundColor} ${percent}%)`
    if (global._assetsToLoadCount == global._assetsToLoadDone && true) {
        global._assets_have_loaded = true
        clearInterval(load)
        setTimeout(() => {
            screen.loading.background.style.opacity = "0"
            setTimeout(() => {
                screen.loading.background.style.display = "none"
            }, 300)
        }, 200)
    }
}, 100)

export async function waitForLoad() {
    return new Promise((resolve) => {
        const checkLoaded = () => {
            if (global._assets_have_loaded) {
                resolve();
                if (!global._started) {
                    setTimeout(() => {
                        global._started = true
                        window.dispatchEvent(new Event('started'));
                    }, 0)
                }
            } else {
                setTimeout(checkLoaded, 25);
            }
        };
        checkLoaded();
    });
}
export async function loadImage(url, name) {
    if (image[url]) {
        return image[url]
    }
    if (name == undefined) {
        name = url
    }
    global._assetsToLoadCount += 1;
    let imageElement;
    try {
        imageElement = new Image();
        imageElement.src = url;
        await new Promise((resolve, reject) => {
            imageElement.onload = () => {
                global._assetsToLoadDone += 1;
                resolve();
            };
            imageElement.onerror = () => {
                reject(new Error(`Failed to load texture: ${url}`));
            };
        });
    } catch (error) {
        throw error;
    }
    image[name] = imageElement
    return imageElement;
}
export async function loadSound(url, name) {
    if (sound[url]) {
        return sound[url]
    }
    if (name == undefined) {
        name = url
    }
    global._assetsToLoadCount += 1;
    let audioElement;
    
    await new Promise((resolve, reject) => {
        audioElement = new Audio();
        audioElement.src = url;
        audioElement.onload = () => {
            global._assetsToLoadDone += 1;
            resolve();
        };
        audioElement.onerror = () => {
            reject(new Error(`Failed to load sound: ${url}`));
        };
    });
    sound[name] = audioElement
    return audioElement;
}

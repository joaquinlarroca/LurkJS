import { engineState, fonts, images, screen, sounds } from "./main.ts"
import { emit } from "./events.ts"

const loadingBarColor =
    screen.css.computedStyles.getPropertyValue("--loading-bar-done-color").trim() || "#A9F249"
const loadingBackgroundColor =
    screen.css.computedStyles.getPropertyValue("--loading-bar-color").trim() || "#000000"

/** In-flight asset loads, keyed like the registries, to dedupe concurrent requests. */
const pendingImages: Record<string, Promise<HTMLImageElement>> = {}
const pendingSounds: Record<string, Promise<HTMLAudioElement>> = {}
const pendingFonts: Record<string, Promise<FontFace>> = {}

const load = setInterval(() => {
    const percent =
        engineState.assetsToLoadCount > 0
            ? (engineState.assetsToLoadDone / engineState.assetsToLoadCount) * 100
            : 100
    screen.loading.bar?.style.setProperty(
        "background",
        `linear-gradient(90deg, ${loadingBarColor} ${Math.min(100, Math.max(0, percent))}%, ${loadingBackgroundColor} ${percent}%)`,
    )
    if (engineState.assetsToLoadCount === engineState.assetsToLoadDone) {
        engineState.assetsLoaded = true
        clearInterval(load)
        if (screen.loading.background) {
            setTimeout(() => {
                screen.loading.background!.style.opacity = "0"
                setTimeout(() => {
                    screen.loading.background!.style.display = "none"
                }, 300)
            }, 200)
        }
    }
}, 100)

/** Resolves once every requested asset has finished loading. */
export async function waitForLoad(): Promise<void> {
    return new Promise((resolve) => {
        const checkLoaded = () => {
            if (engineState.assetsLoaded) {
                resolve()
                if (!engineState.started) {
                    setTimeout(() => {
                        engineState.started = true
                        emit("started")
                    }, 0)
                }
            } else {
                setTimeout(checkLoaded, 25)
            }
        }
        checkLoaded()
    })
}

/** Loads an image texture and stores it under `name` (defaults to the url). */
export async function loadImage(url: string, name?: string): Promise<HTMLImageElement> {
    const key = name ?? url
    const cached = images[key]
    if (cached) return cached
    const pending = pendingImages[key]
    if (pending) return pending

    const loader = new Promise<HTMLImageElement>((resolve, reject) => {
        engineState.assetsToLoadCount += 1
        const imageElement = new Image()
        imageElement.onload = () => {
            engineState.assetsToLoadDone += 1
            resolve(imageElement)
        }
        imageElement.onerror = () => {
            engineState.assetsToLoadDone += 1
            reject(new Error(`Failed to load texture: ${url}`))
        }
        imageElement.src = url
    })
    pendingImages[key] = loader

    try {
        const imageElement = await loader
        images[key] = imageElement
        return imageElement
    } finally {
        delete pendingImages[key]
    }
}

/** Loads an audio asset and stores it under `name` (defaults to the url). */
export async function loadSound(url: string, name?: string): Promise<HTMLAudioElement> {
    const key = name ?? url
    const cached = sounds[key]
    if (cached) return cached
    const pending = pendingSounds[key]
    if (pending) return pending

    const loader = new Promise<HTMLAudioElement>((resolve, reject) => {
        engineState.assetsToLoadCount += 1
        const audioElement = new Audio()
        audioElement.oncanplay = () => {
            engineState.assetsToLoadDone += 1
            resolve(audioElement)
        }
        audioElement.onerror = () => {
            engineState.assetsToLoadDone += 1
            reject(new Error(`Failed to load sound: ${url}`))
        }
        audioElement.src = url
    })
    pendingSounds[key] = loader

    try {
        const audioElement = await loader
        sounds[key] = audioElement
        return audioElement
    } finally {
        delete pendingSounds[key]
    }
}

/** Loads and registers a font, stored under `name`. */
export async function loadFont(url: string, name: string): Promise<FontFace> {
    const cached = fonts[name]
    if (cached) return cached
    const pending = pendingFonts[name]
    if (pending) return pending

    const loader = (async () => {
        engineState.assetsToLoadCount += 1
        const fontFace = new FontFace(name, `url(${url})`)
        try {
            await fontFace.load()
        } catch (error) {
            engineState.assetsToLoadDone += 1
            throw new Error(`Failed to load font: ${url}`, { cause: error })
        }
        engineState.assetsToLoadDone += 1
        document.fonts.add(fontFace)
        return fontFace
    })()
    pendingFonts[name] = loader

    try {
        const fontFace = await loader
        fonts[name] = fontFace
        return fontFace
    } catch (error) {
        delete fonts[name]
        throw error
    } finally {
        delete pendingFonts[name]
    }
}

import type {
    button,
    camera,
    entity,
    hitbox,
    slider,
    sliderv,
    sound as soundClass,
    multiSound as multiSoundClass,
} from "./classes.ts"
import { emit } from "./events.ts"
import type { PluginInfo } from "./types.ts"

/** Engine metadata. */
export const engine = { name: "LurkJS", version: "0.1.0" }

/** Global, mutable engine state. */
export interface EngineState {
    appendTo: HTMLElement
    disableMouseEvents: boolean
    assetsToLoadCount: number
    assetsToLoadDone: number
    assetsLoaded: boolean
    started: boolean
    setUp: boolean
    loopStarted: boolean
    fixedLoopStarted: boolean
    shakingScreen: boolean
    canvas: { marginMultiplier: number }
    fps: number
    hitboxes: hitbox[]
    objects: entity[]
    buttons: button[]
    sliders: (slider | sliderv)[]
    cameras: camera[]
    soundPlayers: (soundClass | multiSoundClass)[]
    plugins: PluginInfo[]
}

/** Central mutable state singleton. */
export let engineState: EngineState = {
    appendTo: document.body,
    disableMouseEvents: false,
    assetsToLoadCount: 0,
    assetsToLoadDone: 0,
    assetsLoaded: false,
    started: false,
    setUp: false,
    loopStarted: false,
    fixedLoopStarted: false,
    shakingScreen: false,
    canvas: {
        marginMultiplier: -1,
    },
    fps: 0,
    hitboxes: [],
    objects: [],
    buttons: [],
    sliders: [],
    cameras: [],
    soundPlayers: [],
    plugins: [
        {
            name: engine.name,
            version: engine.version,
            author: "",
            description: "The LurkJS plugin support",
            path: "default",
            config: {},
        },
    ],
}

/** Registers a plugin and notifies listeners that the plugin list changed. */
export function registerPlugin(plugin: PluginInfo): void {
    engineState.plugins.push(plugin)
    emit("newPlugin")
}

/** Loaded image assets, keyed by name. */
export let images: Record<string, HTMLImageElement> = {}
/** Loaded audio assets, keyed by name. */
export let sounds: Record<string, HTMLAudioElement> = {}
/** Loaded font assets, keyed by name. */
export let fonts: Record<string, FontFace> = {}

/** Timing state updated every frame by the game loop. */
export interface TimeState {
    frameCount: number
    deltaTime: number
    time: number
    fixedDeltaTime: number
}
export let time: TimeState = {
    frameCount: 0,
    deltaTime: 0,
    time: 0,
    fixedDeltaTime: 0,
}

/** The drawing surface and related screen/DOM handles. */
export const canvas = document.createElement("canvas")
export const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!
export let screen = {
    doc: document.documentElement,
    body: document.body,
    loading: {
        background: document.getElementById("_loading_screen"),
        bar: document.getElementById("_loading_bar"),
    },
    css: {
        root: document.querySelector(":root")!,
        computedStyles: getComputedStyle(document.documentElement),
    },
    canvas,
    context: ctx,
}

export const engine = {
    name: "LurkJS",
    version: "0.0.1",
}
document.title = ` ${engine.name} ${engine.version}`
export let global = {
    _append_to: document.body,
    _disable_mouse_events: false,
    _assetsToLoadCount: 0,
    _assetsToLoadDone: 0,
    _assets_have_loaded: false,
    _sprites_to_draw: [],
    _started: false,
    _setted_up: false,
    _loop_started: false,
    _fixed_loop_started: false,
    _shakingScreen: false,
    canvas: {
        marginMultiplier: -1,
    },
    fps: 0,
    _hitboxes: [],
    _objects: [],
    _buttons: [],
    _sliders: [],
    _cameras: [],
    _sounds: [],
    _plugins: [
        {
            name: engine.name,
            version: engine.version,
            author: "",
            description: "The LurkJS plugin support",
            path: "default",
            config: {}
        }
    ],
}
global._plugins.newPlugin = (plugin) => {
    dispatchEvent(new CustomEvent('newPlugin'));
    global._plugins.push(plugin);
}
export let image = {};
export let sound = {};
export let font = {};

export let time = {
    frameCount: 0,
    deltaTime: 0,
    time: 0,
    scale: 1,
    fixedDeltaTime: 0,
}

export let screen = {
    doc: document.documentElement,
    body: document.body,
    loading: {
        background: document.getElementById("_loading_screen"),
        bar: document.getElementById("_loading_bar"),
        logo: document.getElementById("_loading_logo"),
        logo_bg: document.getElementById("_loading_logo_bg"),
    },
    css: {
        root: document.querySelector(":root"),
        computedStyles: undefined,
    },
    canvas: document.createElement("canvas"),
    context: undefined,
};
screen.context = screen.canvas.getContext("2d");
export let ctx = screen.context;
export let canvas = screen.canvas;
screen.css.computedStyles = getComputedStyle(screen.css.root);
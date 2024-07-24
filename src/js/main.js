export let global = {
    _assetsToLoadCount: 0,
    _assetsToLoadDone: 0,
    _assets_have_loaded: false,
    _sprites_to_draw: [],
    _started: false,
    _setted_up: false,
    _loop_started: false,
    _fixed_loop_started: false,
    canvas: {
        marginMultiplier: -1,
    },
}


export let screen = {
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
export let global = {
    _assets_to_load_count: 0,
    _assets_to_load_done: 0,
    _assets_have_loaded: false,
    _sprites_to_draw: [],
}

export let canvas = undefined
export let context = undefined
export let screen = {
    loading: {
        background: document.getElementById("_loading_screen"),
        bar: document.getElementById("_loading_bar"),
        assets_loaded_bar: document.getElementById("_loading_res_loaded"),
    },
    canvas: undefined,
}

export let global = {
    _things_to_load_count: 0,
    _things_to_load_done: 0,
    _has_loaded: false
}
export let screen = {
    loading: {
        background: document.getElementById("_loading_screen"),
        bar: document.getElementById("_loading_bar"),
        res_loaded: document.getElementById("_loading_res_loaded"),
    }
}
let load_check = setInterval(() => {
    screen.loading.res_loaded.style.width = global._things_to_load_done / global._things_to_load_count * 100 + "%"
    if (global._things_to_load_count == global._things_to_load_done) {
        global._has_loaded = true
    }
    if (global._has_loaded) {
        clearInterval(load_check)
        setTimeout(() => {
            screen.loading.background.style.opacity = "0"
            setTimeout(() => {
                screen.loading.background.style.display = "none"
            }, 300)
        }, 500)
    }
}, 100)
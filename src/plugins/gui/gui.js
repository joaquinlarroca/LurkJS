import { loadFont } from "../../js/loader.js";
import { global } from "../../js/main.js";
let info = {
    name: "GUI",
    version: "0.0.1",
    author: "joaquinlarroca",
    description: "GUI for LurkJS",
    url: "https://github.com/LurkJS/LurkJS",
}
global._plugins.push(info)

export const gui = {
    css_file: "./src/plugins/gui/gui.css",
    css_link: document.createElement("link"),
    debug_info: document.createElement("div"),
    debug_tab: document.createElement("div"),
    debug_tab_buttons: document.createElement("div"),
    debug_tab_downarrow: document.createElement("img"),
    debug_container: document.createElement("div"),
}

gui.css_link.rel = "stylesheet"
gui.css_link.href = gui.css_file

gui.debug_info.className = "_gui_debug_info"
gui.debug_tab.className = "_gui_debug_tab"
gui.debug_tab_buttons.className = "_gui_debug_tab_button"
gui.debug_tab_downarrow.className = "_gui_debug_tab_downarrow"
gui.debug_tab_downarrow.src = "./src/plugins/gui/chevron-down.svg"

gui.debug_tab.innerHTML = `${info.name} ${info.version}`


document.head.appendChild(gui.css_link)


document.body.appendChild(gui.debug_info)

gui.debug_info.appendChild(gui.debug_tab)
gui.debug_tab.appendChild(gui.debug_tab_buttons)
gui.debug_tab_buttons.appendChild(gui.debug_tab_downarrow)
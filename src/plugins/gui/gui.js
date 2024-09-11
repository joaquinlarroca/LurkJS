import { drawtext } from "../../js/functions.js";
import { drawPointers } from "../../js/listeners.js";
import { canvas, global, screen, time } from "../../js/main.js";
let info = {
    name: "GUI",
    version: "1.0",
    author: "joaquinlarroca",
    description: "An interface for debugging in LurkJS"
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
    left_container: {
        container: document.createElement("div"),
        title: document.createElement("div"),
        content: document.createElement("div"),
    },
    right_container: {
        container: document.createElement("div"),
        title: document.createElement("div"),
        content: document.createElement("div"),
    },
    toggle_button: class {
        constructor(text, defualt_value) {
            this.toggle = document.createElement("div")
            this.toggle.className = "toggle_button"
            this.toggle_box = document.createElement("input")
            this.toggle_box.type = "checkbox"
            this.toggle_box.id = text + "_toggle"
            this.toggle_box.checked = defualt_value
            this.toggle_text = document.createElement("label")
            this.toggle_text.htmlFor = text + "_toggle"
            this.toggle_text.innerText = " " + text

            this.toggle.appendChild(this.toggle_box)
            this.toggle.appendChild(this.toggle_text)
        }
        enable() {
            if (this.toggle_box.disabled) {
                this.toggle_box.disabled = false
                this.toggle_text.style.color = "#fff"
            }
        }
        disable() {
            if (!this.toggle_box.disabled) {
                this.toggle_box.disabled = true
                if (this.toggle_box.checked) {
                    this.toggle_box.checked = false
                }
                this.toggle_text.style.color = "#BBB"
            }
        }
    }
}

gui.css_link.rel = "stylesheet"
gui.css_link.href = gui.css_file

gui.debug_info.className = "_gui_debug_info"
gui.debug_tab.className = "_gui_debug_tab"
gui.debug_tab_buttons.className = "_gui_debug_tab_button"
gui.debug_tab_downarrow.className = "_gui_debug_tab_downarrow"
gui.debug_tab_downarrow.src = "./src/plugins/gui/chevron-down.svg"
gui.debug_container.className = "_gui_debug_container"

gui.left_container.container.className = "_gui_left_container"
gui.left_container.title.className = "_gui_left_container_title"
gui.left_container.content.className = "_gui_left_container_content"
gui.debug_tab.innerHTML = `<div> ${info.name} <a style='color:#bbb'>${info.version}</a>  <a style='color:#444'>${info.description}</a> </div>`

gui.left_container.title.innerText = `Rendering options`


document.head.appendChild(gui.css_link)

gui.debug_tab.onclick = () => {
    check_to_disable();
    if (gui.debug_container.style.display == "none") {
        gui.debug_container.style.display = "flex";
        gui.debug_tab_downarrow.style.transform = "rotate(0deg)"
    }
    else {
        gui.debug_container.style.display = "none";
        gui.debug_tab_downarrow.style.transform = "rotate(180deg)"
    }
}


document.body.appendChild(gui.debug_info)
gui.debug_info.appendChild(gui.debug_tab)
gui.debug_info.appendChild(gui.debug_container)
gui.debug_tab.appendChild(gui.debug_tab_buttons)
gui.debug_tab_buttons.appendChild(gui.debug_tab_downarrow)

gui.debug_container.appendChild(gui.left_container.container)

gui.left_container.container.appendChild(gui.left_container.title)
gui.left_container.container.appendChild(gui.left_container.content)

let left_container = {
    "render_hitboxes": new gui.toggle_button("hitboxes", false),
    "render_pointers": new gui.toggle_button("pointers", false),
    "draw_cameras_crop_areas": new gui.toggle_button("cameras crop areas", false),
    "fps": new gui.toggle_button("frames per second", false),
}
function check_to_disable(){
    if (global._hitboxes.length <= 0) {
        left_container["render_hitboxes"].disable()
    }
    else {
        left_container["render_hitboxes"].enable()
    }
    if (global._cameras.length <= 0) {
        left_container["draw_cameras_crop_areas"].disable()
    }
    else {
        left_container["draw_cameras_crop_areas"].enable()
    }
}

setInterval(() => {
    check_to_disable();
}, 2500)

window.addEventListener("afterUpdate", () => {
    if (left_container["render_hitboxes"].toggle_box.checked) {
        global._hitboxes.forEach(element => {
            element.draw();
        });
    }
    if (left_container["render_pointers"].toggle_box.checked) {
        drawPointers();
    }
    if (left_container["draw_cameras_crop_areas"].toggle_box.checked) {
        global._cameras.forEach(element => {
            element.drawcropArea();
        });
    }
    if (left_container["fps"].toggle_box.checked) {
        var size = canvas.width + canvas.height
        var text_size = size / 75
        var def_size = size / 256
        screen.context.save();
        screen.context.fillStyle = "#ffffff";
        drawtext(`FPS: ${global.fps}`, [canvas.width - def_size, canvas.height / 2], text_size, "monospace", "top", "end", 0, 1.0);
        screen.context.lineWidth = 1;
        screen.context.strokeStyle = "#000000";
        screen.context.font = `${size / 75}px monospace`;
        screen.context.textBaseline = "top";
        screen.context.textAlign = "end";
        screen.context.strokeText(`FPS: ${global.fps}`, canvas.width - def_size, canvas.height / 2);
        screen.context.restore();

        screen.context.save();
        screen.context.fillStyle = "#ffffff";
        drawtext(`Fixed FPS: ${(1 / time.fixedDeltaTime).toFixed(0)}`, [canvas.width - def_size, canvas.height / 2 + text_size], text_size, "monospace", "top", "end", 0, 1.0);
        screen.context.lineWidth = 1;
        screen.context.strokeStyle = "#000000";
        screen.context.font = `${text_size}px monospace`;
        screen.context.textBaseline = "top";
        screen.context.textAlign = "end";
        screen.context.strokeText(`Fixed FPS: ${(1 / time.fixedDeltaTime).toFixed(0)}`, canvas.width - def_size, canvas.height / 2 + text_size);
        screen.context.restore();

    }
})
for (var val in left_container) {
    if (left_container.hasOwnProperty(val)) {
        gui.left_container.content.appendChild(left_container[val].toggle)
    }
}
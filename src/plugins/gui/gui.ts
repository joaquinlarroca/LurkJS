import "./gui.css"
import chevronDownUrl from "./chevron-down.svg"
import noIconUrl from "./no-icon.png"
import { drawText } from "../../js/functions.ts"
import type { PluginInfo } from "../../js/types.ts"
import { drawPointers } from "../../js/listeners.ts"
import { on } from "../../js/events.ts"
import { canvas, engineState, registerPlugin, screen, time } from "../../js/main.ts"

const pluginIcons = import.meta.glob<string>("../*/icon.png", { eager: true, import: "default" })

/** Resolves a plugin's icon, accounting for Vite normalizing the importer's own folder to `./`. */
function pluginIconUrl(pluginPath: string): string {
    return (
        pluginIcons[`../${pluginPath}/icon.png`] ??
        pluginIcons[`./${pluginPath}/icon.png`] ??
        pluginIcons["./icon.png"] ??
        noIconUrl
    )
}

const info: PluginInfo = {
    name: "GUI",
    version: "1.0",
    author: "joaquinlarroca",
    description: "An interface for debugging in LurkJS",
    path: "gui",
    config: {
        open_on_start: false,
    },
}
registerPlugin(info)

const debugInfo = document.createElement("div")
const debugTab = document.createElement("div")
const debugTabDownarrow = document.createElement("img")
const debugContainer = document.createElement("div")

debugInfo.className = "_gui_debug_info"
debugTab.className = "_gui_debug_tab"
debugTabDownarrow.className = "_gui_debug_tab_downarrow"
debugTabDownarrow.src = chevronDownUrl
debugContainer.className = "_gui_debug_container"

debugTab.innerHTML = `<div> ${info.name} <a style="color:#bbb">${info.version}</a>  <a style="color:#444"></a> </div>`

const leftContainer = {
    container: document.createElement("div"),
    title: document.createElement("div"),
    content: document.createElement("div"),
}
const middleContainer = {
    container: document.createElement("div"),
    title: document.createElement("div"),
    content: document.createElement("div"),
}

leftContainer.container.className = "_gui_left_container"
leftContainer.title.className = "_gui_left_container_title"
leftContainer.content.className = "_gui_left_container_content"
leftContainer.title.innerText = "Rendering options"

middleContainer.container.className = "_gui_middle_container"
middleContainer.title.className = "_gui_middle_container_title"
middleContainer.content.className = "_gui_middle_container_content"
middleContainer.title.innerText = "Plugins"

if (!(info.config.open_on_start === true)) {
    debugContainer.style.display = "none"
    debugTabDownarrow.style.transform = "rotate(180deg)"
}

debugTab.onclick = () => {
    renderPlugins()
    if (debugContainer.style.display === "none") {
        debugContainer.style.display = "flex"
        debugTabDownarrow.style.transform = "rotate(0deg)"
    } else {
        debugContainer.style.display = "none"
        debugTabDownarrow.style.transform = "rotate(180deg)"
    }
}

document.body.appendChild(debugInfo)
debugInfo.appendChild(debugTab)
debugInfo.appendChild(debugContainer)
debugTab.appendChild(debugTabDownarrow)

debugContainer.appendChild(leftContainer.container)
leftContainer.container.appendChild(leftContainer.title)
leftContainer.container.appendChild(leftContainer.content)

debugContainer.appendChild(middleContainer.container)
middleContainer.container.appendChild(middleContainer.title)
middleContainer.container.appendChild(middleContainer.content)

class toggleButton {
    toggle: HTMLDivElement
    toggle_box: HTMLInputElement
    toggle_text: HTMLLabelElement

    constructor(text: string, defaultValue: boolean) {
        this.toggle = document.createElement("div")
        this.toggle.className = "toggle_button"
        this.toggle_box = document.createElement("input")
        this.toggle_box.type = "checkbox"
        this.toggle_box.id = text + "_toggle"
        this.toggle_box.checked = defaultValue
        this.toggle_text = document.createElement("label")
        this.toggle_text.htmlFor = text + "_toggle"
        this.toggle_text.innerText = " " + text

        this.toggle.appendChild(this.toggle_box)
        this.toggle.appendChild(this.toggle_text)
    }

    enable(): void {
        if (this.toggle_box.disabled) {
            this.toggle_box.disabled = false
            this.toggle_text.style.color = "#fff"
        }
    }

    disable(): void {
        if (!this.toggle_box.disabled) {
            this.toggle_box.disabled = true
            if (this.toggle_box.checked) {
                this.toggle_box.checked = false
            }
            this.toggle_text.style.color = "#BBB"
        }
    }
}

class pluginDisplay {
    plugin: HTMLDivElement

    constructor(i: PluginInfo) {
        this.plugin = document.createElement("div")
        this.plugin.className = "_gui_plugin"
        const plugin_text = document.createElement("a")
        plugin_text.className = "_gui_plugin_text"
        plugin_text.innerText = i.name
        const plugin_description = document.createElement("a")
        plugin_description.className = "_gui_plugin_description"
        plugin_description.innerText = i.description
        const plugin_image = document.createElement("img")
        plugin_image.className = "_gui_plugin_image"
        plugin_image.src = pluginIconUrl(i.path)
        plugin_image.onerror = () => {
            plugin_image.src = noIconUrl
        }
        this.plugin.appendChild(plugin_image)
        this.plugin.appendChild(plugin_text)
        this.plugin.appendChild(plugin_description)
    }
}

const leftOptions = {
    render_hitboxes: new toggleButton("hitboxes", false),
    render_pointers: new toggleButton("pointers", false),
    draw_cameras_crop_areas: new toggleButton("cameras crop areas", false),
    fps: new toggleButton("frames per second", false),
}

function checkToDisable(): void {
    if (engineState.hitboxes.length <= 0) {
        leftOptions.render_hitboxes.disable()
    } else {
        leftOptions.render_hitboxes.enable()
    }
    if (engineState.cameras.length <= 0) {
        leftOptions.draw_cameras_crop_areas.disable()
    } else {
        leftOptions.draw_cameras_crop_areas.enable()
    }
}

function renderPlugins(): void {
    middleContainer.content.innerHTML = ""
    engineState.plugins.forEach((plugin) => {
        middleContainer.content.appendChild(new pluginDisplay(plugin).plugin)
    })
    checkToDisable()
}

on("newPlugin", () => {
    renderPlugins()
    checkToDisable()
})

setInterval(() => {
    checkToDisable()
}, 2500)

on("afterUpdate", () => {
    if (leftOptions.render_hitboxes.toggle_box.checked) {
        engineState.hitboxes.forEach((element) => {
            element.draw()
        })
    }
    if (leftOptions.render_pointers.toggle_box.checked) {
        drawPointers()
    }
    if (leftOptions.draw_cameras_crop_areas.toggle_box.checked) {
        engineState.cameras.forEach((element) => {
            element.drawCropArea()
        })
    }
    if (leftOptions.fps.toggle_box.checked) {
        const size = canvas.width + canvas.height
        const text_size = size / 75
        const def_size = size / 256
        screen.context.save()
        screen.context.fillStyle = "#ffffff"
        drawText(
            `FPS: ${engineState.fps}`,
            [canvas.width - def_size, canvas.height / 2],
            text_size,
            "monospace",
            "top",
            "end",
            0,
            1.0,
        )
        screen.context.lineWidth = 1
        screen.context.strokeStyle = "#000000"
        screen.context.font = `${text_size}px monospace`
        screen.context.textBaseline = "top"
        screen.context.textAlign = "end"
        screen.context.strokeText(
            `FPS: ${engineState.fps}`,
            canvas.width - def_size,
            canvas.height / 2,
        )
        screen.context.restore()

        screen.context.save()
        screen.context.fillStyle = "#ffffff"
        drawText(
            `Fixed FPS: ${time.fixedDeltaTime > 0 ? (1 / time.fixedDeltaTime).toFixed(0) : "0"}`,
            [canvas.width - def_size, canvas.height / 2 + text_size],
            text_size,
            "monospace",
            "top",
            "end",
            0,
            1.0,
        )
        screen.context.lineWidth = 1
        screen.context.strokeStyle = "#000000"
        screen.context.font = `${text_size}px monospace`
        screen.context.textBaseline = "top"
        screen.context.textAlign = "end"
        screen.context.strokeText(
            `Fixed FPS: ${time.fixedDeltaTime > 0 ? (1 / time.fixedDeltaTime).toFixed(0) : "0"}`,
            canvas.width - def_size,
            canvas.height / 2 + text_size,
        )
        screen.context.restore()
    }
})

for (const key of Object.keys(leftOptions) as (keyof typeof leftOptions)[]) {
    leftContainer.content.appendChild(leftOptions[key].toggle)
}

export const gui = {
    info,
    debugInfo,
    debugTab,
    debugContainer,
    leftContainer,
    middleContainer,
    toggleButton,
    pluginDisplay,
}

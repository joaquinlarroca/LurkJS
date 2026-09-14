import "./gui.css"
import chevronDownUrl from "./chevron-down.svg"
import noIconUrl from "./no-icon.png"
import { drawText } from "../../js/functions.ts"
import type { PluginInfo } from "../../js/types.ts"
import { drawPointers, pointers } from "../../js/listeners.ts"
import { on } from "../../js/events.ts"
import { canvas, engineState, registerPlugin, screen, time } from "../../js/main.ts"
import { localStoragePlugin } from "../localStorage/ls.ts"

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

const guiConfigDefaults = {
    open_on_start: false,
    render_hitboxes: false,
    render_pointers: false,
    draw_cameras_crop_areas: false,
    fps: false,
    render_anchors: false,
    render_boundaries: false,
    render_angles: false,
    render_grid: false,
    grid_cell_size: 45,
    render_center: false,
    render_pointer_coords: false,
    render_velocity: false,
}

const configKey = "lurkjs.gui.config"

/** Merges any saved GUI config from localStorage into `info.config`. */
function loadGuiConfig(): void {
    const saved = localStoragePlugin.get(configKey)
    if (saved === null) {
        return
    }
    let parsed: unknown
    try {
        parsed = JSON.parse(saved)
    } catch {
        return
    }
    if (typeof parsed !== "object" || parsed === null) {
        return
    }
    const cfg = info.config
    for (const key of Object.keys(parsed)) {
        if (key in cfg) {
            cfg[key] = (parsed as Record<string, unknown>)[key]
        }
    }
}

const info: PluginInfo = {
    name: "GUI",
    version: "1.0",
    author: "joaquinlarroca",
    description: "An interface for debugging in LurkJS",
    path: "gui",
    config: { ...guiConfigDefaults },
}
registerPlugin(info)
loadGuiConfig()

const debugInfo = document.createElement("div")
const debugTab = document.createElement("div")
const debugTabDownarrow = document.createElement("img")
const debugResizeHandle = document.createElement("div")
const debugContainer = document.createElement("div")

debugInfo.className = "_gui_debug_info"
debugTab.className = "_gui_debug_tab"
debugTabDownarrow.className = "_gui_debug_tab_downarrow"
debugTabDownarrow.src = chevronDownUrl
debugResizeHandle.className = "_gui_debug_resize_handle"
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
const thirdContainer = {
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

thirdContainer.container.className = "_gui_third_container"
thirdContainer.title.className = "_gui_third_container_title"
thirdContainer.content.className = "_gui_third_container_content"
thirdContainer.title.innerText = "Debug"

if (!(info.config.open_on_start === true)) {
    debugContainer.style.display = "none"
    debugTabDownarrow.style.transform = "rotate(180deg)"
}

let isResizing = false
let resizeStartY = 0
let resizeStartHeight = 0

debugResizeHandle.addEventListener("pointerdown", (event) => {
    isResizing = true
    resizeStartY = event.clientY
    resizeStartHeight = debugContainer.getBoundingClientRect().height
    debugResizeHandle.setPointerCapture(event.pointerId)
})

debugResizeHandle.addEventListener("pointermove", (event) => {
    if (!isResizing) return
    const height = resizeStartHeight + resizeStartY - event.clientY
    const min = 2 * parseFloat(getComputedStyle(document.documentElement).fontSize)
    const max =
        window.innerHeight - 4 * parseFloat(getComputedStyle(document.documentElement).fontSize)
    debugContainer.style.height = `${Math.max(min, Math.min(max, height))}px`
})

const stopResize = (event: PointerEvent): void => {
    if (!isResizing) return
    isResizing = false
    debugResizeHandle.releasePointerCapture(event.pointerId)
}

debugResizeHandle.addEventListener("pointerup", stopResize)
debugResizeHandle.addEventListener("pointercancel", stopResize)

debugTab.onclick = () => {
    renderPlugins()
    if (debugContainer.style.display === "none") {
        debugContainer.style.display = "flex"
        debugTabDownarrow.style.transform = "rotate(0deg)"
    } else {
        debugContainer.style.display = "none"
        debugTabDownarrow.style.transform = "rotate(180deg)"
    }
    saveGuiConfig()
}

document.body.appendChild(debugInfo)
debugInfo.appendChild(debugTab)
debugInfo.appendChild(debugResizeHandle)
debugInfo.appendChild(debugContainer)
debugTab.appendChild(debugTabDownarrow)

debugContainer.appendChild(leftContainer.container)
leftContainer.container.appendChild(leftContainer.title)
leftContainer.container.appendChild(leftContainer.content)

debugContainer.appendChild(middleContainer.container)
middleContainer.container.appendChild(middleContainer.title)
middleContainer.container.appendChild(middleContainer.content)

debugContainer.appendChild(thirdContainer.container)
thirdContainer.container.appendChild(thirdContainer.title)
thirdContainer.container.appendChild(thirdContainer.content)

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

class numberConfig {
    row: HTMLDivElement
    config_input: HTMLInputElement

    constructor(text: string, defaultValue: number, min: number, max: number) {
        this.row = document.createElement("div")
        this.row.className = "number_config"
        const label = document.createElement("label")
        label.htmlFor = text + "_value"
        label.innerText = text
        this.config_input = document.createElement("input")
        this.config_input.type = "number"
        this.config_input.id = text + "_value"
        this.config_input.min = String(min)
        this.config_input.max = String(max)
        this.config_input.value = String(defaultValue)
        this.row.appendChild(label)
        this.row.appendChild(this.config_input)
    }

    enable(): void {
        if (this.config_input.disabled) {
            this.config_input.disabled = false
            this.config_input.style.color = "#d6ff9e"
        }
    }

    disable(): void {
        if (!this.config_input.disabled) {
            this.config_input.disabled = true
            this.config_input.style.color = "#BBB"
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

const gridCellSizeDefault =
    typeof info.config.grid_cell_size === "number" && info.config.grid_cell_size >= 8
        ? info.config.grid_cell_size
        : guiConfigDefaults.grid_cell_size

const leftOptions = {
    render_hitboxes: new toggleButton("hitboxes", info.config.render_hitboxes === true),
    render_pointers: new toggleButton("pointers", info.config.render_pointers === true),
    draw_cameras_crop_areas: new toggleButton(
        "cameras crop areas",
        info.config.draw_cameras_crop_areas === true,
    ),
    fps: new toggleButton("frames per second", info.config.fps === true),
    render_anchors: new toggleButton("object anchors", info.config.render_anchors === true),
    render_boundaries: new toggleButton(
        "object boundaries",
        info.config.render_boundaries === true,
    ),
    render_angles: new toggleButton("object angles", info.config.render_angles === true),
    render_grid: new toggleButton("grid", info.config.render_grid === true),
    grid_cell_size: new numberConfig("cell size (px)", gridCellSizeDefault, 8, 240),
    render_center: new toggleButton("screen center", info.config.render_center === true),
    render_pointer_coords: new toggleButton(
        "pointer coords",
        info.config.render_pointer_coords === true,
    ),
    render_velocity: new toggleButton("velocity vectors", info.config.render_velocity === true),
}

/** Persists the current toggle states, grid cell size and panel visibility to localStorage. */
function saveGuiConfig(): void {
    const cfg = info.config
    cfg.open_on_start = debugContainer.style.display !== "none"
    cfg.render_hitboxes = leftOptions.render_hitboxes.toggle_box.checked
    cfg.render_pointers = leftOptions.render_pointers.toggle_box.checked
    cfg.draw_cameras_crop_areas = leftOptions.draw_cameras_crop_areas.toggle_box.checked
    cfg.fps = leftOptions.fps.toggle_box.checked
    cfg.render_anchors = leftOptions.render_anchors.toggle_box.checked
    cfg.render_boundaries = leftOptions.render_boundaries.toggle_box.checked
    cfg.render_angles = leftOptions.render_angles.toggle_box.checked
    cfg.render_grid = leftOptions.render_grid.toggle_box.checked
    const cellSize = leftOptions.grid_cell_size.config_input.valueAsNumber
    cfg.grid_cell_size = Number.isFinite(cellSize) && cellSize > 0 ? cellSize : 8
    cfg.render_center = leftOptions.render_center.toggle_box.checked
    cfg.render_pointer_coords = leftOptions.render_pointer_coords.toggle_box.checked
    cfg.render_velocity = leftOptions.render_velocity.toggle_box.checked
    localStoragePlugin.set(configKey, JSON.stringify(cfg))
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
    if (!leftOptions.render_grid.toggle_box.checked) {
        leftOptions.grid_cell_size.disable()
    } else {
        leftOptions.grid_cell_size.enable()
    }
}

function renderPlugins(): void {
    middleContainer.content.innerHTML = ""
    engineState.plugins.forEach((plugin) => {
        middleContainer.content.appendChild(new pluginDisplay(plugin).plugin)
    })
    checkToDisable()
    renderStats()
}

const stats = document.createElement("div")
stats.className = "_gui_stats"
thirdContainer.content.appendChild(stats)

function renderStats(): void {
    stats.innerHTML = [
        `canvas: ${canvas.width} x ${canvas.height}`,
        `fps: ${engineState.fps} · fixed: ${
            time.fixedDeltaTime > 0 ? (1 / time.fixedDeltaTime).toFixed(0) : "0"
        }`,
        `objects: ${engineState.objects.length} · hitboxes: ${engineState.hitboxes.length}`,
        `buttons: ${engineState.buttons.length} · sliders: ${engineState.sliders.length}`,
        `cameras: ${engineState.cameras.length} · sounds: ${engineState.soundPlayers.length}`,
        `plugins: ${engineState.plugins.length} · frames: ${time.frameCount}`,
    ].join("<br>")
}

on("newPlugin", () => {
    renderPlugins()
    checkToDisable()
})

setInterval(() => {
    checkToDisable()
    renderStats()
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
    if (leftOptions.render_anchors.toggle_box.checked) {
        screen.context.save()
        screen.context.strokeStyle = "#ff9f1a"
        screen.context.lineWidth = 2
        const drawAnchor = (point: { x: number; y: number }): void => {
            screen.context.beginPath()
            screen.context.moveTo(point.x - 6, point.y)
            screen.context.lineTo(point.x + 6, point.y)
            screen.context.moveTo(point.x, point.y - 6)
            screen.context.lineTo(point.x, point.y + 6)
            screen.context.stroke()
        }
        engineState.objects.forEach((element) => {
            element.update()
            drawAnchor(element.anchor)
        })
        engineState.sliders.forEach((element) => drawAnchor(element.anchor))
        screen.context.restore()
    }
    if (leftOptions.render_boundaries.toggle_box.checked) {
        screen.context.save()
        screen.context.strokeStyle = "#52c7ff"
        screen.context.lineWidth = 2
        engineState.objects.forEach((element) => {
            screen.context.strokeRect(element.x, element.y, element.width, element.height)
        })
        screen.context.restore()
    }
    if (leftOptions.render_angles.toggle_box.checked) {
        screen.context.save()
        screen.context.strokeStyle = "#a9f249"
        screen.context.lineWidth = 2
        engineState.objects.forEach((element) => {
            const radians = (element.angle * Math.PI) / 180
            const length = Math.min(element.width, element.height) * 2.2
            screen.context.beginPath()
            screen.context.moveTo(element.anchor.x, element.anchor.y)
            screen.context.lineTo(
                element.anchor.x + Math.cos(radians) * length,
                element.anchor.y + Math.sin(radians) * length,
            )
            screen.context.stroke()
        })
        screen.context.restore()
    }
    if (leftOptions.render_grid.toggle_box.checked) {
        screen.context.save()
        screen.context.strokeStyle = "rgba(255, 255, 255, 0.06)"
        screen.context.lineWidth = 1
        const rawCellSize = leftOptions.grid_cell_size.config_input.valueAsNumber
        const cellSize = Number.isFinite(rawCellSize) ? rawCellSize : 45
        const step = Math.max(4, cellSize)
        screen.context.beginPath()
        for (let x = step; x < canvas.width; x += step) {
            screen.context.moveTo(x, 0)
            screen.context.lineTo(x, canvas.height)
        }
        for (let y = step; y < canvas.height; y += step) {
            screen.context.moveTo(0, y)
            screen.context.lineTo(canvas.width, y)
        }
        screen.context.stroke()
        screen.context.restore()
    }
    if (leftOptions.render_center.toggle_box.checked) {
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        screen.context.save()
        screen.context.strokeStyle = "#52c7ff"
        screen.context.lineWidth = 1
        screen.context.beginPath()
        screen.context.moveTo(centerX, 0)
        screen.context.lineTo(centerX, canvas.height)
        screen.context.moveTo(0, centerY)
        screen.context.lineTo(canvas.width, centerY)
        screen.context.moveTo(centerX - 8, centerY)
        screen.context.lineTo(centerX + 8, centerY)
        screen.context.moveTo(centerX, centerY - 8)
        screen.context.lineTo(centerX, centerY + 8)
        screen.context.stroke()
        screen.context.restore()
    }
    if (leftOptions.render_pointer_coords.toggle_box.checked) {
        screen.context.save()
        screen.context.fillStyle = "#ffd34d"
        for (const pointer of Object.values(pointers)) {
            drawText(
                `(${Math.round(pointer.x)}, ${Math.round(pointer.y)})`,
                [pointer.x + 12, pointer.y + 20],
                16,
                "monospace",
                "top",
                "start",
                0,
                1,
            )
        }
        screen.context.restore()
    }
    if (leftOptions.render_velocity.toggle_box.checked) {
        screen.context.save()
        screen.context.strokeStyle = "#ff5b4d"
        screen.context.lineWidth = 2
        for (const obj of engineState.objects) {
            const vel = (obj as unknown as { vel?: { x: number; y: number } }).vel
            if (!vel) continue
            const magnitude = Math.hypot(vel.x, vel.y)
            if (magnitude < 1) continue
            const length = Math.min(magnitude * 0.1, 150)
            const unitX = vel.x / magnitude
            const unitY = vel.y / magnitude
            const tipX = obj.anchor.x + unitX * length
            const tipY = obj.anchor.y + unitY * length
            screen.context.beginPath()
            screen.context.moveTo(obj.anchor.x, obj.anchor.y)
            screen.context.lineTo(tipX, tipY)
            screen.context.stroke()
            screen.context.beginPath()
            screen.context.moveTo(tipX, tipY)
            screen.context.lineTo(tipX - unitX * 8 - unitY * 5, tipY - unitY * 8 + unitX * 5)
            screen.context.moveTo(tipX, tipY)
            screen.context.lineTo(tipX - unitX * 8 + unitY * 5, tipY - unitY * 8 - unitX * 5)
            screen.context.stroke()
        }
        screen.context.restore()
    }
})

for (const option of Object.values(leftOptions)) {
    if (option instanceof numberConfig) {
        leftContainer.content.appendChild(option.row)
    } else {
        leftContainer.content.appendChild(option.toggle)
    }
    const control = option instanceof numberConfig ? option.config_input : option.toggle_box
    control.addEventListener("change", () => {
        checkToDisable()
        saveGuiConfig()
    })
}
checkToDisable()

export const gui = {
    info,
    debugInfo,
    debugTab,
    debugResizeHandle,
    debugContainer,
    leftContainer,
    middleContainer,
    thirdContainer,
    stats,
    toggleButton,
    numberConfig,
    pluginDisplay,
}

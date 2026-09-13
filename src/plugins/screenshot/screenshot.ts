import { canvas, registerPlugin } from "../../js/main.ts"
import type { PluginInfo } from "../../js/types.ts"

const info: PluginInfo = {
    name: "Screenshot",
    version: "1.0",
    author: "joaquinlarroca",
    description: "Saves the canvas as a PNG, or copies it to the clipboard",
    path: "screenshot",
    config: {},
}
registerPlugin(info)

/** Downloads the current canvas frame as a PNG file. */
export function screenshot(filename = `lurkjs-screenshot-${Date.now()}.png`): void {
    canvas.toBlob((blob) => {
        if (!blob) {
            return
        }
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = filename
        link.click()
        URL.revokeObjectURL(url)
    })
}

/** Copies the current canvas frame to the clipboard as a PNG image. */
export async function copyScreenshot(): Promise<boolean> {
    if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
        return false
    }
    const blob: Blob = await new Promise((resolve) => {
        canvas.toBlob((result) => resolve(result ?? new Blob()), "image/png")
    })
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
    return true
}

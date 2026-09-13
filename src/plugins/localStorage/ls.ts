import { registerPlugin } from "../../js/main.ts"
import type { PluginInfo } from "../../js/types.ts"

const info: PluginInfo = {
    name: "Local Storage",
    version: "1.0",
    author: "joaquinlarroca",
    description: "Easy access to local storage",
    path: "localStorage",
    config: {},
}
registerPlugin(info)

function set(name: string, val: string): string {
    localStorage.setItem(name, val)
    return val
}

function get(name: string): string | null {
    const item = localStorage.getItem(name)
    if (item === null) {
        return null
    }
    return item
}

export let localStoragePlugin = {
    set,
    get,
}

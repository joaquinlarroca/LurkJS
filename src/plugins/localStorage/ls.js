import { global, screen, time } from "../../js/main.js";
let info = {
    name: "Local Storage",
    version: "1.0",
    author: "joaquinlarroca",
    description: "Easy access to local storage",
    path: "localStorage",
    config: {}
}
global._plugins.newPlugin(info);

function set(name, val) {
    localStorage.setItem(name, val);
    return val
}
function get(name) {
    const item = localStorage.getItem(name);
    if (name === null) {
        return false
    } else {
        return item
    }
}

export let localStoragePlugin = {
    set: set,
    get: get
};

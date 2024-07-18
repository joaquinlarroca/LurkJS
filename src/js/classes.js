import { global } from "./main.js";

export class Texture {
    constructor(url) {
        global._assets_to_load_count += 1;
        this.element = undefined;
        this.url = url;
        this.loaded = false;
        setTimeout(() => {
            try {
                this.element = new Image();
                this.element.src = url;
                this.element.onload = () => {
                    this.loaded = true;
                    global._assets_to_load_done += 1;
                };
                this.element.onerror = () => {
                    new Error("Failed to load texture: " + url);
                };

            } catch (error) {
                return error;
            }
        }, 5000 * Math.random() ** 2);


    }
}
for (let i = 0; i < 1000; i++) {
    new Texture("src/bunny.png");
}
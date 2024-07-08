import { global } from "./main.js";

export class Texture {
    constructor(url) {
        global._things_to_load_count += 1;
        this.element = undefined;
        this.url = url;
        this.loaded = false;
        setTimeout(() => {
            try {
                const texture = new Image();
                texture.src = url;
                texture.onload = () => {
                    this.element = texture;
                    this.loaded = true;
                    global._things_to_load_done += 1;
                };
                texture.onerror = () => {
                    new Error("Failed to load texture: " + url);
                };

            } catch (error) {
                return error;
            }
        }, 1000 * Math.random());


    }
}
for (let i = 0; i < 10; i++) {
    new Texture("source/bunny.png");
}
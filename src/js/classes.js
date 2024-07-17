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
<<<<<<< HEAD
        }, 1);
=======
        }, 4000 * Math.random());
>>>>>>> d18672557c6e3e3faf4a4250c2529c4010718a0c


    }
}
<<<<<<< HEAD
for (let i = 0; i < 1; i++) {
=======
for (let i = 0; i < 10000; i++) {
>>>>>>> d18672557c6e3e3faf4a4250c2529c4010718a0c
    new Texture("src/bunny.png");
}
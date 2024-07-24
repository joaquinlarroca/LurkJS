import { global, screen } from "./main.js";
import { waitForLoad } from "./loader.js";

export async function setup(width, height, marginMultiplier = 1, listeners = true) {
    await waitForLoad();
    if (typeof width == "number" && typeof height == "number" && width > 0 && height > 0) {
        if (typeof marginMultiplier === 'number' && marginMultiplier < 0 && marginMultiplier > 1) {
            marginMultiplier = 1;
        }
        if (!global._setted_up) {
            global._setted_up = true;
            global.canvas.marginMultiplier = marginMultiplier;
            document.body.append(screen.canvas);
            screen.canvas.width = width;
            screen.canvas.height = height;
        }

        const clientWidth = document.documentElement.clientWidth;
        const clientHeight = document.documentElement.clientHeight;

        let adjustedWidth, adjustedHeight;

        if (clientWidth / clientHeight > width / height) {
            adjustedHeight = clientHeight;
            adjustedWidth = (clientHeight * width) / height;
        }
        else {
            adjustedWidth = clientWidth;
            adjustedHeight = (clientWidth * height) / width;
        }
        adjustedWidth *= marginMultiplier;
        adjustedHeight *= marginMultiplier;



        screen.canvas.style.width = `${adjustedWidth}px`;
        screen.canvas.style.height = `${adjustedHeight}px`;
        screen.canvas.style.aspectRatio = `attr(width) / attr(height)`;
        screen.context.imageSmoothingEnabled = false;
    }
}


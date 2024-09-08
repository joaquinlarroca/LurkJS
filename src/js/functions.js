import { global, screen, canvas, time } from "./main.js";
import { loadImage, waitForLoad } from "./loader.js";

const canvasBG = screen.css.computedStyles.getPropertyValue('--canvas-bg').trim() ?? "#000000";

export async function setup(width, height, marginMultiplier = 1, targedfixedFps = 60) {
    if (!global._setted_up) {
        screen.canvas.width = width;
        screen.canvas.height = height;
        loadImage("./src/images/noTexture.png", "noTexture");
    }
    await waitForLoad();
    if (typeof width == "number" && typeof height == "number" && width > 0 && height > 0) {
        if (typeof marginMultiplier === 'number' && marginMultiplier < 0 && marginMultiplier > 1) {
            marginMultiplier = 1;
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

        if (!global._setted_up) {
            global._setted_up = true;
            global.canvas.marginMultiplier = marginMultiplier;
            global._append_to.append(screen.canvas);

            let timestamp = performance.now();
            let fixedTimeStamp = performance.now();
            let accumulator = 0;
            let fixedDeltaTime = 1 / targedfixedFps;
            function update(currentTimestamp) {
                time.frameCount += 1
                let deltaTime = (currentTimestamp - timestamp) / 1000;
                time.deltaTime = deltaTime;
                time.time += deltaTime;
                global.fps = (1 / deltaTime).toFixed(0);
                timestamp = currentTimestamp;

                accumulator += deltaTime;
                while (accumulator >= fixedDeltaTime) {
                    const currentTime = performance.now();
                    time.fixedDeltaTime = (currentTime - fixedTimeStamp) / 1000;
                    fixedTimeStamp = currentTime;
                    window.dispatchEvent(new CustomEvent('fixedUpdate'));
                    accumulator -= fixedDeltaTime;
                }
                window.dispatchEvent(new CustomEvent('update'));
                window.dispatchEvent(new Event('afterUpdate'));
                requestAnimationFrame(update);
            }
            requestAnimationFrame(update);
        }


    }
}
export function clear() {
    screen.context.save();
    screen.context.fillStyle = canvasBG;
    screen.context.fillRect(0, 0, screen.canvas.width, screen.canvas.height);
    screen.context.restore();
}
export function drawtext(text = "undefined", [x = 0, y = 0], fontSize = 24, fontFamily = "sans-serif", baseline = "top", textAlign = "start", angle = 0, alpha = 1.0) {
    screen.context.save();
    screen.context.textBaseline = baseline;
    screen.context.textAlign = textAlign;
    screen.context.font = `${fontSize}px ${fontFamily}`;
    screen.context.translate(x, y);
    screen.context.rotate(0.017453292519943295 * angle);
    screen.context.globalAlpha = alpha;
    screen.context.fillText(text, 0, 0);
    screen.context.restore();
}
export function sortAndDrawQueuedObjects() {
    // Sort by z and then by draw order
    global._sprites_to_draw.sort((a, b) => a.z - b.z || a.drawOrder - b.drawOrder);
    for (let sprite of global._sprites_to_draw) {
        sprite.draw(context);
    }
}
export function measureTextWidth(text, fontSize, fontFamily) {
    screen.context.save();
    text = text.toString();
    screen.context.font = `${fontSize}px ${fontFamily}`;
    const textMetrics = screen.context.measureText(text);
    screen.context.restore();
    return textMetrics.width;
}
export function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}
export function lerp(startValue, endValue, interpolation) {
    return startValue + (endValue - startValue) * interpolation;
}
export function shakeScreen(intensity, duration) {
    if (!global._shakingScreen) {
        global._shakingScreen = true;
        const matrix = screen.context.getTransform();
        const startX = matrix.e;
        const startY = matrix.f;
        const end = Date.now() + duration;
        const id = setInterval(() => {
            if (Date.now() < end) {
                const xShift = (Math.random() * 2 - 1) * intensity;
                const yShift = (Math.random() * 2 - 1) * intensity;
                screen.context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, startX + xShift, startY + yShift);
            }
            else {
                clearInterval(id)
                screen.context.setTransform(matrix)
                global._shakingScreen = false
            }
        }, 0);
    }
}
export function isValidColor(color) {
    const validate = new Option().style;
    validate.color = color;
    return validate.color !== '';
}

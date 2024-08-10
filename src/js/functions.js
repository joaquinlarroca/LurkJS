import { global, screen, canvas, ctx, time } from "./main.js";
import { waitForLoad } from "./loader.js";

export async function setup(width, height, marginMultiplier = 1, listeners = true) {
    if (!global._setted_up) {
        screen.canvas.width = width;
        screen.canvas.height = height;
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
            document.body.append(screen.canvas);

            let timestamp = performance.now();

            function update(currentTimestamp) {
                time.frameCount += 1
                let deltaTime = (currentTimestamp - timestamp) / 1000
                time.deltaTime = deltaTime;
                time.time += deltaTime
                global.fps = (1 / deltaTime).toFixed(0);
                timestamp = currentTimestamp;
                window.dispatchEvent(new CustomEvent('update'));
                window.dispatchEvent(new Event('afterUpdate'));
                requestAnimationFrame(update);
            }
            requestAnimationFrame(update);
        }


    }
}
const canvasBG = screen.css.computedStyles.getPropertyValue('--canvas-bg').trim() ?? "#000000";
export function clear() {
    screen.context.save()
    screen.context.fillStyle = canvasBG
    screen.context.fillRect(0, 0, screen.canvas.width, screen.canvas.height)
    screen.context.restore()
}
export function drawtext(text = "undefined", [x = 0, y = 0], fontSize = 24, fontFamily = "sans-serif", baseline = "top", textAlign = "start", angle = 0, alpha = 1.0) {
    ctx.save();
    ctx.textBaseline = baseline;
    ctx.textAlign = textAlign;
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.translate(x, y);
    ctx.rotate(0.017453292519943295 * angle);
    ctx.globalAlpha = alpha;
    ctx.fillText(text, 0, 0);
    ctx.restore();
}
export function sortAndDrawQueuedObjects() {
    // Sort by z and then by draw order
    global._sprites_to_draw.sort((a, b) => a.z - b.z || a.drawOrder - b.drawOrder);
    for (let sprite of global._sprites_to_draw) {
        sprite.draw(context);
    }
}

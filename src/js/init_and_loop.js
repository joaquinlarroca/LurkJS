export function setup(width, height, marginMultiplier = 1, listeners = true) {
    if (typeof width == "number" && typeof height == "number" && width > 0 && height > 0) {
        if (typeof marginMultiplier != "number" || marginMultiplier <= 0) {
            marginMultiplier = 1
        }
        if (!global.hasSetup) {
            global.hasSetup = true;
            global.setupMarginMultiplier = marginMultiplier;
            document.body.append(canvas);
            if (listeners == true) {
                setupAllEventListeners();
            }
        }

        const clientWidth = document.documentElement.clientWidth;
        const clientHeight = document.documentElement.clientHeight;

        let adjustedWidth, adjustedHeight;

        if (clientWidth / clientHeight > width / height) {
            adjustedHeight = clientHeight;
            adjustedWidth = (clientHeight * width) / height;
        } else {
            adjustedWidth = clientWidth;
            adjustedHeight = (clientWidth * height) / width;
        }
        adjustedWidth *= marginMultiplier;
        adjustedHeight *= marginMultiplier;

        canvas.width = width;
        canvas.height = height;

        canvas.style.width = `${adjustedWidth}px`;
        canvas.style.height = `${adjustedHeight}px`;
        canvas.style.aspectRatio = `attr(width) / attr(height)`;
        ctx.imageSmoothingEnabled = false;
    }
    else {
        global.error("f", 8);
    }
}

import { drawtext, isValidColor } from "./functions.js";
import { isHovering, isClicking, pointers, isPointer } from "./listeners.js";
import { canvas, global, image, screen } from "./main.js";

export class hitbox {
    constructor(object, sizeMultiplier) {
        global._hitboxes.push(this)
        this.type = "hitbox-rect"
        this.object = object ?? null
        this.sizeMultiplier = sizeMultiplier ?? 1
        this.width = object.width
        this.height = object.height
        this.left = object.x
        this.right = object.x + object.width
        this.top = object.y
        this.bottom = object.y + object.height
    }
    updateDimensions() {
        this.left = this.object.x + (this.object.width * (1 - this.sizeMultiplier) * .5)
        this.right = this.object.x + this.object.width - (this.object.width * (1 - this.sizeMultiplier) * .5)
        this.top = this.object.y + (this.object.height * (1 - this.sizeMultiplier) * .5)
        this.bottom = this.object.y + this.object.height - (this.object.height * (1 - this.sizeMultiplier) * .5)
        this.width = this.right - this.left
        this.height = this.bottom - this.top
    }
    collide(hitbox) {
        this.updateDimensions()
        hitbox.updateDimensions()
        switch (hitbox.type) {
            case "hitbox-rect":
            case "hitbox-rect-fixed":
                return this.right >= hitbox.left && this.left <= hitbox.right && this.bottom >= hitbox.top && this.top <= hitbox.bottom
            case "hitbox-circle":
            case "hitbox-circle-fixed":
                const dx = hitbox.x - Math.max(this.left, Math.min(hitbox.x, this.right))
                const dy = hitbox.y - Math.max(this.top, Math.min(hitbox.y, this.bottom))
                return Math.sqrt(dx ** 2 + dy ** 2) <= hitbox.radius
            default:
                return false
        }
    }

    draw() {
        this.updateDimensions()
        screen.context.save()
        screen.context.strokeStyle = "red"
        screen.context.lineWidth = 2
        screen.context.strokeRect(this.left, this.top, this.width, this.height)
        screen.context.restore()
    }
}
export class hitboxFixed {
    constructor([x, y], [width, height]) {
        global._hitboxes.push(this)
        this.type = "hitbox-rect-fixed"
        this.x = x ?? 0
        this.y = y ?? 0
        this.sizeMultiplier = 1
        this.width = width ?? 0
        this.height = height ?? 0
        this.left = x
        this.right = x + width
        this.top = y
        this.bottom = y + height
    }
    updateDimensions() {
        this.left = this.x + (this.width * (1 - this.sizeMultiplier) * .5)
        this.right = this.x + this.width - (this.width * (1 - this.sizeMultiplier) * .5)
        this.top = this.y + (this.height * (1 - this.sizeMultiplier) * .5)
        this.bottom = this.y + this.height - (this.height * (1 - this.sizeMultiplier) * .5)
        this.width = this.right - this.left
        this.height = this.bottom - this.top
    }
    collide(hitbox) {
        this.updateDimensions()
        hitbox.updateDimensions()
        switch (hitbox.type) {
            case "hitbox-rect":
            case "hitbox-rect-fixed":
                return this.right >= hitbox.left && this.left <= hitbox.right && this.bottom >= hitbox.top && this.top <= hitbox.bottom
            case "hitbox-circle":
            case "hitbox-circle-fixed":
                const dx = hitbox.x - Math.max(this.left, Math.min(hitbox.x, this.right))
                const dy = hitbox.y - Math.max(this.top, Math.min(hitbox.y, this.bottom))
                return Math.sqrt(dx ** 2 + dy ** 2) <= hitbox.radius
            default:
                return false
        }
    }

    draw() {
        this.updateDimensions()
        screen.context.save()
        screen.context.strokeStyle = "red"
        screen.context.lineWidth = 2
        screen.context.strokeRect(this.left, this.top, this.width, this.height)
        screen.context.restore()
    }
}
export class hitboxCircle {
    constructor(object, sizeMultiplier) {
        global._hitboxes.push(this)
        this.type = "hitbox-circle"
        this.object = object ?? null
        this.sizeMultiplier = sizeMultiplier ?? 1
        this.radius = this.object.halfwidth
        this.x = this.object.x + this.object.halfwidth
        this.y = this.object.y + this.object.halfheight
    }
    updateDimensions() {
        this.x = this.object.x + this.object.halfwidth
        this.y = this.object.y + this.object.halfheight
    }
    collide(hitbox) {
        this.updateDimensions()
        hitbox.updateDimensions()
        switch (hitbox.type) {
            case "hitbox-rect":
            case "hitbox-rect-fixed":
                const distancex = this.x - Math.max(hitbox.left, Math.min(this.x, hitbox.right))
                const distancey = this.y - Math.max(hitbox.top, Math.min(this.y, hitbox.bottom))
                return Math.sqrt(distancex ** 2 + distancey ** 2) <= this.radius
            case "hitbox-circle":
            case "hitbox-circle-fixed":
                const distance = Math.sqrt((hitbox.x - this.x) ** 2 + (hitbox.y - this.y) ** 2);
                return distance <= this.radius + hitbox.radius;
            default:
                return false
        }
    }

    draw() {
        screen.context.save()
        screen.context.strokeStyle = "red"
        screen.context.lineWidth = 2
        screen.context.beginPath();
        screen.context.moveTo(this.object.x + this.object.halfwidth, this.object.y + this.object.halfheight);
        screen.context.lineTo(this.object.x + this.object.halfwidth + this.radius, this.object.y + this.object.halfheight);
        screen.context.arc(this.object.x + this.object.halfwidth, this.object.y + this.object.halfheight, this.radius, 0, 2 * Math.PI);
        screen.context.stroke()
        screen.context.restore()
    }
}
export class hitboxCircleFixed {
    constructor([x, y], radius) {
        global._hitboxes.push(this)
        this.type = "hitbox-circle-fixed"
        this.x = x ?? 0
        this.y = y ?? 0
        this.sizeMultiplier = 1
        this.radius = radius ?? 32
    }
    updateDimensions() {
        // Nothing Here Too ... yet
    }
    collide(hitbox) {
        this.updateDimensions()
        hitbox.updateDimensions()
        switch (hitbox.type) {
            case "hitbox-rect":
            case "hitbox-rect-fixed":
                const distancex = this.x - Math.max(hitbox.left, Math.min(this.x, hitbox.right))
                const distancey = this.y - Math.max(hitbox.top, Math.min(this.y, hitbox.bottom))
                return Math.sqrt(distancex ** 2 + distancey ** 2) <= this.radius
            case "hitbox-circle":
            case "hitbox-circle-fixed":
                const distance = Math.sqrt((hitbox.x - this.x) ** 2 + (hitbox.y - this.y) ** 2);
                return distance <= this.radius + hitbox.radius;
            default:
                return false
        }
    }

    draw() {
        screen.context.save()
        screen.context.strokeStyle = "red"
        screen.context.lineWidth = 2
        screen.context.beginPath();
        screen.context.moveTo(this.x, this.y);
        screen.context.lineTo(this.x + this.radius, this.y);
        screen.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        screen.context.stroke()
        screen.context.restore()
    }
}
export class object {
    constructor(texture, [x, y], [width, height]) {
        global._objects.push(this)
        if (typeof texture == "string") {
            texture = texture.split(":")
            if (texture[0] == "color") {
                this.usingColor = true
                this.color = texture[1]
            }
            else {
                this.usingColor = false
                this.texture = image["noTexture"]
            }
        }
        else {
            this.usingColor = false
            this.texture = texture ?? null
        }
        this.x = x ?? 0
        this.y = y ?? 0
        this.offset = [0.5, 0.5]

        this.width = width ?? 32
        this.height = height ?? 32

        this.halfwidth = this.width / 2
        this.halfheight = this.height / 2
        this.scale = [1, 1]
        this.hitboxes = [
            new hitbox(this, 1)
        ]
        this.hitboxes.draw = () => {
            for (const hitbox of this.hitboxes) {
                hitbox.draw()
            }
        }
        this.anchor = {
            x: this.x + this.width * this.offset[0],
            y: this.y + this.height * this.offset[1]
        }
        this.angle = 0

        this.alpha = 1

        this.borderRadius = 0
    }
    collidesWith(object) {
        for (const hitboxes of this.hitboxes) {
            for (const otherHitboxes of object.hitboxes) {
                if (hitboxes.collide(otherHitboxes)) {
                    return true;
                }
            }
        }
        return false;
    }
    update() {
        this.halfwidth = this.width / 2
        this.halfheight = this.height / 2
        this.anchor = {
            x: this.x + this.width * this.offset[0],
            y: this.y + this.height * this.offset[1]
        }
    }
    draw() {
        this.update()
        screen.context.save()
        screen.context.globalAlpha = this.alpha

        screen.context.translate(this.anchor.x, this.anchor.y)
        screen.context.rotate(0.017453292519943295 * this.angle)
        screen.context.scale(this.scale[0], this.scale[1])

        screen.context.fillStyle = "rgba(0,0,0,0)"
        screen.context.beginPath();
        screen.context.roundRect(-this.width * this.offset[0], -this.height * this.offset[1], this.width, this.height, this.borderRadius);
        screen.context.closePath()
        screen.context.clip()
        if (this.usingColor) {
            screen.context.fillStyle = this.color
            screen.context.roundRect(-this.width * this.offset[0], -this.height * this.offset[1], this.width, this.height, this.borderRadius);
        }
        else {
            screen.context.drawImage(this.texture, -this.width * this.offset[0], -this.height * this.offset[1], this.width, this.height);
        }

        screen.context.fill();

        screen.context.restore();
    }
    setTexture(texture) {
        if (typeof texture == "string") {
            texture = texture.split(":")
            if (texture[0] == "color") {
                this.usingColor = true
                this.color = texture[1]
            }
            else {
                this.usingColor = false
                this.texture = image["noTexture"]
            }
        }
        else {
            this.usingColor = false
            this.texture = texture ?? null
        }
    }
}
export class button extends object {
    constructor(texture, [x, y], [width, height], [text, color, size, fontFamily], time) {
        super(texture, [x, y], [width, height])
        global._buttons.push(this)
        this.clicked = false
        this.hovered = false
        this.disabled = false
        this.text = {
            text: text,
            color: color,
            size: size,
            fontFamily: fontFamily,
            align: "center",
            baseline: "middle",
            pos: {
                baseline: 0,
                align: 0
            },
        }
        this.timeout = new timeout(time)
    }
    update() {
        if (isHovering(this.hitboxes[0])) {
            this.hovered = true
        }
        else {
            this.hovered = false
        }
        if (isClicking(this.hitboxes[0]) && !this.timeout.active) {
            this.clicked = true
            this.timeout.start()
        }
        else if (!this.timeout.active) {
            this.clicked = false
        }
        super.update()
    }
    draw() {
        super.draw()
        screen.context.fillStyle = this.text.color;
        switch (this.text.align) {
            case "left":
                this.text.pos.align = this.x
                break;
            case "right":
                this.text.pos.align = this.x + this.width
                break;
            case "center":
                this.text.pos.align = this.x + this.halfwidth
                break;
            default:
                this.text.pos.align = this.x + this.halfwidth
                break;
        }
        switch (this.text.baseline) {
            case "top":
                this.text.pos.baseline = this.y
                break;
            case "middle":
                this.text.pos.baseline = this.y + this.halfheight
                break;
            case "bottom":
                this.text.pos.baseline = this.y + this.height
                break;
            default:
                this.text.pos.baseline = this.y + this.halfheight
                break;
        }
        drawtext(this.text.text, [this.text.pos.align, this.text.pos.baseline], this.text.size, this.text.fontFamily, this.text.baseline, this.text.align, this.angle, this.alpha)
    }
}
export class slider {
    constructor(background_texture, thumb_texture, fill_texture, [x, y], [width, height], thumb_width, [minpercentage, maxpercentage], currentpercentage) {
        global._sliders.push(this)
        this.maxpercentage = maxpercentage
        this.minpercentage = minpercentage
        this.percentage = Math.max(Math.min(currentpercentage, this.maxpercentage), this.minpercentage)

        this.thumb = {
            texture: null,
            color: "rgba(0,0,0,0)",
            usingColor: false,
            x: (((this.percentage - this.minpercentage) / (this.maxpercentage - this.minpercentage)) * this.width) + this.x - (thumb_width * ((this.percentage - this.minpercentage) / (this.maxpercentage - this.minpercentage))),
            y: y,
            height: height,
            width: thumb_width,
            blocked: false,
            borderRadius: 0,
        }
        this.background = {
            texture: null,
            color: "rgba(0,0,0,0)",
            usingColor: false,
        }
        this.fill = {
            texture: null,
            color: "rgba(0,0,0,0)",
            usingColor: false,
            inverted: false,
        }
        // BACKGROUND TEXTURE
        if (typeof background_texture == "string") {
            background_texture = background_texture.split(":")
            if (background_texture[0] == "color") {
                this.background.usingColor = true
                this.background.color = background_texture[1]
            }
            else {
                this.background.usingColor = false
                this.background.texture = image["noTexture"]
            }
        }
        else {
            this.background.usingColor = false
            this.background.texture = background_texture ?? null
        }
        // THUMB TEXTURE
        if (typeof thumb_texture == "string") {
            thumb_texture = thumb_texture.split(":")
            if (thumb_texture[0] == "color") {
                this.thumb.usingColor = true
                this.thumb.color = thumb_texture[1]
            }
            else {
                this.thumb.usingColor = false
                this.thumb.texture = image["noTexture"]
            }
        }
        else {
            this.thumb.usingColor
            this.thumb.texture = thumb_texture ?? null
        }
        // FILL TEXTURE
        if (typeof fill_texture == "string") {
            fill_texture = fill_texture.split(":")
            if (fill_texture[0] == "color") {
                this.fill.usingColor = true
                this.fill.color = fill_texture[1]
            }
            else {
                this.fill.usingColor = false
                this.fill.texture = image["noTexture"]
            }
        }
        else {
            this.fill.usingColor
            this.fill.texture = fill_texture ?? null
        }

        this.width = width
        this.height = height
        this.x = x;
        this.y = y

        if (thumb_width > width / 2) {
            this.thumb.width = height
        }

        this.drag = {
            hasSet: false,
            pointer: undefined,
            offset: {
                x: 0,
                y: 0
            }
        }
        this.hitboxes = [
            new hitbox(this, 1),
            new hitbox(this.thumb, 1)
        ]
        this.hitboxes.draw = () => {
            for (const hitbox of this.hitboxes) {
                hitbox.draw()
            }
        }
        this.hover = false
        this.click = false

        this.halfwidth = this.width / 2
        this.halfheight = this.height / 2

        this.offset = [0.5, 0.5]

        this.anchor = {
            x: this.x + this.width * this.offset[0],
            y: this.y + this.height * this.offset[1]
        }
        this.angle = 0

        this.alpha = 1

        this.borderRadius = 0
    }
    update() {
        if (isHovering(this.hitboxes[0]) && !this.thumb.blocked) {
            this.hover = true
            if (isClicking(this.hitboxes[1], true)) {
                this.click = true
            }
            else {
                this.click = false
            }
        }
        else {
            this.hover = false
        }
        if (!this.thumb.blocked) {
            if (!this.drag.hasSet && this.drag.pointer == undefined) {
                let pointer = isPointer(this.hitboxes[1])
                if (pointer.down == true && pointer.attached == undefined) {
                    this.drag.hasSet = true
                    pointer.attached = this
                    this.drag.pointer = pointer
                    this.drag.offset.x = pointer.x - this.thumb.x
                    this.drag.offset.y = pointer.y - this.thumb.y
                }
            }
            else {
                this.drag.pointer = pointers[this.drag.pointer.key] ?? { down: false, attached: undefined, what: console.log("a") }
                if (this.drag.pointer.down) {
                    this.thumb.x = this.drag.pointer.x - this.drag.offset.x
                    if (this.thumb.x >= this.x + this.width - this.thumb.width) {
                        this.thumb.x = this.x + this.width - this.thumb.width
                    }
                    if (this.thumb.x <= this.x) {
                        this.thumb.x = this.x
                    }
                    this.percentage = ((this.thumb.x - this.x) * (this.maxpercentage - this.minpercentage) / (this.width - this.thumb.width)) + this.minpercentage;
                }
                else {
                    this.drag.hasSet = false
                    this.drag.pointer.attached = undefined
                    this.drag.pointer = undefined
                }
            }
            this.percentage = Math.max(Math.min(this.percentage, this.maxpercentage), this.minpercentage).toFixed(2)
            this.thumb.x = (((this.percentage - this.minpercentage) / (this.maxpercentage - this.minpercentage)) * this.width) + this.x - (this.thumb.width * ((this.percentage - this.minpercentage) / (this.maxpercentage - this.minpercentage)))
            this.thumb.y = this.y

            this.halfwidth = this.width / 2
            this.halfheight = this.height / 2

            this.anchor = {
                x: this.x + this.width * this.offset[0],
                y: this.y + this.height * this.offset[1]
            }
        }
    }
    draw() {
        screen.context.save();
        screen.context.translate(this.anchor.x, this.anchor.y);
        screen.context.rotate(0.017453292519943295 * this.angle);
        screen.context.globalAlpha = this.alpha;

        screen.context.fillStyle = "rgba(0,0,0,0)"
        screen.context.beginPath();
        screen.context.roundRect(-this.width * this.offset[0], -this.height * this.offset[1], this.width, this.height, this.borderRadius);
        screen.context.closePath()
        screen.context.clip()

        if (this.background.usingColor) {
            screen.context.fillStyle = this.background.color
            screen.context.fillRect(-this.width * this.offset[0], -this.height * this.offset[1], this.width, this.height);
            screen.context.fillStyle = "rgba(0,0,0,0)"
        }
        else {
            screen.context.drawImage(this.background.texture, -this.width * this.offset[0], -this.height * this.offset[1], this.width, this.height);
        }

        screen.context.fill();
        var percentage_slider = ((this.percentage - this.minpercentage) / (this.maxpercentage - this.minpercentage))
        var fill = {
            x: -this.width * this.offset[0],
            y: -this.height * this.offset[1],
            width: percentage_slider * this.width - percentage_slider * this.thumb.width + this.thumb.width / 2,
            height: this.height

        }
        if(this.fill.inverted){
            var inverted_percentage = this.maxpercentage - this.minpercentage - percentage_slider
            fill.x = -this.width * this.offset[0] + this.width
            fill.width = -inverted_percentage * this.width + inverted_percentage * this.thumb.width - this.thumb.width / 2
        }
        if (this.fill.usingColor) {
            screen.context.fillStyle = this.fill.color
            screen.context.fillRect(fill.x, fill.y, fill.width, fill.height);
            screen.context.fillStyle = "rgba(0,0,0,0)"
        }
        else {
            screen.context.drawImage(this.fill.texture, fill.x, fill.y, fill.width, fill.height);
        }
        screen.context.beginPath();
        screen.context.roundRect(-this.width * this.offset[0] + this.thumb.x - this.x, -this.height * this.offset[1], this.thumb.width, this.thumb.height, this.thumb.borderRadius);
        screen.context.clip()
        screen.context.closePath()
        if (this.thumb.usingColor) {
            screen.context.fillStyle = this.thumb.color
            screen.context.fillRect(-this.width * this.offset[0] + this.thumb.x - this.x, -this.height * this.offset[1], this.thumb.width, this.thumb.height);
            screen.context.fillStyle = "rgba(0,0,0,0)"
        }
        else {
            screen.context.drawImage(this.thumb.texture, -this.width * this.offset[0] + this.thumb.x - this.x, -this.height * this.offset[1], this.thumb.width, this.thumb.height);
        }
        screen.context.fill();
        screen.context.restore();
    }
    setTexture(background_texture, thumb_texture, fill_texture) {
        // BACKGROUND TEXTURE
        if (typeof background_texture == "string") {
            background_texture = background_texture.split(":")
            if (background_texture[0] == "color") {
                this.background.usingColor = true
                this.background.color = background_texture[1]
            }
            else {
                this.background.usingColor = false
                this.background.texture = image["noTexture"]
            }
        }
        else {
            this.background.usingColor = false
            this.background.texture = background_texture ?? null
        }
        // THUMB TEXTURE
        if (typeof thumb_texture == "string") {
            thumb_texture = thumb_texture.split(":")
            if (thumb_texture[0] == "color") {
                this.thumb.usingColor = true
                this.thumb.color = thumb_texture[1]
            }
            else {
                this.thumb.usingColor = false
                this.thumb.texture = image["noTexture"]
            }
        }
        else {
            this.thumb.usingColor
            this.thumb.texture = thumb_texture ?? null
        }
        // FILL TEXTURE
        if (typeof fill_texture == "string") {
            fill_texture = fill_texture.split(":")
            if (fill_texture[0] == "color") {
                this.fill.usingColor = true
                this.fill.color = fill_texture[1]
            }
            else {
                this.fill.usingColor = false
                this.fill.texture = image["noTexture"]
            }
        }
        else {
            this.fill.usingColor
            this.fill.texture = fill_texture ?? null
        }
    }
}
export class sliderv {
    constructor(background_texture, thumb_texture, fill_texture, [x, y], [width, height], thumb_height, [minpercentage, maxpercentage], currentpercentage) {
        global._sliders.push(this)
        this.maxpercentage = maxpercentage
        this.minpercentage = minpercentage
        this.percentage = Math.max(Math.min(currentpercentage, this.maxpercentage), this.minpercentage)

        this.thumb = {
            texture: null,
            x: x,
            y: (((this.percentage - this.minpercentage) / (this.maxpercentage - this.minpercentage)) * this.height) + this.y - (thumb_height * ((this.percentage - this.minpercentage) / (this.maxpercentage - this.minpercentage))),
            height: thumb_height,
            width: width,
            blocked: false,
            borderRadius: 0,
        }
        this.background = {
            texture: null,
            color: "rgba(0,0,0,0)",
            usingColor: false,
        }
        this.fill = {
            texture: null,
            color: "rgba(0,0,0,0)",
            usingColor: false,
            inverted: false,
        }
        // BACKGROUND TEXTURE
        if (typeof background_texture == "string") {
            background_texture = background_texture.split(":")
            if (background_texture[0] == "color") {
                this.background.usingColor = true
                this.background.color = background_texture[1]
            }
            else {
                this.background.usingColor = false
                this.background.texture = image["noTexture"]
            }
        }
        else {
            this.background.usingColor = false
            this.background.texture = background_texture ?? null
        }
        // THUMB TEXTURE
        if (typeof thumb_texture == "string") {
            thumb_texture = thumb_texture.split(":")
            if (thumb_texture[0] == "color") {
                this.thumb.usingColor = true
                this.thumb.color = thumb_texture[1]
            }
            else {
                this.thumb.usingColor = false
                this.thumb.texture = image["noTexture"]
            }
        }
        else {
            this.thumb.usingColor
            this.thumb.texture = thumb_texture ?? null
        }
        // FILL TEXTURE
        if (typeof fill_texture == "string") {
            fill_texture = fill_texture.split(":")
            if (fill_texture[0] == "color") {
                this.fill.usingColor = true
                this.fill.color = fill_texture[1]
            }
            else {
                this.fill.usingColor = false
                this.fill.texture = image["noTexture"]
            }
        }
        else {
            this.fill.usingColor
            this.fill.texture = fill_texture ?? null
        }
        this.width = width
        this.height = height
        this.x = x;
        this.y = y


        if (thumb_height > height / 2) {
            this.thumb.height = width
        }

        this.drag = {
            hasSet: false,
            pointer: undefined,
            offset: {
                x: 0,
                y: 0
            }
        }
        this.hitboxes = [
            new hitbox(this, 1),
            new hitbox(this.thumb, 1)
        ]
        this.hitboxes.draw = () => {
            for (const hitbox of this.hitboxes) {
                hitbox.draw()
            }
        }
        this.hover = false
        this.click = false

        this.halfwidth = this.width / 2
        this.halfheight = this.height / 2

        this.offset = [0.5, 0.5]

        this.anchor = {
            x: this.x + this.width * this.offset[0],
            y: this.y + this.height * this.offset[1]
        }
        this.angle = 0

        this.alpha = 1

        this.borderRadius = 0
    }
    update() {
        if (isHovering(this.hitboxes[0]) && !this.thumb.blocked) {
            this.hover = true
            if (isClicking(this.hitboxes[1], true)) {
                this.click = true
            }
            else {
                this.click = false
            }
        }
        else {
            this.hover = false
        }
        if (!this.thumb.blocked) {
            if (!this.drag.hasSet && this.drag.pointer == undefined) {
                let pointer = isPointer(this.hitboxes[1])
                if (pointer.down == true && pointer.attached == undefined) {
                    this.drag.hasSet = true
                    pointer.attached = this
                    this.drag.pointer = pointer
                    this.drag.offset.x = pointer.x - this.thumb.x
                    this.drag.offset.y = pointer.y - this.thumb.y
                }
            }
            else {
                this.drag.pointer = pointers[this.drag.pointer.key]
                if (this.drag.pointer.down) {
                    this.thumb.y = this.drag.pointer.y - this.drag.offset.y
                    if (this.thumb.y >= this.y + this.height - this.thumb.height) {
                        this.thumb.y = this.y + this.height - this.thumb.height
                    }
                    if (this.thumb.y <= this.y) {
                        this.thumb.y = this.y
                    }
                    this.percentage = ((this.thumb.y - this.y) * (this.maxpercentage - this.minpercentage) / (this.height - this.thumb.height)) + this.minpercentage;
                }
                else {
                    this.drag.hasSet = false
                    this.drag.pointer.attached = undefined
                    this.drag.pointer = undefined
                }
            }
            this.percentage = Math.max(Math.min(this.percentage, this.maxpercentage), this.minpercentage).toFixed(2)
            this.thumb.y = (((this.percentage - this.minpercentage) / (this.maxpercentage - this.minpercentage)) * this.height) + this.y - (this.thumb.height * ((this.percentage - this.minpercentage) / (this.maxpercentage - this.minpercentage)))
            this.thumb.x = this.x
            this.halfwidth = this.width / 2
            this.halfheight = this.height / 2

            this.anchor = {
                x: this.x + this.width * this.offset[0],
                y: this.y + this.height * this.offset[1]
            }
        }
    }
    draw() {
        screen.context.save();
        screen.context.translate(this.anchor.x, this.anchor.y);
        screen.context.rotate(0.017453292519943295 * this.angle);
        screen.context.globalAlpha = this.alpha;

        screen.context.fillStyle = "rgba(0,0,0,0)"
        screen.context.beginPath();
        screen.context.roundRect(-this.width * this.offset[0], -this.height * this.offset[1], this.width, this.height, this.borderRadius);
        screen.context.closePath()
        screen.context.clip()
        if (this.background.usingColor) {
            screen.context.fillStyle = this.background.color
            screen.context.fillRect(-this.width * this.offset[0], -this.height * this.offset[1], this.width, this.height);
        }
        else {
            screen.context.drawImage(this.background.texture, -this.width * this.offset[0], -this.height * this.offset[1], this.width, this.height);
        }
        screen.context.fill();
        var percentage_slider = ((this.percentage - this.minpercentage) / (this.maxpercentage - this.minpercentage))
        var fill = {
            x: -this.width * this.offset[0],
            y: -this.height * this.offset[1],
            width: this.width,
            height: percentage_slider * this.height - percentage_slider * this.thumb.height + this.thumb.height / 2

        }
        if(this.fill.inverted){
            var inverted_percentage = this.maxpercentage - this.minpercentage - percentage_slider
            fill.y = -this.height * this.offset[0] + this.height
            fill.height = -inverted_percentage * this.height + inverted_percentage * this.thumb.height - this.thumb.height / 2
        }
        if (this.fill.usingColor) {
            screen.context.fillStyle = this.fill.color
            screen.context.fillRect(fill.x, fill.y, fill.width, fill.height);
        }
        else {
            screen.context.drawImage(this.fill.texture, fill.x, fill.y, fill.width, fill.height);
        }
        screen.context.fillStyle = "rgba(0,0,0,0)"
        screen.context.beginPath();
        screen.context.roundRect(-this.width * this.offset[0], -this.height * this.offset[1] + this.thumb.y - this.y, this.thumb.width, this.thumb.height, this.thumb.borderRadius);
        screen.context.clip()
        screen.context.closePath()
        if (this.thumb.usingColor) {
            screen.context.fillStyle = this.thumb.color
            screen.context.fillRect(-this.width * this.offset[0], -this.height * this.offset[1] + this.thumb.y - this.y, this.thumb.width, this.thumb.height);
        }
        else {
            screen.context.drawImage(this.thumb.texture, -this.width * this.offset[0], -this.height * this.offset[1] + this.thumb.y - this.y, this.thumb.width, this.thumb.height);
        }
        screen.context.fill();
        screen.context.restore();
    }
    setTexture(background_texture, thumb_texture, fill_texture) {
        // BACKGROUND TEXTURE
        if (typeof background_texture == "string") {
            background_texture = background_texture.split(":")
            if (background_texture[0] == "color") {
                this.background.usingColor = true
                this.background.color = background_texture[1]
            }
            else {
                this.background.usingColor = false
                this.background.texture = image["noTexture"]
            }
        }
        else {
            this.background.usingColor = false
            this.background.texture = background_texture ?? null
        }
        // THUMB TEXTURE
        if (typeof thumb_texture == "string") {
            thumb_texture = thumb_texture.split(":")
            if (thumb_texture[0] == "color") {
                this.thumb.usingColor = true
                this.thumb.color = thumb_texture[1]
            }
            else {
                this.thumb.usingColor = false
                this.thumb.texture = image["noTexture"]
            }
        }
        else {
            this.thumb.usingColor
            this.thumb.texture = thumb_texture ?? null
        }
        // FILL TEXTURE
        if (typeof fill_texture == "string") {
            fill_texture = fill_texture.split(":")
            if (fill_texture[0] == "color") {
                this.fill.usingColor = true
                this.fill.color = fill_texture[1]
            }
            else {
                this.fill.usingColor = false
                this.fill.texture = image["noTexture"]
            }
        }
        else {
            this.fill.usingColor
            this.fill.texture = fill_texture ?? null
        }
    }
}
export class camera {
    constructor([x, y, w, h], [vx, vy, vw, vh]) {
        global._cameras.push(this)
        this.x = x
        this.y = y
        this.width = w
        this.height = h
        this.viewport = {
            x: vx,
            y: vy,
            width: vw,
            height: vh
        }
        this.snapshot = undefined
    }
    crop() {
        this.snapshot = canvas
    }
    draw() {
        screen.context.drawImage(this.snapshot, this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height, this.x, this.y, this.width, this.height)
    }
    drawcropArea() {
        screen.context.save();
        screen.context.strokeStyle = "#0000FF";
        screen.context.lineWidth = screen.canvas.width / screen.canvas.height * 2;
        screen.context.strokeRect(this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height);
        screen.context.restore();
    }
}
export class timeout {
    constructor(time = 1000) {
        this.time = time;
        this.active = false;
        this.currentTime = 0;
        this.timeLeft = 0
        this.timeElapsed = 0;
        this.updateTime = 75
    }
    start() {
        if (!this.active) {
            this.active = true;
            this.currentTime = Date.now();
            const timeout = setTimeout(() => {
                this.active = false;
                this.currentTime = 0;
                this.timeElapsed = 0;
                this.timeLeft = 0;
                clearTimeout(timeout);
            }, this.time);
            const updateTimeout = () => {
                if (this.active) {
                    this.timeElapsed = Date.now() - this.currentTime;
                    this.timeLeft = this.time - this.timeElapsed
                    setTimeout(updateTimeout, this.updateTime);
                }
            };
            updateTimeout();
        }
    }
}
export class sound {
    constructor(sound, playbackRate, volume, loop) {
        global._sounds.push(this)
        this.sound = new Audio()
        this.sound.src = sound
        this.sound.loop = loop ?? false
        this.sound.playbackRate = playbackRate ?? 1.0
        this.sound.volume = volume ?? 1.0

        this.sound.addEventListener('ended', () => {
            this.ended = true;
        });
        this.sound.addEventListener('timeupdate', () => {
            this.currentTime = this.sound.currentTime;
        });
        this.sound.addEventListener("canplaythrough", () => {
            this.sound.canplay = true
        })

    }
    play() {
        if (this.sound.canplay) {
            this.ended = false
            this.sound.play()
        }
    }
    pause() {
        this.sound.pause()
    }
    stop() {
        if (!this.sound.paused) {
            this.sound.pause()
        }
        this.sound.currentTime = 0
    }
    setCurrentTime(seconds) {
        if (seconds >= 0 && seconds <= this.sound.duration) {
            this.sound.currentTime = seconds;
        }
    }
}
export class sound2 {
    constructor(sound, playbackRate, volume) {
        global._sounds.push(this)
        this.playbackRate = playbackRate ?? 1.0
        this.volume = volume ?? 1.0
        this.audioSrc = sound;
        this.audioClones = [];
    }

    play() {
        let audio = new Audio(this.audioSrc);
        audio.playbackRate = this.playbackRate
        audio.volume = this.volume
        audio.play();
        this.audioClones.push(audio);

        audio.addEventListener('ended', () => {
            this.audioClones = this.audioClones.filter(clone => clone !== audio);
        });
    }

    stopAll() {
        this.audioClones.forEach(clone => {
            clone.pause();
            clone.currentTime = 0;
        });
        this.audioClones = [];
    }
}
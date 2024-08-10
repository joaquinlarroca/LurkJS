import { canvas, global, screen } from "./main.js";

export class hitbox {
    constructor(object, sizeMultiplier) {
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
        switch (hitbox.type) {
            case "hitbox-rect" || "hitbox-rect-fixed":
                hitbox.updateDimensions()
                return this.right >= hitbox.left && this.left <= hitbox.right && this.bottom >= hitbox.top && this.top <= hitbox.bottom
            case "hitbox-circle" || "hitbox-circle-fixed":
                const dx = this.x - Math.max(this.left, Math.min(hitbox.x, this.right))
                const dy = this.y - Math.max(this.top, Math.min(hitbox.y, this.bottom))
                return Math.sqrt(dx ** 2 + dy ** 2) <= hitbox.radius
            default:
                return false
        }
    }

    draw() {
        this.updateDimensions()
        screen.context.save()
        screen.context.strokeStyle = "red"
        screen.context.lineWidth = ((this.height / this.width) + (this.width / this.height)) * 2
        screen.context.strokeRect(this.left, this.top, this.width, this.height)
        screen.context.restore()
    }
}
export class hitboxFixed {
    constructor([x, y], [width, height]) {
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
        switch (hitbox.type) {
            case "hitbox-rect" || "hitbox-rect-fixed":
                hitbox.updateDimensions()
                return this.right >= hitbox.left && this.left <= hitbox.right && this.bottom >= hitbox.top && this.top <= hitbox.bottom
            case "hitbox-circle" || "hitbox-circle-fixed":
                const dx = this.x - Math.max(this.left, Math.min(hitbox.x, this.right))
                const dy = this.y - Math.max(this.top, Math.min(hitbox.y, this.bottom))
                return Math.sqrt(dx ** 2 + dy ** 2) <= hitbox.radius
            default:
                return false
        }
    }

    draw() {
        this.updateDimensions()
        screen.context.save()
        screen.context.strokeStyle = "red"
        screen.context.lineWidth = ((this.height / this.width) + (this.width / this.height)) * 2
        screen.context.strokeRect(this.left, this.top, this.width, this.height)
        screen.context.restore()
    }
}
export class hitboxCircle {
    constructor(object, sizeMultiplier, radius) {
        this.type = "hitbox-circle"
        this.object = object ?? null
        this.sizeMultiplier = sizeMultiplier ?? 1
        this.radius = radius ?? 32
    }
    updateDimensions() {
        // Nothing Here ... yet
    }
    collide(hitbox) {
        switch (hitbox.type) {
            case "hitbox-rect" || "hitbox-rect-fixed":
                hitbox.updateDimensions()
                const distancex = this.object.x - Math.max(hitbox.left, Math.min(this.object.x, hitbox.right))
                const distancey = this.object.y - Math.max(hitbox.top, Math.min(this.object.y, hitbox.bottom))
                return Math.sqrt(distancex ** 2 + distancey ** 2) <= this.radius
            case "hitbox-circle" || "hitbox-circle-fixed":
                const distance = Math.sqrt((hitbox.x - this.object.x) ** 2 + (hitbox.y - this.object.y) ** 2);
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
        screen.context.moveTo(this.object.x, this.object.y);
        screen.context.lineTo(this.object.x + this.radius, this.object.y);
        screen.context.arc(this.object.x, this.object.y, this.radius, 0, 2 * Math.PI);
        screen.context.stroke()
        screen.context.restore()
    }
}
export class hitboxCircleFixed {
    constructor([x, y], radius) {
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
        switch (hitbox.type) {
            case "hitbox-rect" || "hitbox-rect-fixed":
                hitbox.updateDimensions()
                const distancex = this.x - Math.max(hitbox.left, Math.min(this.x, hitbox.right))
                const distancey = this.y - Math.max(hitbox.top, Math.min(this.y, hitbox.bottom))
                return Math.sqrt(distancex ** 2 + distancey ** 2) <= this.radius
            case "hitbox-circle" || "hitbox-circle-fixed":
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
        this.texture = texture ?? null
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

        this.anchor = {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        }
        this.angle = 0

        this.alpha = 1

        this.left = this.x
        this.right = this.x + this.width
        this.top = this.y
        this.bottom = this.y + this.height

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

        this.left = this.x
        this.right = this.x + this.width
        this.top = this.y
        this.bottom = this.y + this.height

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
        screen.context.drawImage(this.texture, -this.width * this.offset[0], -this.height * this.offset[1], this.width, this.height);
        screen.context.fill();

        screen.context.restore();
    }
}
export class button extends object {
    constructor(texture, [x, y], [width, height]) {
        super(texture, [x, y], [width, height])

        this.clicked = false
        this.hovered = false
        this.disabled = false
    }
    update() {

        super.update()
    }
    draw() {
        super.draw()
    }
}
export class camera {
    constructor(x, y, w, h) {
        this.x = x
        this.y = y
        this.width = w
        this.height = h
        this.viewport = {
            x: 0,
            y: 0,
            width: screen.canvas.width,
            height: screen.canvas.height
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
        //draw the area
        screen.context.strokeStyle = "red"
        screen.context.lineWidth = screen.canvas.width / screen.canvas.height * 2
        screen.context.strokeRect(this.viewport.x, this.viewport.y, this.viewport.width, this.viewport.height)
    }
}
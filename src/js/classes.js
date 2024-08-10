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
        hitbox.updateDimensions()
        switch(hitbox.type) {
            case "hitbox-rect" || "hitbox-rect-fixed":
                return this.right >= hitbox.left && this.left <= hitbox.right && this.bottom >= hitbox.top && this.top <= hitbox.bottom
            case "hitbox-circle":
                return (this.left - hitbox.left) * (this.left - hitbox.left) + (this.top - hitbox.top) * (this.top - hitbox.top) <= (hitbox.radius * hitbox.radius)
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
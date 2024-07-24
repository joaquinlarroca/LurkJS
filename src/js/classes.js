import { global, screen } from "./main.js";

export class Object {
    constructor([x, y], [width, height]) {
        this.texture = undefined
        this.x = x
        this.y = y
        this.offset = [0, 0]

        this.width = width
        this.height = height

        this.halfwidth = this.width / 2
        this.halfheight = this.height / 2
        this.scale = [1, 1]
        this.hitboxes = []

        this.anchor = {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2
        }
        this.rotation = 0

        this.alpha = 1

        this.left = this.x
        this.right = this.x + this.width
        this.top = this.y
        this.bottom = this.y + this.height

        this.borderRadius = 0
    }
    draw() {
        this.halfwidth = this.width / 2
        this.halfheight = this.height / 2

        this.left = this.x
        this.right = this.x + this.width
        this.top = this.y
        this.bottom = this.y + this.height

        this.anchor = {
            x: this.x + this.width * -this.offset[0],
            y: this.y + this.height * -this.offset[1]
        }
        screen.context.save()
        screen.context.globalAlpha = this.alpha

        screen.context.translate(this.anchor.x, this.anchor.y)
        screen.context.rotate(0.017453292519943295 * this.rotation)
        screen.context.scale(this.scale[0], this.scale[1])

        screen.context.fillStyle = "rgba(0,0,0,0)"
        screen.context.beginPath();
        screen.context.roundRect(0, 0, this.width, this.height, this.borderRadius);
        screen.context.closePath()
        screen.context.clip()
        screen.context.drawImage(this.texture, 0, 0, this.width, this.height);
        screen.context.fill();

        screen.context.restore();
    }
}
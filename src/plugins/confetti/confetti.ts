import { on } from "../../js/events.ts"
import { registerPlugin, screen, time } from "../../js/main.ts"
import type { PluginInfo } from "../../js/types.ts"

const info: PluginInfo = {
    name: "Confetti",
    version: "1.0",
    author: "joaquinlarroca",
    description: "Gravity-bouncy confetti bursts and rain that draw on top of the scene",
    path: "confetti",
    config: {},
}
registerPlugin(info)

interface Confetto {
    x: number
    y: number
    velocityX: number
    velocityY: number
    size: number
    color: string
    rotation: number
    spin: number
    alpha: number
    fade: number
    wobblePhase: number
    wobbleSpeed: number
}

const colors = ["#ffd34d", "#ff9f1a", "#ff5b4d", "#a9f249", "#52c7ff", "#d166ff"]

const pieces: Confetto[] = []

let raining = false
let rainUntil = 0
let rainPerSecond = 0
let rainCarry = 0

const GRAVITY = 1500

function spawn(x: number, y: number, velocityX: number, velocityY: number): void {
    pieces.push({
        x,
        y,
        velocityX,
        velocityY,
        size: 6 + Math.random() * 8,
        color: colors[(Math.random() * colors.length) | 0]!,
        rotation: Math.random() * 360,
        spin: (Math.random() * 2 - 1) * 360,
        alpha: 1,
        fade: 0.6 + Math.random() * 0.5,
        wobblePhase: Math.random() * Math.PI * 2,
        wobbleSpeed: 2 + Math.random() * 3,
    })
}

on("update", () => {
    for (const piece of pieces) {
        piece.velocityY += GRAVITY * time.deltaTime
        piece.x +=
            (piece.velocityX + Math.sin(time.time * piece.wobbleSpeed + piece.wobblePhase) * 40) *
            time.deltaTime
        piece.y += piece.velocityY * time.deltaTime
        piece.rotation += piece.spin * time.deltaTime
        piece.alpha -= piece.fade * time.deltaTime

        if (piece.y > screen.canvas.height - piece.size / 2 && piece.velocityY > 0) {
            piece.y = screen.canvas.height - piece.size / 2
            piece.velocityY *= -0.45
            piece.velocityX *= 0.85
        }
    }
    for (let i = pieces.length - 1; i >= 0; i--) {
        if (pieces[i]!.alpha <= 0 || pieces[i]!.y < -40) {
            pieces.splice(i, 1)
        }
    }

    if (raining && time.time < rainUntil) {
        const due = rainPerSecond * time.deltaTime + rainCarry
        rainCarry = due - Math.floor(due)
        for (let i = 0; i < Math.floor(due); i++) {
            spawn(
                Math.random() * screen.canvas.width,
                -20,
                (Math.random() - 0.5) * 160,
                60 + Math.random() * 120,
            )
        }
    } else if (raining && time.time >= rainUntil) {
        raining = false
    }
})

on("afterUpdate", () => {
    for (const piece of pieces) {
        screen.context.save()
        screen.context.globalAlpha = Math.max(0, piece.alpha)
        screen.context.translate(piece.x, piece.y)
        screen.context.rotate((piece.rotation * Math.PI) / 180)
        screen.context.fillStyle = piece.color
        screen.context.fillRect(-piece.size / 2, -piece.size / 4, piece.size, piece.size / 2)
        screen.context.restore()
    }
})

/** A burst of confetti around a point (scatters upward and outward). */
export function burst(x: number, y: number, count = 40, spread = 320): void {
    for (let i = 0; i < count; i++) {
        spawn(x, y, (Math.random() - 0.5) * spread, -Math.random() * 520 - 120)
    }
}

/** A confetti snowfall from the top of the screen for `duration` ms. */
export function rain(duration = 2000, total = 120): void {
    raining = true
    rainUntil = time.time + duration / 1000
    rainPerSecond = total / (duration / 1000)
    rainCarry = 0
}

/** Removes every piece currently on screen. */
export function clear(): void {
    pieces.length = 0
    raining = false
}

export const confetti = {
    burst,
    rain,
    clear,
}

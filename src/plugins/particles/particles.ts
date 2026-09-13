import { registerPlugin, screen, time } from "../../js/main.ts"
import type { PluginInfo } from "../../js/types.ts"

const info: PluginInfo = {
    name: "Particles",
    version: "1.0",
    author: "joaquinlarroca",
    description: "Classes for generating particles",
    path: "particles",
    config: {},
}
registerPlugin(info)

/** A single particle with position, velocity, color and fading alpha. */
export class Particle {
    x: number
    y: number
    size: number
    color: string
    speed: { x: number; y: number }
    lifespan: number
    alphaReducer: number
    alpha = 1
    hasSetLifeSpan = false

    constructor(
        x: number,
        y: number,
        size: number,
        color: string,
        speedX: number,
        speedY: number,
        lifespan: number,
        alphaReducer: number,
    ) {
        this.x = x
        this.y = y
        this.size = size
        this.color = color
        this.speed = {
            x: speedX,
            y: speedY,
        }
        this.lifespan = lifespan
        this.alphaReducer = alphaReducer
    }

    update(): void {
        this.x += this.speed.x * time.deltaTime
        this.y += this.speed.y * time.deltaTime
        this.alpha -= this.alphaReducer ** time.deltaTime
        this.alpha = Math.max(0, Math.min(1, this.alpha))
        if (!this.hasSetLifeSpan) {
            this.hasSetLifeSpan = true
            setTimeout(() => {
                this.lifespan = -1
            }, this.lifespan)
        }
    }

    draw(): void {
        screen.context.save()
        screen.context.globalAlpha = this.alpha
        screen.context.fillStyle = this.color
        screen.context.fillRect(
            this.x - this.size / 2,
            this.y - this.size / 2,
            this.size,
            this.size,
        )
        screen.context.restore()
    }
}

/** Generates and owns a pool of particles. */
export class ParticleGenerator {
    x: number
    y: number
    particleCount: number
    sizeRange: number
    color: string
    speed: { x: number; y: number }
    lifespanRange: number
    alphaReducer: number
    particles: Particle[] = []

    constructor(
        x: number,
        y: number,
        particleCount: number,
        sizeRange: number,
        color: string,
        speedY: number,
        speedX: number,
        lifespanRange: number,
        alphaReducer: number,
    ) {
        this.x = x
        this.y = y
        this.particleCount = particleCount
        this.sizeRange = sizeRange
        this.color = color
        this.speed = {
            x: speedX,
            y: speedY,
        }
        this.lifespanRange = lifespanRange
        this.alphaReducer = alphaReducer
    }

    update(): void {
        for (const particle of this.particles) {
            particle.update()
        }
        this.particles = this.particles.filter(
            (particle) =>
                particle.lifespan > 0 &&
                particle.alpha > 0 &&
                particle.x > 0 &&
                particle.x < screen.canvas.width &&
                particle.y > 0 &&
                particle.y < screen.canvas.height,
        )
    }

    create(): void {
        for (let i = 0; i < this.particleCount; i++) {
            const size = Math.random() * this.sizeRange
            const speedX = Math.random() * 0.25 * this.speed.x
            const speedY = Math.random() * 0.25 * this.speed.y
            const lifespan = Math.random() * this.lifespanRange
            this.particles.push(
                new Particle(
                    this.x,
                    this.y,
                    size,
                    this.color,
                    speedX,
                    speedY,
                    lifespan,
                    this.alphaReducer,
                ),
            )
        }
    }

    draw(): void {
        for (const particle of this.particles) {
            particle.draw()
        }
    }
}

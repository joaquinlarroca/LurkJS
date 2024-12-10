import { global, screen, time } from "../../js/main.js";
let info = {
    name: "Particles",
    version: "1.0",
    author: "joaquinlarroca",
    description: "Classes for generating particles",
    path: "particles",
    config: {}
}
global._plugins.newPlugin(info);

export class Particle {
    constructor(x, y, size, color, speedX, speedY, lifespan, alphaReducer) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.speed = {
            x: speedX,
            y: speedY
        };
        this.lifespan = lifespan;
        this.alphaReducer = alphaReducer;
        this.alpha = 1;
        this.hasSetLifeSpan = false;
    }

    update() {
        this.x += this.speed.x * time.deltaTime;
        this.y += this.speed.y * time.deltaTime;
        this.alpha -= this.alphaReducer ** time.deltaTime;
        this.alpha = Math.max(0, Math.min(1, this.alpha));
        if (!this.hasSetLifeSpan) {
            this.hasSetLifeSpan = true;
            setTimeout(() => { this.lifespan = -1 }, this.lifespan);
        }

    }

    draw() {
        screen.context.save();
        screen.context.globalAlpha = this.alpha;
        screen.context.fillStyle = this.color;
        screen.context.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
        screen.context.restore();
    }
}

export class ParticleGenerator {
    constructor(x, y, particleCount, sizeRange, color, speedY, speedX, lifespanRange, alphaReducer) {
        this.x = x;
        this.y = y;
        this.particleCount = particleCount
        this.sizeRange = sizeRange
        this.color = color
        this.speed = {
            x: speedX,
            y: speedY
        };
        this.lifespanRange = lifespanRange
        this.alphaReducer = alphaReducer
        this.particles = [];
    }

    update() {
        this.particles.forEach(particle => {
            particle.update();
        });
        this.particles = this.particles.filter(particle => particle.lifespan > 0);
        this.particles = this.particles.filter(particle => particle.x > 0);
        this.particles = this.particles.filter(particle => particle.x < screen.canvas.width);
        this.particles = this.particles.filter(particle => particle.y > 0);
        this.particles = this.particles.filter(particle => particle.y < screen.canvas.height);
        this.particles = this.particles.filter(particle => particle.alpha > 0);
    }
    create() {
        for (let i = 0; i < this.particleCount; i++) {
            let size = Math.random() * this.sizeRange;
            let speedX = (Math.random() * 0.25) * this.speed.x;
            let speedY = (Math.random()* 0.25) * this.speed.y;
            let lifespan = Math.random() * this.lifespanRange;
            this.particles.push(new Particle(this.x, this.y, size, this.color, speedX, speedY, lifespan, this.alphaReducer));
        }
    }
    draw() {
        this.particles.forEach(particle => {
            particle.draw();
        });
    }
}
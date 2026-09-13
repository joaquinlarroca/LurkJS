import { ctx, time } from "./js/main.ts"
import { keyPressed as isKeyDown, mouse } from "./js/listeners.ts"
import { on } from "./js/events.ts"
import {
    button,
    camera,
    clamp,
    entity,
    hitboxCircle,
    object,
    slider,
    sliderv,
    timeout,
} from "./js/classes.ts"
import {
    clear,
    distance,
    drawText,
    getTimeElapsed,
    lerp,
    setup,
    shakeScreen,
} from "./js/functions.ts"
import { loadFont, loadImage } from "./js/loader.ts"
import { ParticleGenerator } from "./plugins/particles/particles.ts"
import { confetti } from "./plugins/confetti/confetti.ts"
import { screenshot } from "./plugins/screenshot/screenshot.ts"
import { boomTone, coinTone, shootTone } from "./plugins/synth/synth.ts"
import "./plugins/gui/gui.ts"
import bunnyUrl from "./images/bunny.png"
import bgUrl from "../bg.png"
import bubblyUrl from "../bubbly.ttf"

const W = 1920
const H = 1080
const startTime = Date.now()

const bunny = await loadImage(bunnyUrl, "bunny")
const parkImage = await loadImage(bgUrl, "park")
await loadFont(bubblyUrl, "bubbly")

await setup(W, H, 0.99, 60)

const park = new object(parkImage, [0, 0], [W, H])

class Player extends object {
    vel = { x: 0, y: 0 }
    dir = 1
}

class Debris extends object {
    vel = { x: 0, y: 0 }
}

const player = new Player(bunny, [420, 700], [120, 120])
player.hitboxes.push(new hitboxCircle(player, 0.55))

const coins: entity[] = []
const randX = () => 90 + Math.random() * 1130
const randY = () => 90 + Math.random() * 620
for (let i = 0; i < 8; i++) {
    const coin = new object("color: #ffd34d", [randX(), randY()], [54, 54])
    coin.borderRadius = 27
    coin.hitboxes.push(new hitboxCircle(coin, 0.85))
    coins.push(coin)
}

const panel = new object("color: rgba(10, 10, 16, 0.55)", [1310, 60], [400, 720])
panel.borderRadius = 24

const speedSlider = new slider(
    "color:#1c1c22",
    "color:#a9f249",
    "color:#a9f249",
    [1340, 560],
    [300, 30],
    30,
    [300, 2000],
    900,
)
speedSlider.borderRadius = 15
speedSlider.thumb.borderRadius = 15

const trailSlider = new slider(
    "color:#1c1c22",
    "color:#a9f249",
    "color:#a9f249",
    [1340, 620],
    [300, 30],
    30,
    [0, 24],
    10,
)
trailSlider.borderRadius = 15
trailSlider.thumb.borderRadius = 15

const gravitySlider = new sliderv(
    "color:#1c1c22",
    "color:#a9f249",
    "color:#a9f249",
    [1680, 140],
    [30, 400],
    30,
    [0, 1600],
    900,
)
gravitySlider.borderRadius = 15
gravitySlider.thumb.borderRadius = 15

const boom = new button(
    "color: #cf3a3a",
    [1340, 670],
    [300, 80],
    ["BOOM", "white", 48, "bubbly"],
    500,
)
boom.borderRadius = 20

const boomCooldown = new timeout(700)

const cam = new camera([1320, 800, 360, 250], [W / 2 - 150, H / 2 - 110, 300, 220])

const trail = new ParticleGenerator(player.x, player.y, 10, 9, "#a9f249", -60, -10, 500, 1.2)
const burst = new ParticleGenerator(0, 0, 60, 16, "#ff5b4d", -420, 520, 800, 1.1)
const coinBurst = new ParticleGenerator(0, 0, 26, 9, "#ffd34d", -260, 260, 450, 1.2)
const spark = new ParticleGenerator(0, 0, 30, 9, "#ff9f1a", -320, 380, 550, 1.2)

const debris: Debris[] = []
const debrisColors = ["#ffd34d", "#ff9f1a", "#a9f249", "#52c7ff"]
let score = 0
let wasDown = false
let pPressed = false
let fPressed = false

function explode(x: number, y: number): void {
    shakeScreen(16, 600)
    boomTone()
    confetti.burst(x, y, 26, 360)
    burst.x = x
    burst.y = y
    burst.create()
    for (let i = 0; i < 7; i++) {
        const piece = new Debris(
            `color: ${debrisColors[i % debrisColors.length]}`,
            [x, y],
            [24, 24],
        )
        piece.borderRadius = 12
        piece.vel = { x: Math.sin(i * 2.4) * 900, y: -Math.random() * 1400 }
        debris.push(piece)
    }
}

on("started", () => {
    burst.x = player.anchor.x
    burst.y = player.anchor.y
    burst.create()
})

on("update", () => {
    clear()

    park.draw()

    for (const coin of coins) {
        if (player.collidesWith(coin)) {
            score += 1
            coinBurst.x = coin.x + coin.halfwidth
            coinBurst.y = coin.y + coin.halfheight
            coinBurst.create()
            confetti.burst(coinBurst.x, coinBurst.y, 22, 180)
            coinTone(score)
            coin.x = randX()
            coin.y = randY()
        }
    }

    for (const coin of coins) {
        coin.angle += 120 * time.deltaTime
        coin.draw()
    }

    player.draw()

    for (const piece of debris) {
        piece.alpha -= 2.4 * time.deltaTime
        if (piece.alpha <= 0) {
            piece.destroy()
        }
        piece.draw()
    }
    for (let i = debris.length - 1; i >= 0; i--) {
        if (debris[i]!.toDelete) {
            debris.splice(i, 1)
        }
    }

    const speed = distance(0, 0, player.vel.x, player.vel.y)
    trail.x = player.anchor.x
    trail.y = player.anchor.y
    trail.particleCount = Math.round((speed / 400) * trailSlider.percentage)
    trail.create()
    trail.update()
    trail.draw()

    if (mouse.down && !wasDown) {
        spark.x = mouse.x
        spark.y = mouse.y
        spark.create()
        shootTone()
    }
    wasDown = mouse.down

    if (isKeyDown("p") && !pPressed) {
        screenshot()
    }
    pPressed = isKeyDown("p")
    if (isKeyDown("f") && !fPressed) {
        confetti.rain(1500, 90)
    }
    fPressed = isKeyDown("f")

    burst.update()
    burst.draw()
    coinBurst.update()
    coinBurst.draw()
    spark.update()
    spark.draw()

    const vw = 300
    const vh = 220
    cam.viewport.x = clamp(
        lerp(cam.viewport.x, player.x + player.halfwidth - vw / 2, 0.1),
        0,
        W - vw,
    )
    cam.viewport.y = clamp(
        lerp(cam.viewport.y, player.y + player.halfheight - vh / 2, 0.1),
        0,
        H - vh,
    )
    cam.crop()
    cam.draw()
    ctx.strokeStyle = "#a9f249"
    ctx.lineWidth = 3
    ctx.strokeRect(cam.x, cam.y, cam.width, cam.height)

    panel.draw()

    ctx.fillStyle = "#ffffff"
    drawText("ENGINE PLAYGROUND", [1510, 96], 40, "bubbly", "top", "center")
    ctx.fillStyle = "#d6ff9e"
    drawText("gravity", [1340, 150], 26, "bubbly")
    drawText(`${Math.round(gravitySlider.percentage)}`, [1630, 150], 26, "bubbly", "top", "end")
    ctx.fillStyle = "#c9c9c9"
    drawText("catch the coins", [1340, 214], 26, "bubbly")
    drawText("click — fireworks", [1340, 258], 26, "bubbly")
    drawText("BOOM — shockwave", [1340, 302], 26, "bubbly")
    drawText("P — screenshot, F — confetti", [1340, 346], 26, "bubbly")
    ctx.fillStyle = "#d6ff9e"
    drawText("speed", [1340, 528], 24, "bubbly")
    drawText(`${Math.round(speedSlider.percentage)}`, [1630, 528], 24, "bubbly", "top", "end")
    drawText("trail", [1340, 588], 24, "bubbly")
    drawText(`${Math.round(trailSlider.percentage)}`, [1630, 588], 24, "bubbly", "top", "end")

    boom.update()
    boom.draw()
    if (boom.clicked && !boomCooldown.active) {
        boomCooldown.start()
        boom.text.text = "KABOOM!"
        explode(player.anchor.x, player.anchor.y)
    } else if (boomCooldown.active) {
        boom.text.text = "recharging..."
    } else {
        boom.text.text = "BOOM"
    }

    ctx.fillStyle = "#ffffff"
    drawText(`${score} coins`, [64, 84], 64, "bubbly")
    drawText(getTimeElapsed(startTime), [64, 156], 40, "bubbly", "top", "start", 0, 0.9)
    ctx.fillStyle = "#ffffff"
    drawText(
        "drag the dials · P: screenshot · F: confetti rain · GUI tab: debug toggles",
        [64, H - 72],
        26,
        "sans-serif",
        "top",
        "start",
        0,
        0.75,
    )
})

on("fixedUpdate", () => {
    const maxSpeed = speedSlider.percentage

    player.vel.y += gravitySlider.percentage * time.fixedDeltaTime
    const targetX = mouse.x - player.x - player.halfwidth
    if (targetX > 40) {
        player.vel.x += 5200 * time.fixedDeltaTime
    }
    if (targetX < -40) {
        player.vel.x -= 5200 * time.fixedDeltaTime
    }

    if (isKeyDown("a")) {
        player.vel.x -= 6200 * time.fixedDeltaTime
        player.dir = -1
        player.scale = [-1, 1]
    }
    if (isKeyDown("d")) {
        player.vel.x += 6200 * time.fixedDeltaTime
        player.dir = 1
        player.scale = [1, 1]
    }
    if (isKeyDown("w")) {
        player.vel.y -= 4000 * time.fixedDeltaTime
    }
    if (isKeyDown("s")) {
        player.vel.y += 4000 * time.fixedDeltaTime
    }

    player.vel.y = clamp(player.vel.y, -maxSpeed, maxSpeed)
    player.vel.x = clamp(player.vel.x, -maxSpeed, maxSpeed)
    player.vel.x *= Math.pow(0.18, time.fixedDeltaTime)

    player.angle = Math.atan2(player.vel.y / 600, player.dir) * (180 / Math.PI)

    player.x += player.vel.x * time.fixedDeltaTime
    player.y += player.vel.y * time.fixedDeltaTime

    if (player.x < 0) {
        player.x = 0
        player.vel.x *= -0.4
    }
    if (player.x > W - player.width) {
        player.x = W - player.width
        player.vel.x *= -0.4
    }
    if (player.y > H - player.height) {
        player.y = H - player.height
        player.vel.y = 0
    }

    for (const piece of debris) {
        piece.vel.y += 1600 * time.fixedDeltaTime
        piece.x += piece.vel.x * time.fixedDeltaTime
        piece.y += piece.vel.y * time.fixedDeltaTime
        if (piece.y > H - piece.height) {
            piece.y = H - piece.height
            piece.vel.y *= -0.6
            piece.vel.x *= 0.85
        }
    }
})

import { registerPlugin } from "../../js/main.ts"
import type { PluginInfo } from "../../js/types.ts"

const info: PluginInfo = {
    name: "Synth",
    version: "1.0",
    author: "joaquinlarroca",
    description: "Procedural sound effects with the Web Audio API",
    path: "synth",
    config: {},
}
registerPlugin(info)

/** Lazily-created Web Audio context, resumed on first use (autoplay policy). */
let audioContext: AudioContext | null = null

function context(): AudioContext {
    if (!audioContext) {
        audioContext = new AudioContext()
    }
    if (audioContext.state === "suspended") {
        void audioContext.resume()
    }
    return audioContext
}

/** Plays a single oscillator tone that fades out exponentially. */
export function tone(
    frequency: number,
    duration = 0.15,
    type: OscillatorType = "sine",
    volume = 0.2,
): void {
    const ctx = context()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.start()
    oscillator.stop(ctx.currentTime + duration)
}

/** A rising collectible "coin" blip; bump `step` to climb a scale. */
export function coinTone(step = 0): void {
    const pitch = Math.pow(2, step / 12)
    tone(880 * pitch, 0.06, "square", 0.1)
    tone(1320 * pitch, 0.12, "square", 0.1)
}

/** A low rumble for big explosions. */
export function boomTone(): void {
    tone(120, 0.4, "sine", 0.35)
    tone(60, 0.5, "triangle", 0.25)
}

/** A short laser-ish "pew". */
export function shootTone(): void {
    tone(880, 0.08, "sawtooth", 0.1)
}

/** A subtle UI click. */
export function clickTone(): void {
    tone(320, 0.05, "triangle", 0.08)
}

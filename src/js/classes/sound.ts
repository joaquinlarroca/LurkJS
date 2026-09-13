import { engineState } from "../main.ts"

/** A single persistent audio player. */
export class sound {
    audio: HTMLAudioElement
    canplay = false
    ended = false
    currentTime = 0
    toDelete = false

    constructor(audioSrc: string, playbackRate?: number, volume?: number, loop?: boolean) {
        engineState.soundPlayers.push(this)
        this.audio = new Audio(audioSrc)
        this.audio.loop = loop ?? false
        this.audio.playbackRate = playbackRate ?? 1.0
        this.audio.volume = volume ?? 1.0

        this.audio.addEventListener("ended", () => {
            this.ended = true
        })
        this.audio.addEventListener("timeupdate", () => {
            this.currentTime = this.audio.currentTime
        })
        this.audio.addEventListener("canplaythrough", () => {
            this.canplay = true
        })
    }

    play(): void {
        if (!this.canplay) {
            return
        }
        this.ended = false
        void this.audio.play().catch(() => {})
    }

    pause(): void {
        this.audio.pause()
    }

    stop(): void {
        if (!this.audio.paused) {
            this.audio.pause()
        }
        this.audio.currentTime = 0
    }

    setCurrentTime(seconds: number): void {
        if (seconds >= 0 && seconds <= this.audio.duration) {
            this.audio.currentTime = seconds
        }
    }

    /** Marks this player for removal from the engine at the next frame boundary. */
    destroy(): void {
        this.toDelete = true
    }
}

/** Audio that clones itself on every play for overlapping sounds. */
export class multiSound {
    playbackRate: number
    volume: number
    audioSrc: string
    audioClones: HTMLAudioElement[] = []
    toDelete = false

    constructor(audioSrc: string, playbackRate?: number, volume?: number) {
        engineState.soundPlayers.push(this)
        this.playbackRate = playbackRate ?? 1.0
        this.volume = volume ?? 1.0
        this.audioSrc = audioSrc
    }

    play(): void {
        const audio = new Audio(this.audioSrc)
        audio.playbackRate = this.playbackRate
        audio.volume = this.volume
        void audio.play().catch(() => {})
        this.audioClones.push(audio)

        audio.addEventListener("ended", () => {
            this.audioClones = this.audioClones.filter((clone) => clone !== audio)
        })
    }

    stopAll(): void {
        for (const clone of this.audioClones) {
            clone.pause()
            clone.currentTime = 0
        }
        this.audioClones = []
    }

    /** Marks this player for removal from the engine at the next frame boundary. */
    destroy(): void {
        this.toDelete = true
    }
}

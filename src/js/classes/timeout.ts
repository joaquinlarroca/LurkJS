/** A timed self-resetting boolean. */
export class timeout {
    time: number
    active = false
    currentTime = 0
    timeLeft = 0
    timeElapsed = 0
    updateTime = 75

    constructor(time = 1000) {
        this.time = time
    }

    start(): void {
        if (this.active) {
            return
        }
        this.active = true
        this.currentTime = performance.now()
        setTimeout(() => {
            this.active = false
            this.currentTime = 0
            this.timeElapsed = 0
            this.timeLeft = 0
        }, this.time)
        const updateTimeout = () => {
            if (this.active) {
                this.timeElapsed = performance.now() - this.currentTime
                this.timeLeft = Math.max(0, this.time - this.timeElapsed)
                setTimeout(updateTimeout, this.updateTime)
            }
        }
        updateTimeout()
    }
}

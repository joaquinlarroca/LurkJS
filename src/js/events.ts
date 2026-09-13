/** Event names the engine dispatches on `window` during its lifecycle. */
export type EngineEventName = "update" | "fixedUpdate" | "afterUpdate" | "started" | "newPlugin"

/** Emits an engine event on `window`. */
export function emit(event: EngineEventName): void {
    window.dispatchEvent(new Event(event))
}

/** Subscribes a callback to an engine event. */
export function on(event: EngineEventName, callback: () => void): void {
    window.addEventListener(event, callback)
}

/** Unsubscribes a callback from an engine event. */
export function off(event: EngineEventName, callback: () => void): void {
    window.removeEventListener(event, callback)
}

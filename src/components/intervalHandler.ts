
type Direction = "forwards" | "backwards"
type IntervalStops = "start" | "end"

interface PlaybackController<N extends number> {
    step(direction: Direction): boolean
    displayFullPlayback(direction: Direction): void
}

/**
 * A class for stepping along a Playback at a set speed.
 * Will callback when it has reached the end and stop its own interval.
 * Makes sure that a maximum of 1 interval is currently active.
 */
class IntervalHandler<N extends number> {
    #playbackController: PlaybackController<N>;
    #callbackFn: (intervalStop: IntervalStops) => void;
    #intervalStopper: ( () => void )| null = null;
    constructor(playbackController: PlaybackController<N>, callbackFn: (intervalStop: IntervalStops) => void) {
        this.#playbackController = playbackController
        this.#callbackFn = callbackFn
    }
    #intervalGenerator(direction: Direction, intervalTime: number) {
        const intervalFunc = () => {
            let playbackResult: boolean
            try {
                playbackResult = this.#playbackController.step(direction);
            } catch (e) {
                clearInterval(intervalId)
                this.#intervalStopper = null;
                return;
            }

            if(playbackResult === false) {
                clearInterval(intervalId)
                this.#intervalStopper = null;
                if(direction === "forwards") {
                    this.#callbackFn("end")
                } else {
                    this.#callbackFn("start")
                }
            }
        }
        const intervalId = setInterval(intervalFunc.bind(this), intervalTime)
        return(() => {clearInterval(intervalId)})
    }
    newInterval(direction: Direction, intervalTime: number) {
        if(this.#intervalStopper) {this.#intervalStopper()}
        this.#intervalStopper = this.#intervalGenerator(direction, intervalTime)
    }
    stopinterval() {
        if(this.#intervalStopper) {this.#intervalStopper()}
        this.#intervalStopper = null;
    }
    displayFullPlayback(direction: Direction) {
        if(this.#intervalStopper) {this.#intervalStopper()}
        this.#playbackController.displayFullPlayback(direction)
    }
}

export {IntervalHandler}
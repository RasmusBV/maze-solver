var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _IntervalHandler_instances, _IntervalHandler_playbackController, _IntervalHandler_callbackFn, _IntervalHandler_intervalStopper, _IntervalHandler_intervalGenerator;
/**
 * A class for stepping along a Playback at a set speed.
 * Will callback when it has reached the end and stop its own interval.
 * Makes sure that a maximum of 1 interval is currently active.
 */
class IntervalHandler {
    constructor(playbackController, callbackFn) {
        _IntervalHandler_instances.add(this);
        _IntervalHandler_playbackController.set(this, void 0);
        _IntervalHandler_callbackFn.set(this, void 0);
        _IntervalHandler_intervalStopper.set(this, null);
        __classPrivateFieldSet(this, _IntervalHandler_playbackController, playbackController, "f");
        __classPrivateFieldSet(this, _IntervalHandler_callbackFn, callbackFn, "f");
    }
    newInterval(direction, intervalTime) {
        if (__classPrivateFieldGet(this, _IntervalHandler_intervalStopper, "f")) {
            __classPrivateFieldGet(this, _IntervalHandler_intervalStopper, "f").call(this);
        }
        __classPrivateFieldSet(this, _IntervalHandler_intervalStopper, __classPrivateFieldGet(this, _IntervalHandler_instances, "m", _IntervalHandler_intervalGenerator).call(this, direction, intervalTime), "f");
    }
    stopinterval() {
        if (__classPrivateFieldGet(this, _IntervalHandler_intervalStopper, "f")) {
            __classPrivateFieldGet(this, _IntervalHandler_intervalStopper, "f").call(this);
        }
        __classPrivateFieldSet(this, _IntervalHandler_intervalStopper, null, "f");
    }
    displayFullPlayback(direction) {
        if (__classPrivateFieldGet(this, _IntervalHandler_intervalStopper, "f")) {
            __classPrivateFieldGet(this, _IntervalHandler_intervalStopper, "f").call(this);
        }
        __classPrivateFieldGet(this, _IntervalHandler_playbackController, "f").displayFullPlayback(direction);
    }
}
_IntervalHandler_playbackController = new WeakMap(), _IntervalHandler_callbackFn = new WeakMap(), _IntervalHandler_intervalStopper = new WeakMap(), _IntervalHandler_instances = new WeakSet(), _IntervalHandler_intervalGenerator = function _IntervalHandler_intervalGenerator(direction, intervalTime) {
    const intervalFunc = () => {
        let playbackResult;
        try {
            playbackResult = __classPrivateFieldGet(this, _IntervalHandler_playbackController, "f").step(direction);
        }
        catch (e) {
            clearInterval(intervalId);
            __classPrivateFieldSet(this, _IntervalHandler_intervalStopper, null, "f");
            return;
        }
        if (playbackResult === false) {
            clearInterval(intervalId);
            __classPrivateFieldSet(this, _IntervalHandler_intervalStopper, null, "f");
            if (direction === "forwards") {
                __classPrivateFieldGet(this, _IntervalHandler_callbackFn, "f").call(this, "end");
            }
            else {
                __classPrivateFieldGet(this, _IntervalHandler_callbackFn, "f").call(this, "start");
            }
        }
    };
    const intervalId = setInterval(intervalFunc.bind(this), intervalTime);
    return (() => { clearInterval(intervalId); });
};
export { IntervalHandler };

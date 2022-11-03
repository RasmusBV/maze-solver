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
var _QueueSystem_selectorType, _QueueSystem_nextCallback, _WeightedQueue_queue, _WeightedQueue_weightArray, _WeightedQueue_nextCallback;
/**
 * A utility Class that is a Queue which can act as both a
 * FIFO and FILO queue aswell as
 * return a random item from the queue
 */
class QueueSystem {
    constructor(selectorType, nextCallback) {
        _QueueSystem_selectorType.set(this, void 0);
        _QueueSystem_nextCallback.set(this, void 0);
        this.queue = [];
        __classPrivateFieldSet(this, _QueueSystem_selectorType, selectorType, "f");
        __classPrivateFieldSet(this, _QueueSystem_nextCallback, nextCallback ? nextCallback : () => { }, "f");
    }
    /**
     * Adds a vertex to the queue
     * @param vertex The vertex to add to the queue
     */
    add(queueItem) {
        this.queue.push(queueItem);
    }
    /**
     * Retrieves the next vertex from the queue, and
     * triggers the nextCallBack
     * @returns The next vertex from the queue
     */
    next() {
        if (!(this.queue.length)) {
            throw new ReferenceError(`Queue is empty`);
        }
        let nextQueueItem;
        switch (__classPrivateFieldGet(this, _QueueSystem_selectorType, "f")) {
            case "shift":
                nextQueueItem = this.queue.shift();
                break;
            case "pop":
                nextQueueItem = this.queue.pop();
                break;
            case "random":
                nextQueueItem = this.queue.splice(Math.floor(Math.random() * this.queue.length), 1)[0];
                break;
        }
        __classPrivateFieldGet(this, _QueueSystem_nextCallback, "f").call(this, nextQueueItem);
        return (nextQueueItem);
    }
}
_QueueSystem_selectorType = new WeakMap(), _QueueSystem_nextCallback = new WeakMap();
class WeightedQueue {
    constructor(nextCallback) {
        _WeightedQueue_queue.set(this, void 0);
        _WeightedQueue_weightArray.set(this, []);
        _WeightedQueue_nextCallback.set(this, void 0);
        __classPrivateFieldSet(this, _WeightedQueue_queue, [], "f");
        __classPrivateFieldSet(this, _WeightedQueue_nextCallback, nextCallback ? nextCallback : () => { }, "f");
    }
    add(item, weight) {
        for (let i = 0; i < __classPrivateFieldGet(this, _WeightedQueue_weightArray, "f").length; i++) {
            if (__classPrivateFieldGet(this, _WeightedQueue_weightArray, "f")[i] > weight) {
                __classPrivateFieldGet(this, _WeightedQueue_weightArray, "f").splice(i, 0, weight);
                __classPrivateFieldGet(this, _WeightedQueue_queue, "f").splice(i, 0, item);
                return;
            }
        }
        __classPrivateFieldGet(this, _WeightedQueue_weightArray, "f").push(weight);
        __classPrivateFieldGet(this, _WeightedQueue_queue, "f").push(item);
    }
    next() {
        if (!(__classPrivateFieldGet(this, _WeightedQueue_queue, "f").length)) {
            throw new ReferenceError(`Queue is empty`);
        }
        __classPrivateFieldGet(this, _WeightedQueue_weightArray, "f").shift();
        const returnItem = __classPrivateFieldGet(this, _WeightedQueue_queue, "f").shift();
        __classPrivateFieldGet(this, _WeightedQueue_nextCallback, "f").call(this, returnItem);
        return returnItem;
    }
    hasNext() {
        if (__classPrivateFieldGet(this, _WeightedQueue_queue, "f").length) {
            return true;
        }
        else {
            return false;
        }
    }
}
_WeightedQueue_queue = new WeakMap(), _WeightedQueue_weightArray = new WeakMap(), _WeightedQueue_nextCallback = new WeakMap();
export { QueueSystem, WeightedQueue };

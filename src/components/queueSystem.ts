
type SelectorType = "shift" | "pop" | "random"
type WeightSelector = "high" | "low"

interface Queue<T> {
    add(item:T, ...args: any[]): void
    next(): T
}

/**
 * A utility Class that is a Queue which can act as both a
 * FIFO and FILO queue aswell as
 * return a random item from the queue
 */
class QueueSystem<T> implements Queue<T>{
    queue: T[];
    #selectorType: SelectorType
    #nextCallback: (queueItem: T) => void;
    constructor(selectorType: SelectorType, nextCallback?: (queueItem: T) => void) {
        this.queue = [];
        this.#selectorType = selectorType
        this.#nextCallback = nextCallback ? nextCallback : () => {}
    }
    /**
     * Adds a vertex to the queue
     * @param vertex The vertex to add to the queue
     */
    add(queueItem: T) {
        this.queue.push(queueItem);
    }

    /**
     * Retrieves the next vertex from the queue, and
     * triggers the nextCallBack
     * @returns The next vertex from the queue
     */
    next() {
        if(!(this.queue.length)) {throw new ReferenceError(`Queue is empty`)}
        let nextQueueItem: T;
        switch(this.#selectorType) {
            case "shift":
                nextQueueItem = this.queue.shift()!;
                break;
            case "pop":
                nextQueueItem = this.queue.pop()!;
                break;
            case "random":
                nextQueueItem = this.queue.splice(Math.floor(Math.random()*this.queue.length),1)[0];
                break;
        }
        this.#nextCallback(nextQueueItem);
        return(nextQueueItem)
    }
}


class WeightedQueue<T> implements Queue<T>{
    #queue: T[];
    #weightArray: number[] = [];
    #nextCallback: (queueItem: T) => void;
    constructor(nextCallback?: (queueItem: T) => void) {
        this.#queue = [];
        this.#nextCallback = nextCallback ? nextCallback : () => {}
    }
    add(item: T, weight: number) {
        for(let i = 0; i < this.#weightArray.length; i++) {
            if(this.#weightArray[i] > weight) {
                this.#weightArray.splice(i, 0, weight)
                this.#queue.splice(i, 0, item)
                return;
            }
        }
        this.#weightArray.push(weight)
        this.#queue.push(item)
    }
    next(): T {
        if(!(this.#queue.length)) {throw new ReferenceError(`Queue is empty`)}
        this.#weightArray.shift()!
        const returnItem = this.#queue.shift()!
        this.#nextCallback(returnItem)
        return returnItem
    }
    hasNext(): boolean {
        if(this.#queue.length) {
            return true
        } else {
            return false
        }
    }
}


export {QueueSystem, SelectorType, Queue, WeightSelector, WeightedQueue}
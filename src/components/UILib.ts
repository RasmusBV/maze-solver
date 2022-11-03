
//Standardized UI Elements

class Dropdown<T extends string> {
    dropdownButton: Button;
    #dropdownWrapper: HTMLElement;
    constructor(callbackFn: (dropdownItem: T) => void, dropdownWrapperId: string, dropdownOptions: T[]) {
        const dropdownWrapper = document.getElementById(dropdownWrapperId)
        if(!dropdownWrapper) {throw new Error(`No DOM element with the id: ${dropdownWrapperId}`)}
        this.#dropdownWrapper = dropdownWrapper
        const dropdownMenuWrapper = dropdownWrapper.getElementsByClassName("dropdown-menu-wrapper")[0]
        const dropdownButtonElement = dropdownWrapper.getElementsByClassName("half-screen-button")[0];
        const randomId = Date.now().toString(36) + Math.random().toString(36).substring(2);
        dropdownButtonElement.id = randomId
        this.dropdownButton = new Button(randomId);
        this.dropdownButton.setEventListener((() => {
            if (dropdownWrapper.getAttribute("expanded") === "false") {
                dropdownWrapper.setAttribute("expanded", "true");
            } else {
                dropdownWrapper.setAttribute("expanded", "false");
            }
        }).bind(this))

        for(const dropdownItem of dropdownOptions) {
            const node = document.createElement("button");
            const textNode = document.createTextNode(dropdownItem);
            node.appendChild(textNode);
            dropdownMenuWrapper.appendChild(node);
            node.addEventListener("click", () => {
                this.dropdownButton.interactiveElement.innerHTML = node.innerHTML;
                this.dropdownButton.interactiveElement.dispatchEvent(new Event("click"));
            })
            node.addEventListener("click", () => {callbackFn(dropdownItem)})
        }
    }
    collapse() {
        this.#dropdownWrapper.setAttribute("expanded", "false");
    }
    expand() {
        this.#dropdownWrapper.setAttribute("expanded", "true");
    }
}
class InteractiveElement<T extends keyof HTMLElementEventMap>{
    interactiveElement: HTMLElement;
    #callbackFunction: ((event: Event) => void) | null = null;
    #greyedOut!: boolean;
    #eventType: T;
    constructor(interactiveElementId: string, eventType: T, greyedOut: boolean = false) {
        const interactiveElement = document.getElementById(interactiveElementId)
        if(!interactiveElement) {throw new Error(`Trying to initialize element, but no DOM element with the id: ${interactiveElementId}`)}
        this.interactiveElement = interactiveElement;
        this.#eventType = eventType
        this.greyOut(greyedOut)
    }
    setEventListener(callbackFn: (event: Event) => void) {
        if(this.#callbackFunction) {
            this.removeEventListener();
        }
        this.#callbackFunction = ((event: Event) => {
            if(!this.#greyedOut) {
                callbackFn(event)
            }
        }).bind(this)
        this.interactiveElement.addEventListener(this.#eventType, this.#callbackFunction!)
    }
    removeEventListener() {
        if(this.#callbackFunction) {
            this.interactiveElement.removeEventListener(this.#eventType, this.#callbackFunction)
            this.#callbackFunction = null
        }
    }
    greyOut(value: boolean) {
        if(value === this.#greyedOut) {return;}
        this.interactiveElement.setAttribute('toggled', value ? "true" : "false");
        if(this.#callbackFunction === null) {return;}
        if(value === true) {
            this.#greyedOut = true
        } else {
            this.#greyedOut = false
        }
    }
}

class TextInput{
    currentValue: string = "";
    interactiveElement: HTMLInputElement;
    callbackFn: ((value: string) => void) | null = null
    constructor(inputId: string, inputCheckerFn: (value: string) => boolean) {
        const interactiveElement = document.getElementById(inputId);
        if(!interactiveElement) {throw new Error(`Trying to initialize element, but no DOM element with the id: ${inputId}`)}
        this.#assertInputElement(interactiveElement)
        this.interactiveElement = interactiveElement
        this.currentValue = this.interactiveElement.value
        this.interactiveElement.addEventListener('input', (e) => {
            const target: any = e.target
            if(!target.value) {
                target.value = 1
            } else if(inputCheckerFn(target.value)) {
                this.textValue = target.value
            } else {
                target.value = this.currentValue
            }
        })
    }
    #assertInputElement(interactiveElement: HTMLElement): asserts interactiveElement is HTMLInputElement {
        if(interactiveElement.tagName !== "INPUT") {throw new Error(`Tried to initialize SliderElement but sliderId: ${interactiveElement.id} does not correspond to an HTMLInputElement`)}
    }
    set textValue(newValue: string) {
        this.currentValue = newValue;
        this.interactiveElement.value = newValue
        if(this.callbackFn) {this.callbackFn(newValue)}
    }
}

class Button extends InteractiveElement<"click"> {
    constructor(buttonId: string, greyedOut: boolean = false) {
        super(buttonId, "click", greyedOut)
    }
}
class ToggleButton<T> extends Button {
    #stateChangeCallback: (state: T, buttonElement: HTMLElement) => void
    #currentState: T | null = null
    #initialState: T;
    constructor(buttonId: string, stateChangeCallback: (state: T, buttonElement: HTMLElement) => void, initialState: T, greyedOut: boolean = false) {
        super(buttonId, greyedOut)
        this.#initialState = initialState
        this.#stateChangeCallback = stateChangeCallback
        this.setDisplayState(initialState)
    }
    setDisplayState(value: T): void {
        if(!this.#stateChangeCallback) {throw new Error(`No stateChangeCallback attached to ToggleButton!`)}
        this.#stateChangeCallback(value, this.interactiveElement)
        this.#currentState = value
    }
    getDisplayState(): T {
        if(!this.#currentState) {throw new Error(`Tried to access state of ToggleButton before a stateChangeCallback was attached`)}
        return(this.#currentState)
    }
    reset() {
        this.setDisplayState(this.#initialState)
        this.removeEventListener()
    }
}
class SliderElement extends InteractiveElement<"input"> {
    #defaultValue: number;
    constructor(sliderId: string, greyedOut: boolean = false) {
        super(sliderId, "input", greyedOut)
        this.#assertSliderElement(this.interactiveElement)
        this.#defaultValue = parseInt(this.interactiveElement.value)
    }
    #assertSliderElement(interactiveElement: HTMLElement): asserts interactiveElement is HTMLInputElement {
        if(this.interactiveElement.tagName !== "INPUT") {throw new Error(`Tried to initialize SliderElement but sliderId: ${interactiveElement.id} does not correspond to an HTMLInputElement`)}
    }
    reset() {
        this.#assertSliderElement(this.interactiveElement)
        this.interactiveElement.value = this.#defaultValue.toString()
        this.removeEventListener()
    }
    getValue() {
        this.#assertSliderElement(this.interactiveElement)
        return(parseInt(this.interactiveElement.value))
    }
}


export {Dropdown, InteractiveElement, Button, ToggleButton, SliderElement, TextInput}
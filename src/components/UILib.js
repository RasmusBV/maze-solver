//Standardized UI Elements
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
var _Dropdown_dropdownWrapper, _InteractiveElement_callbackFunction, _InteractiveElement_greyedOut, _InteractiveElement_eventType, _TextInput_instances, _TextInput_assertInputElement, _ToggleButton_stateChangeCallback, _ToggleButton_currentState, _ToggleButton_initialState, _SliderElement_instances, _SliderElement_defaultValue, _SliderElement_assertSliderElement;
class Dropdown {
    constructor(callbackFn, dropdownWrapperId, dropdownOptions) {
        _Dropdown_dropdownWrapper.set(this, void 0);
        const dropdownWrapper = document.getElementById(dropdownWrapperId);
        if (!dropdownWrapper) {
            throw new Error(`No DOM element with the id: ${dropdownWrapperId}`);
        }
        __classPrivateFieldSet(this, _Dropdown_dropdownWrapper, dropdownWrapper, "f");
        const dropdownMenuWrapper = dropdownWrapper.getElementsByClassName("dropdown-menu-wrapper")[0];
        const dropdownButtonElement = dropdownWrapper.getElementsByClassName("half-screen-button")[0];
        const randomId = Date.now().toString(36) + Math.random().toString(36).substring(2);
        dropdownButtonElement.id = randomId;
        this.dropdownButton = new Button(randomId);
        this.dropdownButton.setEventListener((() => {
            if (dropdownWrapper.getAttribute("expanded") === "false") {
                dropdownWrapper.setAttribute("expanded", "true");
            }
            else {
                dropdownWrapper.setAttribute("expanded", "false");
            }
        }).bind(this));
        for (const dropdownItem of dropdownOptions) {
            const node = document.createElement("button");
            const textNode = document.createTextNode(dropdownItem);
            node.appendChild(textNode);
            dropdownMenuWrapper.appendChild(node);
            node.addEventListener("click", () => {
                this.dropdownButton.interactiveElement.innerHTML = node.innerHTML;
                this.dropdownButton.interactiveElement.dispatchEvent(new Event("click"));
            });
            node.addEventListener("click", () => { callbackFn(dropdownItem); });
        }
    }
    collapse() {
        __classPrivateFieldGet(this, _Dropdown_dropdownWrapper, "f").setAttribute("expanded", "false");
    }
    expand() {
        __classPrivateFieldGet(this, _Dropdown_dropdownWrapper, "f").setAttribute("expanded", "true");
    }
}
_Dropdown_dropdownWrapper = new WeakMap();
class InteractiveElement {
    constructor(interactiveElementId, eventType, greyedOut = false) {
        _InteractiveElement_callbackFunction.set(this, null);
        _InteractiveElement_greyedOut.set(this, void 0);
        _InteractiveElement_eventType.set(this, void 0);
        const interactiveElement = document.getElementById(interactiveElementId);
        if (!interactiveElement) {
            throw new Error(`Trying to initialize element, but no DOM element with the id: ${interactiveElementId}`);
        }
        this.interactiveElement = interactiveElement;
        __classPrivateFieldSet(this, _InteractiveElement_eventType, eventType, "f");
        this.greyOut(greyedOut);
    }
    setEventListener(callbackFn) {
        if (__classPrivateFieldGet(this, _InteractiveElement_callbackFunction, "f")) {
            this.removeEventListener();
        }
        __classPrivateFieldSet(this, _InteractiveElement_callbackFunction, ((event) => {
            if (!__classPrivateFieldGet(this, _InteractiveElement_greyedOut, "f")) {
                callbackFn(event);
            }
        }).bind(this), "f");
        this.interactiveElement.addEventListener(__classPrivateFieldGet(this, _InteractiveElement_eventType, "f"), __classPrivateFieldGet(this, _InteractiveElement_callbackFunction, "f"));
    }
    removeEventListener() {
        if (__classPrivateFieldGet(this, _InteractiveElement_callbackFunction, "f")) {
            this.interactiveElement.removeEventListener(__classPrivateFieldGet(this, _InteractiveElement_eventType, "f"), __classPrivateFieldGet(this, _InteractiveElement_callbackFunction, "f"));
            __classPrivateFieldSet(this, _InteractiveElement_callbackFunction, null, "f");
        }
    }
    greyOut(value) {
        if (value === __classPrivateFieldGet(this, _InteractiveElement_greyedOut, "f")) {
            return;
        }
        this.interactiveElement.setAttribute('toggled', value ? "true" : "false");
        if (__classPrivateFieldGet(this, _InteractiveElement_callbackFunction, "f") === null) {
            return;
        }
        if (value === true) {
            __classPrivateFieldSet(this, _InteractiveElement_greyedOut, true, "f");
        }
        else {
            __classPrivateFieldSet(this, _InteractiveElement_greyedOut, false, "f");
        }
    }
}
_InteractiveElement_callbackFunction = new WeakMap(), _InteractiveElement_greyedOut = new WeakMap(), _InteractiveElement_eventType = new WeakMap();
class TextInput {
    constructor(inputId, inputCheckerFn) {
        _TextInput_instances.add(this);
        this.currentValue = "";
        this.callbackFn = null;
        const interactiveElement = document.getElementById(inputId);
        if (!interactiveElement) {
            throw new Error(`Trying to initialize element, but no DOM element with the id: ${inputId}`);
        }
        __classPrivateFieldGet(this, _TextInput_instances, "m", _TextInput_assertInputElement).call(this, interactiveElement);
        this.interactiveElement = interactiveElement;
        this.currentValue = this.interactiveElement.value;
        this.interactiveElement.addEventListener('input', (e) => {
            const target = e.target;
            if (!target.value) {
                target.value = 1;
            }
            else if (inputCheckerFn(target.value)) {
                this.textValue = target.value;
            }
            else {
                target.value = this.currentValue;
            }
        });
    }
    set textValue(newValue) {
        this.currentValue = newValue;
        this.interactiveElement.value = newValue;
        if (this.callbackFn) {
            this.callbackFn(newValue);
        }
    }
}
_TextInput_instances = new WeakSet(), _TextInput_assertInputElement = function _TextInput_assertInputElement(interactiveElement) {
    if (interactiveElement.tagName !== "INPUT") {
        throw new Error(`Tried to initialize SliderElement but sliderId: ${interactiveElement.id} does not correspond to an HTMLInputElement`);
    }
};
class Button extends InteractiveElement {
    constructor(buttonId, greyedOut = false) {
        super(buttonId, "click", greyedOut);
    }
}
class ToggleButton extends Button {
    constructor(buttonId, stateChangeCallback, initialState, greyedOut = false) {
        super(buttonId, greyedOut);
        _ToggleButton_stateChangeCallback.set(this, void 0);
        _ToggleButton_currentState.set(this, null);
        _ToggleButton_initialState.set(this, void 0);
        __classPrivateFieldSet(this, _ToggleButton_initialState, initialState, "f");
        __classPrivateFieldSet(this, _ToggleButton_stateChangeCallback, stateChangeCallback, "f");
        this.setDisplayState(initialState);
    }
    setDisplayState(value) {
        if (!__classPrivateFieldGet(this, _ToggleButton_stateChangeCallback, "f")) {
            throw new Error(`No stateChangeCallback attached to ToggleButton!`);
        }
        __classPrivateFieldGet(this, _ToggleButton_stateChangeCallback, "f").call(this, value, this.interactiveElement);
        __classPrivateFieldSet(this, _ToggleButton_currentState, value, "f");
    }
    getDisplayState() {
        if (!__classPrivateFieldGet(this, _ToggleButton_currentState, "f")) {
            throw new Error(`Tried to access state of ToggleButton before a stateChangeCallback was attached`);
        }
        return (__classPrivateFieldGet(this, _ToggleButton_currentState, "f"));
    }
    reset() {
        this.setDisplayState(__classPrivateFieldGet(this, _ToggleButton_initialState, "f"));
        this.removeEventListener();
    }
}
_ToggleButton_stateChangeCallback = new WeakMap(), _ToggleButton_currentState = new WeakMap(), _ToggleButton_initialState = new WeakMap();
class SliderElement extends InteractiveElement {
    constructor(sliderId, greyedOut = false) {
        super(sliderId, "input", greyedOut);
        _SliderElement_instances.add(this);
        _SliderElement_defaultValue.set(this, void 0);
        __classPrivateFieldGet(this, _SliderElement_instances, "m", _SliderElement_assertSliderElement).call(this, this.interactiveElement);
        __classPrivateFieldSet(this, _SliderElement_defaultValue, parseInt(this.interactiveElement.value), "f");
    }
    reset() {
        __classPrivateFieldGet(this, _SliderElement_instances, "m", _SliderElement_assertSliderElement).call(this, this.interactiveElement);
        this.interactiveElement.value = __classPrivateFieldGet(this, _SliderElement_defaultValue, "f").toString();
        this.removeEventListener();
    }
    getValue() {
        __classPrivateFieldGet(this, _SliderElement_instances, "m", _SliderElement_assertSliderElement).call(this, this.interactiveElement);
        return (parseInt(this.interactiveElement.value));
    }
}
_SliderElement_defaultValue = new WeakMap(), _SliderElement_instances = new WeakSet(), _SliderElement_assertSliderElement = function _SliderElement_assertSliderElement(interactiveElement) {
    if (this.interactiveElement.tagName !== "INPUT") {
        throw new Error(`Tried to initialize SliderElement but sliderId: ${interactiveElement.id} does not correspond to an HTMLInputElement`);
    }
};
export { Dropdown, InteractiveElement, Button, ToggleButton, SliderElement, TextInput };

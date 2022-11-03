"use strict";
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
var _InteractiveElement_callbackFunctions, _InteractiveElement_greyedOut, _InteractiveElement_eventType, _ToggleButton_stateChangeCallback, _ToggleButton_currentState, _SliderElement_instances, _SliderElement_defaultValue, _SliderElement_assertSliderElement;
class Dropdown {
    constructor(callbackFn, dropdownWrapperId, dropdownOptions) {
        const dropdownWrapper = document.getElementById(dropdownWrapperId);
        if (!dropdownWrapper) {
            throw new Error(`No DOM element with the id: ${dropdownWrapperId}`);
        }
        const dropdownMenuWrapper = dropdownWrapper.getElementsByClassName("dropdown-menu-wrapper")[0];
        const dropdownButton = dropdownWrapper.getElementsByClassName("half-screen-button")[0];
        dropdownButton.addEventListener("click", () => {
            if (dropdownWrapper.getAttribute("expanded") === "false") {
                dropdownWrapper.setAttribute("expanded", "true");
            }
            else {
                dropdownWrapper.setAttribute("expanded", "false");
            }
        });
        for (const dropdownItem of dropdownOptions) {
            const node = document.createElement("button");
            const textNode = document.createTextNode(dropdownItem);
            node.appendChild(textNode);
            dropdownMenuWrapper.appendChild(node);
            node.addEventListener("click", () => {
                dropdownButton.innerHTML = node.innerHTML;
                dropdownButton.dispatchEvent(new Event("click"));
            });
            node.addEventListener("click", () => { callbackFn(dropdownItem); });
        }
    }
}
class InteractiveElement {
    constructor(interactiveElementId, eventType, greyedOut = false) {
        _InteractiveElement_callbackFunctions.set(this, void 0);
        _InteractiveElement_greyedOut.set(this, void 0);
        _InteractiveElement_eventType.set(this, void 0);
        const interactiveElement = document.getElementById(interactiveElementId);
        if (!interactiveElement) {
            throw new Error(`Trying to initialize element, but no DOM element with the id: ${interactiveElementId}`);
        }
        this.interactiveElement = interactiveElement;
        __classPrivateFieldSet(this, _InteractiveElement_callbackFunctions, [], "f");
        __classPrivateFieldSet(this, _InteractiveElement_greyedOut, false, "f");
        __classPrivateFieldSet(this, _InteractiveElement_eventType, eventType, "f");
        this.greyOut(greyedOut);
    }
    addNewEventListner(callbackFn) {
        __classPrivateFieldGet(this, _InteractiveElement_callbackFunctions, "f").push(callbackFn);
        if (__classPrivateFieldGet(this, _InteractiveElement_greyedOut, "f") === true) {
            return;
        }
        this.interactiveElement.addEventListener(__classPrivateFieldGet(this, _InteractiveElement_eventType, "f"), __classPrivateFieldGet(this, _InteractiveElement_callbackFunctions, "f")[__classPrivateFieldGet(this, _InteractiveElement_callbackFunctions, "f").length - 1]);
    }
    greyOut(value) {
        if (value === __classPrivateFieldGet(this, _InteractiveElement_greyedOut, "f")) {
            return;
        }
        this.interactiveElement.setAttribute('toggled', value ? "true" : "false");
        if (__classPrivateFieldGet(this, _InteractiveElement_callbackFunctions, "f") === null) {
            return;
        }
        if (value === true) {
            __classPrivateFieldGet(this, _InteractiveElement_callbackFunctions, "f").forEach((callbackFn) => { this.interactiveElement.removeEventListener(__classPrivateFieldGet(this, _InteractiveElement_eventType, "f"), callbackFn); });
            __classPrivateFieldSet(this, _InteractiveElement_greyedOut, true, "f");
        }
        else {
            __classPrivateFieldGet(this, _InteractiveElement_callbackFunctions, "f").forEach((callbackFn) => { this.interactiveElement.addEventListener(__classPrivateFieldGet(this, _InteractiveElement_eventType, "f"), callbackFn); });
            __classPrivateFieldSet(this, _InteractiveElement_greyedOut, false, "f");
        }
    }
}
_InteractiveElement_callbackFunctions = new WeakMap(), _InteractiveElement_greyedOut = new WeakMap(), _InteractiveElement_eventType = new WeakMap();
class Button extends InteractiveElement {
    constructor(buttonId, greyedOut = false) {
        super(buttonId, "click", greyedOut);
    }
}
class ToggleButton extends Button {
    constructor(buttonId, greyedOut = false) {
        super(buttonId, greyedOut);
        _ToggleButton_stateChangeCallback.set(this, null);
        _ToggleButton_currentState.set(this, null);
    }
    setStateChangeCallback(stateChangeCallback, initialState) {
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
}
_ToggleButton_stateChangeCallback = new WeakMap(), _ToggleButton_currentState = new WeakMap();
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

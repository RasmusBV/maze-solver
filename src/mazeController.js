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
var _GridDrawingController2D_instances, _GridDrawingController2D_gridTool_private, _GridDrawingController2D_active_private, _GridDrawingController2D_callbackFn, _GridDrawingController2D_buttonInteraction, _GridDrawingController2D_gridToolToggle, _GridDrawingController2D_gridDragHandler, _GridDrawingController2D_gridDrawHandler, _MouseEventAPI_instances, _MouseEventAPI_mazeElement, _MouseEventAPI_constructEventListner, _PlaybackUIHandler_instances, _PlaybackUIHandler_toggleButton, _PlaybackUIHandler_slider, _PlaybackUIHandler_intervalHandler, _PlaybackUIHandler_playbackIntervalTime, _PlaybackUIHandler_playbackDirection, _PlaybackUIHandler_SOLUTION_SPEED_CONSTANT, _PlaybackUIHandler_intervalhandlerCallback, _MazeSolutionController_mazeModel, _MazeSolutionController_currentMazeSolver, _MazeSolutionController_toggleButton, _MazeSolutionController_speedController, _MazeSolutionController_timer, _MazeGenerationController_mazeModel, _MazeGenerationController_currentMazeGenerator, _MazeGenerationController_callbackFn, _MazeController_instances, _MazeController_getMazeElement, _MazeController2D_instances, _MazeController2D_getResizeHandler, _MazeController2D_getGridDimensions;
import { MazeModel2D, MazeModel3D } from "./mazeModel.js";
import { NGrid } from "./components/NGrid.js";
import { IntervalHandler } from "./components/intervalHandler.js";
import { Dropdown, Button, ToggleButton, SliderElement } from "./components/UILib.js";
/**
 * A class for acting on User input on the grid.
 */
class GridDrawingController2D {
    constructor(mazeModel, mazeElement, callbackFn) {
        _GridDrawingController2D_instances.add(this);
        _GridDrawingController2D_gridTool_private.set(this, "none");
        _GridDrawingController2D_active_private.set(this, true);
        _GridDrawingController2D_callbackFn.set(this, void 0);
        this.gridInputAPI = new MouseEventAPI(mazeElement, this.mouseEventHandler.bind(this));
        __classPrivateFieldSet(this, _GridDrawingController2D_callbackFn, callbackFn, "f");
        this.mazeModel = mazeModel;
        __classPrivateFieldGet(this, _GridDrawingController2D_instances, "m", _GridDrawingController2D_buttonInteraction).call(this);
    }
    /**
     * A public method for ignoring user input. Also visually greys out the buttons
     * @param value If userinteraction should be ignored
     */
    greyOut(value) {
        var _a, _b, _c, _d;
        if (value === true) {
            __classPrivateFieldSet(this, _GridDrawingController2D_gridTool_private, "none", "f");
            (_a = document.getElementById('pen')) === null || _a === void 0 ? void 0 : _a.setAttribute("toggled", "true");
            (_b = document.getElementById('erase')) === null || _b === void 0 ? void 0 : _b.setAttribute("toggled", "true");
        }
        else {
            (_c = document.getElementById('pen')) === null || _c === void 0 ? void 0 : _c.setAttribute("toggled", "false");
            (_d = document.getElementById('erase')) === null || _d === void 0 ? void 0 : _d.setAttribute("toggled", "false");
        }
        this.gridInputAPI.ignore = value;
        __classPrivateFieldSet(this, _GridDrawingController2D_active_private, !value, "f");
    }
    /**
     * The eventHandler for the grid. Determines what to do based on the
     * input by the user and the current gridTool.
     * @param currentGridCellId The gridCell currently mousing down on
     * @param lastGridCellId The previous gridCell captured by the eventListner
     */
    mouseEventHandler(currentGridCellId, lastGridCellId) {
        let currentGridCell;
        let lastGridCell;
        const currentGridTool = __classPrivateFieldGet(this, _GridDrawingController2D_gridTool_private, "f");
        //Gets the current cell :)) If there is none it returns
        try {
            currentGridCell = JSON.parse(currentGridCellId);
        }
        catch (_a) {
            return;
        }
        //Checks if there are 2 cells incase there is being dragged
        try {
            lastGridCell = JSON.parse(lastGridCellId);
            if (currentGridTool === "none") {
                __classPrivateFieldGet(this, _GridDrawingController2D_instances, "m", _GridDrawingController2D_gridDragHandler).call(this, lastGridCell, currentGridCell);
                return;
            }
            //If so it  an interpolated result between them incase the drag was too fast
            const interpolatedResult = NGrid.interpolateBetweenVertexes(currentGridCell, lastGridCell);
            interpolatedResult.forEach((gridCell) => { __classPrivateFieldGet(this, _GridDrawingController2D_instances, "m", _GridDrawingController2D_gridDrawHandler).call(this, gridCell, currentGridTool); });
        }
        catch (_b) {
            if (currentGridTool === "none") {
                return;
            }
            //If not it just 
            if (!(Array.isArray(currentGridCell)) && typeof currentGridCell[0] !== "number" && typeof currentGridCell[1] !== "number") {
                return;
            }
            const verifiedGridCell = [currentGridCell[0], currentGridCell[1]];
            __classPrivateFieldGet(this, _GridDrawingController2D_instances, "m", _GridDrawingController2D_gridDrawHandler).call(this, verifiedGridCell, currentGridTool);
        }
    }
}
_GridDrawingController2D_gridTool_private = new WeakMap(), _GridDrawingController2D_active_private = new WeakMap(), _GridDrawingController2D_callbackFn = new WeakMap(), _GridDrawingController2D_instances = new WeakSet(), _GridDrawingController2D_buttonInteraction = function _GridDrawingController2D_buttonInteraction() {
    const idList = ['pen', 'erase'];
    for (const id of idList) {
        const button = document.getElementById(id);
        if (!button) {
            throw new ReferenceError(`No DOM element with the id: ${id}`);
        }
        button.addEventListener('click', () => __classPrivateFieldGet(this, _GridDrawingController2D_instances, "m", _GridDrawingController2D_gridToolToggle).call(this, id));
    }
}, _GridDrawingController2D_gridToolToggle = function _GridDrawingController2D_gridToolToggle(elementId) {
    var _a, _b, _c;
    if (__classPrivateFieldGet(this, _GridDrawingController2D_active_private, "f") === false) {
        return;
    }
    if (__classPrivateFieldGet(this, _GridDrawingController2D_gridTool_private, "f") === elementId) {
        __classPrivateFieldSet(this, _GridDrawingController2D_gridTool_private, "none", "f");
        (_a = document.getElementById(elementId)) === null || _a === void 0 ? void 0 : _a.setAttribute("toggled", "false");
    }
    else {
        __classPrivateFieldSet(this, _GridDrawingController2D_gridTool_private, elementId, "f");
        const otherElement = elementId === "pen" ? "erase" : "pen";
        (_b = document.getElementById(elementId)) === null || _b === void 0 ? void 0 : _b.setAttribute("toggled", "true");
        (_c = document.getElementById(otherElement)) === null || _c === void 0 ? void 0 : _c.setAttribute("toggled", "false");
    }
}, _GridDrawingController2D_gridDragHandler = function _GridDrawingController2D_gridDragHandler(gridCellFrom, gridCellTo) {
    const specialGridCell = this.mazeModel.checkForSpecialGridCell(gridCellFrom);
    if (!specialGridCell) {
        return;
    }
    this.mazeModel.moveSpecialGridCell(gridCellTo, specialGridCell);
    __classPrivateFieldGet(this, _GridDrawingController2D_callbackFn, "f").call(this, "gridDrag");
}, _GridDrawingController2D_gridDrawHandler = function _GridDrawingController2D_gridDrawHandler(gridCell, value) {
    var _a;
    (_a = this.mazeModel) === null || _a === void 0 ? void 0 : _a.changeMazeVertex(gridCell, value === "pen" ? 1 : 0);
    __classPrivateFieldGet(this, _GridDrawingController2D_callbackFn, "f").call(this, "gridDraw");
    return;
};
/**
 * Handles Mouse events when click dragging across a parent element
 * returns the id of the child element currently and previously moused over.
 * Does this every time a new child element is moused over.
 */
class MouseEventAPI {
    constructor(mazeElement, callbackFn) {
        _MouseEventAPI_instances.add(this);
        _MouseEventAPI_mazeElement.set(this, void 0);
        __classPrivateFieldSet(this, _MouseEventAPI_mazeElement, mazeElement, "f");
        __classPrivateFieldGet(this, _MouseEventAPI_instances, "m", _MouseEventAPI_constructEventListner).call(this, callbackFn);
        this.ignore = false;
    }
}
_MouseEventAPI_mazeElement = new WeakMap(), _MouseEventAPI_instances = new WeakSet(), _MouseEventAPI_constructEventListner = function _MouseEventAPI_constructEventListner(callbackFn) {
    const mouseEventHandlerScope = () => {
        let lastTarget = "";
        return ([(event) => {
                const currentTarget = event.target;
                this.ignore ? null : callbackFn(currentTarget.id, lastTarget);
                lastTarget = currentTarget.id;
            }, () => { lastTarget = ""; }]);
    };
    const touchEventHandlerScope = () => {
        let lastTarget = "";
        return ([(event) => {
                const currentTarget = document.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY);
                if (!currentTarget) {
                    return;
                }
                this.ignore ? null : callbackFn(currentTarget.id, lastTarget);
                lastTarget = currentTarget.id;
            }, () => { lastTarget = ""; }]);
    };
    const [mouseEventHandler, mouseEventReset] = mouseEventHandlerScope();
    const [touchEventHandler, touchEventReset] = touchEventHandlerScope();
    __classPrivateFieldGet(this, _MouseEventAPI_mazeElement, "f").addEventListener('mousedown', (event) => {
        mouseEventHandler(event);
        __classPrivateFieldGet(this, _MouseEventAPI_mazeElement, "f").addEventListener('mouseover', mouseEventHandler);
    });
    __classPrivateFieldGet(this, _MouseEventAPI_mazeElement, "f").addEventListener('touchstart', (event) => {
        touchEventHandler(event);
        __classPrivateFieldGet(this, _MouseEventAPI_mazeElement, "f").addEventListener('touchmove', touchEventHandler);
    });
    document.addEventListener('mouseup', (event) => {
        __classPrivateFieldGet(this, _MouseEventAPI_mazeElement, "f").removeEventListener('mouseover', mouseEventHandler);
        mouseEventReset();
    });
    document.addEventListener('touchend', (event) => {
        __classPrivateFieldGet(this, _MouseEventAPI_mazeElement, "f").removeEventListener('touchmove', touchEventHandler);
        touchEventReset();
    });
    document.addEventListener('touchcancel', (event) => {
        __classPrivateFieldGet(this, _MouseEventAPI_mazeElement, "f").removeEventListener('touchmove', touchEventHandler);
        touchEventReset();
    });
};
/**
 * A Class for handling the playback of a a single playback given by the playbackController
 * Will need to be destructed if dereferenced, as to stop any hanging intervals.
 * References a toggleable button for playing and pausing the playback
 * Referneces a speedController for controlling the speed of the playback
 */
class PlaybackUIHandler {
    constructor(playbackController, toggleButton, speedController) {
        _PlaybackUIHandler_instances.add(this);
        _PlaybackUIHandler_toggleButton.set(this, void 0);
        _PlaybackUIHandler_slider.set(this, void 0);
        _PlaybackUIHandler_intervalHandler.set(this, void 0);
        _PlaybackUIHandler_playbackIntervalTime.set(this, 999999999); //Basically infinity i guess ?
        _PlaybackUIHandler_playbackDirection.set(this, "forwards");
        this.currentState = "start";
        _PlaybackUIHandler_SOLUTION_SPEED_CONSTANT.set(this, 50);
        //Adding functionality to the toggleButton
        __classPrivateFieldSet(this, _PlaybackUIHandler_toggleButton, toggleButton, "f");
        __classPrivateFieldGet(this, _PlaybackUIHandler_toggleButton, "f").setEventListener((() => {
            __classPrivateFieldGet(this, _PlaybackUIHandler_toggleButton, "f").getDisplayState() === "paused" ? this.play() : this.pause();
        }).bind(this));
        //Adding functionality to the speedController
        __classPrivateFieldSet(this, _PlaybackUIHandler_slider, speedController, "f");
        __classPrivateFieldGet(this, _PlaybackUIHandler_slider, "f").setEventListener((() => {
            this.changeSpeed(__classPrivateFieldGet(this, _PlaybackUIHandler_slider, "f").getValue());
        }).bind(this));
        __classPrivateFieldSet(this, _PlaybackUIHandler_intervalHandler, new IntervalHandler(playbackController, __classPrivateFieldGet(this, _PlaybackUIHandler_instances, "m", _PlaybackUIHandler_intervalhandlerCallback).bind(this)), "f");
        if (playbackController.displayingSolution) {
            this.currentState = "displaying";
        }
        this.changeSpeed(__classPrivateFieldGet(this, _PlaybackUIHandler_slider, "f").getValue());
    }
    /**
     * Will begin the playback.
     */
    play() {
        __classPrivateFieldGet(this, _PlaybackUIHandler_toggleButton, "f").setDisplayState("playing");
        this.currentState = "playing";
        __classPrivateFieldGet(this, _PlaybackUIHandler_intervalHandler, "f").newInterval(__classPrivateFieldGet(this, _PlaybackUIHandler_playbackDirection, "f"), __classPrivateFieldGet(this, _PlaybackUIHandler_playbackIntervalTime, "f"));
    }
    /**
     * Will stop the playback.
     */
    pause() {
        __classPrivateFieldGet(this, _PlaybackUIHandler_toggleButton, "f").setDisplayState("paused");
        this.currentState = "paused";
        __classPrivateFieldGet(this, _PlaybackUIHandler_intervalHandler, "f").stopinterval();
    }
    /**
     * Important when dereferencing an instance of a PlaybackUIHandler, as there may be an interval
     * ongoing which needs to be stopped. Will destruct the playback on the maze.
     */
    destruct() {
        __classPrivateFieldGet(this, _PlaybackUIHandler_intervalHandler, "f").displayFullPlayback("backwards");
        __classPrivateFieldGet(this, _PlaybackUIHandler_toggleButton, "f").greyOut(true);
        __classPrivateFieldGet(this, _PlaybackUIHandler_toggleButton, "f").reset();
        __classPrivateFieldGet(this, _PlaybackUIHandler_slider, "f").reset();
    }
    /**
     * A function for changing the speed of the playback. If it is ongoing it will continue to be so at the new speed.
     * @param speed the new speed to playback at
     */
    changeSpeed(speed) {
        __classPrivateFieldSet(this, _PlaybackUIHandler_playbackIntervalTime, speed === 0 ? 999999999 : Math.abs(__classPrivateFieldGet(this, _PlaybackUIHandler_SOLUTION_SPEED_CONSTANT, "f") / speed), "f"); //Lidt funky men altså det er bedre end før 💀💀
        __classPrivateFieldSet(this, _PlaybackUIHandler_playbackDirection, speed < 0 ? "backwards" : "forwards", "f");
        if (__classPrivateFieldGet(this, _PlaybackUIHandler_playbackDirection, "f") === "backwards" && this.currentState === "start") {
            __classPrivateFieldGet(this, _PlaybackUIHandler_toggleButton, "f").greyOut(true);
        }
        else if (__classPrivateFieldGet(this, _PlaybackUIHandler_playbackDirection, "f") === "forwards" && this.currentState === "displaying") {
            __classPrivateFieldGet(this, _PlaybackUIHandler_toggleButton, "f").greyOut(true);
        }
        else {
            __classPrivateFieldGet(this, _PlaybackUIHandler_toggleButton, "f").greyOut(false);
        }
        if (this.currentState !== "playing") {
            return;
        }
        __classPrivateFieldGet(this, _PlaybackUIHandler_intervalHandler, "f").newInterval(__classPrivateFieldGet(this, _PlaybackUIHandler_playbackDirection, "f"), __classPrivateFieldGet(this, _PlaybackUIHandler_playbackIntervalTime, "f"));
    }
}
_PlaybackUIHandler_toggleButton = new WeakMap(), _PlaybackUIHandler_slider = new WeakMap(), _PlaybackUIHandler_intervalHandler = new WeakMap(), _PlaybackUIHandler_playbackIntervalTime = new WeakMap(), _PlaybackUIHandler_playbackDirection = new WeakMap(), _PlaybackUIHandler_SOLUTION_SPEED_CONSTANT = new WeakMap(), _PlaybackUIHandler_instances = new WeakSet(), _PlaybackUIHandler_intervalhandlerCallback = function _PlaybackUIHandler_intervalhandlerCallback(intervalStop) {
    if (intervalStop === "end") {
        this.currentState = "displaying";
    }
    else {
        this.currentState = "start";
    }
    __classPrivateFieldGet(this, _PlaybackUIHandler_toggleButton, "f").greyOut(true);
    __classPrivateFieldGet(this, _PlaybackUIHandler_toggleButton, "f").setDisplayState("paused");
};
class MazeSolutionController {
    constructor(toggleButtonId, sliderElementId, dropdownId, mazeModel) {
        //References:
        _MazeSolutionController_mazeModel.set(this, void 0);
        _MazeSolutionController_currentMazeSolver.set(this, null);
        _MazeSolutionController_toggleButton.set(this, void 0);
        _MazeSolutionController_speedController.set(this, void 0);
        this.mazeSolvingUIHandler = null;
        _MazeSolutionController_timer.set(this, null);
        __classPrivateFieldSet(this, _MazeSolutionController_mazeModel, mazeModel, "f");
        __classPrivateFieldSet(this, _MazeSolutionController_toggleButton, new ToggleButton(toggleButtonId, (state, buttonElement) => {
            const symbolElement = buttonElement.getElementsByTagName("span")[0];
            symbolElement.innerHTML = state === "playing" ? "pause" : "play_arrow";
        }, "paused", true), "f");
        this.dropdown = new Dropdown((dropdownItem) => {
            this.solveMaze(dropdownItem);
            __classPrivateFieldSet(this, _MazeSolutionController_currentMazeSolver, dropdownItem, "f");
        }, dropdownId, Object.keys(mazeModel.mazeSolvers));
        __classPrivateFieldSet(this, _MazeSolutionController_speedController, new SliderElement(sliderElementId), "f");
    }
    solveMaze(mazeSolverId) {
        const solutionController = __classPrivateFieldGet(this, _MazeSolutionController_mazeModel, "f").generateSolution(mazeSolverId);
        if (this.mazeSolvingUIHandler) {
            this.mazeSolvingUIHandler.destruct();
        }
        this.mazeSolvingUIHandler = new PlaybackUIHandler(solutionController, __classPrivateFieldGet(this, _MazeSolutionController_toggleButton, "f"), __classPrivateFieldGet(this, _MazeSolutionController_speedController, "f"));
    }
    greyOut(value) {
        this.dropdown.dropdownButton.greyOut(value);
        this.dropdown.collapse();
        if (value === true) {
            if (this.mazeSolvingUIHandler) {
                this.mazeSolvingUIHandler.destruct();
                this.mazeSolvingUIHandler = null;
            }
        }
        else {
            if (__classPrivateFieldGet(this, _MazeSolutionController_currentMazeSolver, "f")) {
                this.solveMaze(__classPrivateFieldGet(this, _MazeSolutionController_currentMazeSolver, "f"));
            }
        }
    }
    gridChange(value) {
        if (!this.mazeSolvingUIHandler) {
            return;
        }
        if (this.mazeSolvingUIHandler.currentState !== "displaying") {
            this.solveMaze(__classPrivateFieldGet(this, _MazeSolutionController_currentMazeSolver, "f"));
            return;
        }
        if (__classPrivateFieldGet(this, _MazeSolutionController_timer, "f")) {
            clearTimeout(__classPrivateFieldGet(this, _MazeSolutionController_timer, "f"));
        }
        __classPrivateFieldSet(this, _MazeSolutionController_timer, setTimeout((() => {
            this.mazeSolvingUIHandler = new PlaybackUIHandler(__classPrivateFieldGet(this, _MazeSolutionController_mazeModel, "f").updateSolution(), __classPrivateFieldGet(this, _MazeSolutionController_toggleButton, "f"), __classPrivateFieldGet(this, _MazeSolutionController_speedController, "f"));
            this.mazeSolvingUIHandler.currentState = "displaying";
            __classPrivateFieldSet(this, _MazeSolutionController_timer, null, "f");
        }).bind(this), 300), "f");
    }
}
_MazeSolutionController_mazeModel = new WeakMap(), _MazeSolutionController_currentMazeSolver = new WeakMap(), _MazeSolutionController_toggleButton = new WeakMap(), _MazeSolutionController_speedController = new WeakMap(), _MazeSolutionController_timer = new WeakMap();
class MazeGenerationController {
    constructor(generateMazeButton, dropdownId, mazeModel, callbackFn) {
        this.speedConstant = 5;
        this.concurentIterators = 1;
        _MazeGenerationController_mazeModel.set(this, void 0);
        _MazeGenerationController_currentMazeGenerator.set(this, null);
        _MazeGenerationController_callbackFn.set(this, void 0);
        __classPrivateFieldSet(this, _MazeGenerationController_mazeModel, mazeModel, "f");
        this.generateMazeButton = new Button(generateMazeButton, true);
        __classPrivateFieldSet(this, _MazeGenerationController_callbackFn, callbackFn, "f");
        this.generateMazeButton.setEventListener((() => {
            this.generateMazeButton.greyOut(true);
            this.dropdown.collapse();
            this.dropdown.dropdownButton.greyOut(true);
            this.generateMaze(__classPrivateFieldGet(this, _MazeGenerationController_currentMazeGenerator, "f"));
        }).bind(this));
        this.generateMazeButton.greyOut(true);
        this.dropdown = new Dropdown((dropdownItem) => {
            __classPrivateFieldSet(this, _MazeGenerationController_currentMazeGenerator, dropdownItem, "f");
            this.generateMazeButton.greyOut(false);
        }, dropdownId, Object.keys(mazeModel.mazeGenerators));
    }
    generateMaze(mazeGeneratorId, dimensions) {
        __classPrivateFieldGet(this, _MazeGenerationController_callbackFn, "f").call(this, "start");
        let generationPlaybackAPI;
        if (mazeGeneratorId === "Word Maze") {
            let word = prompt("What word to write?");
            while (true) {
                try {
                    generationPlaybackAPI = __classPrivateFieldGet(this, _MazeGenerationController_mazeModel, "f").generateNewMaze(mazeGeneratorId, dimensions, word);
                    break;
                }
                catch (e) {
                    word = prompt("Write a shorter word!");
                }
            }
        }
        else {
            generationPlaybackAPI = __classPrivateFieldGet(this, _MazeGenerationController_mazeModel, "f").generateNewMaze(mazeGeneratorId, dimensions);
        }
        for (let i = 0; i < this.concurentIterators; i++) {
            new IntervalHandler(generationPlaybackAPI, () => {
                if (__classPrivateFieldGet(this, _MazeGenerationController_currentMazeGenerator, "f")) {
                    this.generateMazeButton.greyOut(false);
                }
                this.dropdown.dropdownButton.greyOut(false);
                __classPrivateFieldGet(this, _MazeGenerationController_callbackFn, "f").call(this, "end");
            }).newInterval("forwards", this.speedConstant);
        }
    }
}
_MazeGenerationController_mazeModel = new WeakMap(), _MazeGenerationController_currentMazeGenerator = new WeakMap(), _MazeGenerationController_callbackFn = new WeakMap();
class MazeController {
    constructor(elementId, mazeModel, generationCallbackFn) {
        _MazeController_instances.add(this);
        this.mazeModel = mazeModel;
        this.mazeElement = __classPrivateFieldGet(this, _MazeController_instances, "m", _MazeController_getMazeElement).call(this, elementId);
        this.mazeGenerationController = this.mazeGenerationController = new MazeGenerationController("generate", "generationAlgorithms", this.mazeModel, (value) => {
            generationCallbackFn(value);
            if (value === "start") {
                this.mazeSolutionController.greyOut(true);
            }
            else {
                this.mazeSolutionController.greyOut(false);
            }
        });
        this.mazeSolutionController = new MazeSolutionController("playPauseToggle", "playbackSpeed", "solutionAlgorithms", this.mazeModel);
    }
    /**
     * Creates the resizeObserver that keeps the grid properly sized for the window
     * Triggers an empty new maze to be generated every time which stops all maze solving.
     */
    constructResizeObserver(callbackFunction) {
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.contentBoxSize) {
                    const newDimensions = [entry.contentBoxSize[0].inlineSize, entry.contentBoxSize[0].blockSize];
                    callbackFunction(newDimensions);
                }
            }
        });
        resizeObserver.observe(this.mazeElement);
        return resizeObserver;
    }
    remove() {
        this.mazeModel.display.removeDisplay();
        const dropdowns = document.getElementsByClassName("dropdown-menu-wrapper");
        for (const dropdown of dropdowns) {
            const oldItems = dropdown.childNodes;
            while (oldItems.length) {
                oldItems[0].remove();
            }
        }
        this.mazeGenerationController.dropdown.dropdownButton.interactiveElement.innerHTML = "Maze Generation";
        this.mazeSolutionController.dropdown.dropdownButton.interactiveElement.innerHTML = "Maze Solving";
        this.mazeGenerationController.dropdown.dropdownButton.removeEventListener();
        this.mazeSolutionController.dropdown.dropdownButton.removeEventListener();
        this.mazeGenerationController.generateMazeButton.removeEventListener();
    }
}
_MazeController_instances = new WeakSet(), _MazeController_getMazeElement = function _MazeController_getMazeElement(elementId) {
    //Get the DOM element to anchor the maze to
    const mazeElement = document.getElementById(elementId);
    if (!mazeElement) {
        throw new ReferenceError(`No DOM element of the name: ${elementId}`);
    }
    return (mazeElement);
};
class MazeController2D extends MazeController {
    //Maze Solution Controller
    constructor(elementId) {
        super(elementId, new MazeModel2D([1, 1]), (value) => value === "start" ? this.gridInputAPI.greyOut(true) : this.gridInputAPI.greyOut(false));
        _MazeController2D_instances.add(this);
        this.gridSize = 32;
        const initialGridSize = __classPrivateFieldGet(this, _MazeController2D_instances, "m", _MazeController2D_getGridDimensions).call(this, [this.mazeElement.offsetWidth, this.mazeElement.offsetHeight]);
        this.gridInputAPI = new GridDrawingController2D(this.mazeModel, this.mazeElement, (type) => {
            this.mazeSolutionController.gridChange(type);
        });
        this.resizeObserver = this.constructResizeObserver(__classPrivateFieldGet(this, _MazeController2D_instances, "m", _MazeController2D_getResizeHandler).call(this, initialGridSize));
        this.mazeGenerationController.generateMaze("Empty Maze", __classPrivateFieldGet(this, _MazeController2D_instances, "m", _MazeController2D_getGridDimensions).call(this, [this.mazeElement.offsetWidth, this.mazeElement.offsetHeight]));
    }
    changeGridSize(value) {
        this.gridSize = value;
        document.body.style.setProperty("--maze-size", `${value}px`);
        this.mazeGenerationController.generateMaze("Empty Maze", __classPrivateFieldGet(this, _MazeController2D_instances, "m", _MazeController2D_getGridDimensions).call(this, [this.mazeElement.offsetWidth, this.mazeElement.offsetHeight]));
    }
    remove() {
        super.remove();
        this.gridInputAPI.greyOut(true);
        this.resizeObserver.disconnect();
    }
}
_MazeController2D_instances = new WeakSet(), _MazeController2D_getResizeHandler = function _MazeController2D_getResizeHandler(initialGridSize) {
    let currentGridSize = initialGridSize;
    return (newDimensions) => {
        const newGridSize = __classPrivateFieldGet(this, _MazeController2D_instances, "m", _MazeController2D_getGridDimensions).call(this, newDimensions);
        if (newGridSize[0] !== currentGridSize[0] || newGridSize[1] !== currentGridSize[1]) {
            currentGridSize = newGridSize;
            this.mazeGenerationController.generateMaze("Empty Maze", newGridSize);
        }
    };
}, _MazeController2D_getGridDimensions = function _MazeController2D_getGridDimensions(elementDimensions) {
    const getMaxOddGrids = (dimension) => (Math.floor(dimension / this.gridSize)) % 2 === 1 ? Math.floor(dimension / this.gridSize) : Math.floor(dimension / this.gridSize) - 1;
    const newGridSize = [getMaxOddGrids(elementDimensions[0]), getMaxOddGrids(elementDimensions[1])];
    return (newGridSize);
};
class MazeController3D extends MazeController {
    constructor(elementId) {
        super(elementId, new MazeModel3D([15, 5, 15]), () => { });
        this.mazeGenerationController.speedConstant = 1;
        this.resizeObserver = this.constructResizeObserver((gridSize) => {
            this.mazeModel.display.reziseDisplay(gridSize);
        });
        this.mazeGenerationController.concurentIterators = 5;
    }
    remove() {
        super.remove();
        this.resizeObserver.disconnect();
    }
}
export { MazeController2D, MazeController3D };

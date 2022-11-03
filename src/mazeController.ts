
import {BaseMazeModel, MazeGeneratorId, MazeSolverId, SolutionPlaybackAPI, MazeModel2D, MazeModel3D} from "./mazeModel.js"
import {NGrid, Tuple} from "./components/NGrid.js"
import {IntervalHandler} from "./components/intervalHandler.js"
import {Dropdown, Button, ToggleButton, SliderElement} from "./components/UILib.js"


type gridToolTypes = "pen" | "erase" | "none"

/**
 * A class for acting on User input on the grid.
 */
class GridDrawingController2D {
    #gridTool_private: gridToolTypes = "none"
    gridInputAPI: MouseEventAPI;
    #active_private: boolean = true;
    mazeModel;
    #callbackFn: (type: "gridDraw" | "gridDrag") => void;
    constructor(mazeModel: BaseMazeModel<2>, mazeElement: HTMLElement, callbackFn: (type: "gridDraw" | "gridDrag") => void) {
        this.gridInputAPI = new MouseEventAPI(mazeElement, this.mouseEventHandler.bind(this))
        this.#callbackFn = callbackFn
        this.mazeModel = mazeModel
        this.#buttonInteraction()
    }

    //Making it interactive with buttons!

    /**
     * A private method for adding interaction to the 2 buttons assotiated with interacting with the grid
     */
    #buttonInteraction() {
        const idList: gridToolTypes[] = ['pen', 'erase']
        for(const id of idList) {
            const button = document.getElementById(id);
            if(!button) {throw new ReferenceError(`No DOM element with the id: ${id}`)}
            button.addEventListener('click', () => this.#gridToolToggle(id))
        }
    }
    
    /**
     * A private method for handling when the buttons are pressed
     * @param elementId The id of the button pressed
     */
    #gridToolToggle(elementId: gridToolTypes){
        if(this.#active_private === false) {return;}
        if(this.#gridTool_private === elementId) {
            this.#gridTool_private = "none";
            document.getElementById(elementId)?.setAttribute("toggled", "false")
        } else {
            this.#gridTool_private = elementId;
            const otherElement: gridToolTypes = elementId === "pen" ? "erase" : "pen"
            document.getElementById(elementId)?.setAttribute("toggled", "true")
            document.getElementById(otherElement)?.setAttribute("toggled", "false")
        }
    }
    /**
     * A public method for ignoring user input. Also visually greys out the buttons
     * @param value If userinteraction should be ignored
     */
    greyOut(value: boolean) {
        if(value === true) {
            this.#gridTool_private = "none"
            document.getElementById('pen')?.setAttribute("toggled", "true")
            document.getElementById('erase')?.setAttribute("toggled", "true")
        } else {
            document.getElementById('pen')?.setAttribute("toggled", "false")
            document.getElementById('erase')?.setAttribute("toggled", "false")
        }
        this.gridInputAPI.ignore = value
        this.#active_private = !value
    }

    //Interaction with the grid.

    /**
     * A private method for handling when dragging without a gridTool
     * @param gridCellFrom The gridCell that the drag was from
     * @param gridCellTo The gridCell that the drag was to
     */
    #gridDragHandler(gridCellFrom: [number, number], gridCellTo: [number,number]) {
        const specialGridCell = this.mazeModel.checkForSpecialGridCell(gridCellFrom)
        if(!specialGridCell) {return}
        this.mazeModel.moveSpecialGridCell(gridCellTo, specialGridCell)
        this.#callbackFn("gridDrag")
    }
    /**
     * A private method for handling when the grid is drawn on
     * @param gridCell The gridCell that was drawn on
     * @param value The gridToolType currently selected
     */
    #gridDrawHandler(gridCell: [number,number], value: "pen" | "erase") {
        this.mazeModel?.changeMazeVertex(gridCell, value === "pen" ? 1 : 0)
        this.#callbackFn("gridDraw")
        return;
    }
    /**
     * The eventHandler for the grid. Determines what to do based on the 
     * input by the user and the current gridTool.
     * @param currentGridCellId The gridCell currently mousing down on
     * @param lastGridCellId The previous gridCell captured by the eventListner
     */
    mouseEventHandler(currentGridCellId: string, lastGridCellId: string) {
        let currentGridCell;
        let lastGridCell;
        const currentGridTool = this.#gridTool_private;
        //Gets the current cell :)) If there is none it returns
        try {
            currentGridCell = JSON.parse(currentGridCellId) as [number, number]
        } catch {
            return;
        }
        //Checks if there are 2 cells incase there is being dragged
        try {
            lastGridCell = JSON.parse(lastGridCellId) as [number, number]
            
            if(currentGridTool === "none") {
                this.#gridDragHandler(lastGridCell, currentGridCell)
                return;
            }
            //If so it  an interpolated result between them incase the drag was too fast
            const interpolatedResult = NGrid.interpolateBetweenVertexes(currentGridCell, lastGridCell) as [number, number][]

            interpolatedResult.forEach((gridCell) => {this.#gridDrawHandler(gridCell, currentGridTool)});
        } catch {
            if(currentGridTool === "none") {return;}
             //If not it just 
            if(!(Array.isArray(currentGridCell)) && typeof currentGridCell[0] !== "number" && typeof currentGridCell[1] !== "number") {return;}
            const verifiedGridCell: [number, number] = [currentGridCell[0], currentGridCell[1]];
            this.#gridDrawHandler(verifiedGridCell, currentGridTool )
        }        
    }
}

/**
 * Handles Mouse events when click dragging across a parent element
 * returns the id of the child element currently and previously moused over.
 * Does this every time a new child element is moused over.
 */
class MouseEventAPI {
    #mazeElement: HTMLElement;
    ignore: boolean;
    constructor(mazeElement: HTMLElement, callbackFn: (currentElement: string, lastElement: string) => void) {
        this.#mazeElement = mazeElement;
        this.#constructEventListner(callbackFn);
        this.ignore = false;
    }

    /**
     * Constructs the eventhandler for tracking which child elements are moused over while mousing down
     * @param callbackFn The function to call when a child element is moused over while mousing down
     */
    #constructEventListner(callbackFn: (currentElement: string, lastElement: string) => void) {
        const mouseEventHandlerScope = (): [(event: MouseEvent) => void, () => void] => {
            let lastTarget = ""
            return([(event: MouseEvent) => {
                const currentTarget: any = event.target;
                this.ignore ? null : callbackFn(currentTarget.id, lastTarget)
                lastTarget = currentTarget.id;
            }, () => {lastTarget = ""}])
        }
        const touchEventHandlerScope = (): [(event: TouchEvent) => void, () => void] => {
            let lastTarget = ""
            return([(event: TouchEvent) => {
                const currentTarget: any = document.elementFromPoint(event.touches[0].clientX, event.touches[0].clientY);
                if(!currentTarget) {return;}
                this.ignore ? null : callbackFn(currentTarget.id, lastTarget)
                lastTarget = currentTarget.id;
            }, () => {lastTarget = ""}])
        }
        const [mouseEventHandler, mouseEventReset] = mouseEventHandlerScope()
        const [touchEventHandler, touchEventReset] = touchEventHandlerScope()
        this.#mazeElement.addEventListener('mousedown', (event) => {
            mouseEventHandler(event)
            this.#mazeElement.addEventListener('mouseover', mouseEventHandler)
        })
        this.#mazeElement.addEventListener('touchstart', (event) => {
            touchEventHandler(event)
            this.#mazeElement.addEventListener('touchmove', touchEventHandler)
        })
        document.addEventListener('mouseup', (event) => {
            this.#mazeElement.removeEventListener('mouseover',mouseEventHandler)
            mouseEventReset()
        })
        document.addEventListener('touchend', (event) => {
            this.#mazeElement.removeEventListener('touchmove', touchEventHandler)
            touchEventReset()
        })
        document.addEventListener('touchcancel', (event) => {
            this.#mazeElement.removeEventListener('touchmove', touchEventHandler)
            touchEventReset()
        })
    }
}

/**
 * A Class for handling the playback of a a single playback given by the playbackController
 * Will need to be destructed if dereferenced, as to stop any hanging intervals.
 * References a toggleable button for playing and pausing the playback
 * Referneces a speedController for controlling the speed of the playback
 */
class PlaybackUIHandler<N extends number> {
    #toggleButton: ToggleButton<"playing" | "paused">
    #slider: SliderElement;
    #intervalHandler: IntervalHandler<N>
    #playbackIntervalTime: number = 999999999 //Basically infinity i guess ?
    #playbackDirection: "forwards" | "backwards" = "forwards"
    currentState: "playing" | "paused" | "displaying" | "start" = "start"
    #SOLUTION_SPEED_CONSTANT: number = 50;
    constructor(playbackController: SolutionPlaybackAPI<N>, toggleButton: ToggleButton<"playing" | "paused">, speedController: SliderElement) {
        //Adding functionality to the toggleButton
        this.#toggleButton = toggleButton
        this.#toggleButton.setEventListener((() => {
            this.#toggleButton.getDisplayState() === "paused" ? this.play() : this.pause()
        }).bind(this))
        //Adding functionality to the speedController
        this.#slider = speedController
        this.#slider.setEventListener((() => {
            this.changeSpeed(this.#slider.getValue())
        }).bind(this))
        this.#intervalHandler = new IntervalHandler(playbackController, this.#intervalhandlerCallback.bind(this))
        if(playbackController.displayingSolution) {this.currentState = "displaying"}
        this.changeSpeed(this.#slider.getValue())
    }
    /**
     * Will begin the playback.
     */
    play(): void {
        this.#toggleButton.setDisplayState("playing")
        this.currentState = "playing"
        this.#intervalHandler.newInterval(this.#playbackDirection, this.#playbackIntervalTime)
    }
    /**
     * Will stop the playback.
     */
    pause(): void {
        this.#toggleButton.setDisplayState("paused")
        this.currentState = "paused"
        this.#intervalHandler.stopinterval()
    }
    /**
     * Important when dereferencing an instance of a PlaybackUIHandler, as there may be an interval
     * ongoing which needs to be stopped. Will destruct the playback on the maze.
     */
    destruct(): void {
        this.#intervalHandler.displayFullPlayback("backwards")
        this.#toggleButton.greyOut(true)
        this.#toggleButton.reset()
        this.#slider.reset()
    }
    /**
     * The callback for the IntervalHandler, for when it runs into the end of the playback
     * @param intervalStop The intervalStop Type
     */
    #intervalhandlerCallback(intervalStop: "start" | "end") {
        if(intervalStop === "end") {
            this.currentState = "displaying"
        } else {
            this.currentState = "start"
        }
        this.#toggleButton.greyOut(true)
        this.#toggleButton.setDisplayState("paused")
    }
    /**
     * A function for changing the speed of the playback. If it is ongoing it will continue to be so at the new speed.
     * @param speed the new speed to playback at
     */
    changeSpeed(speed: number): void {
        this.#playbackIntervalTime = speed === 0 ? 999999999 : Math.abs(this.#SOLUTION_SPEED_CONSTANT/speed); //Lidt funky men altså det er bedre end før 💀💀
        this.#playbackDirection = speed < 0 ? "backwards" : "forwards"
        if(this.#playbackDirection === "backwards" && this.currentState === "start") {
            this.#toggleButton.greyOut(true)
        } else if(this.#playbackDirection === "forwards" && this.currentState === "displaying") {
            this.#toggleButton.greyOut(true)
        } else {
            this.#toggleButton.greyOut(false)
        }
        if(this.currentState !== "playing") {return;}
        this.#intervalHandler.newInterval(this.#playbackDirection, this.#playbackIntervalTime)
    }
}

class MazeSolutionController<N extends number> {
    //References:
    #mazeModel: BaseMazeModel<N>;

    #currentMazeSolver: MazeSolverId | null = null;

    #toggleButton: ToggleButton<"playing" | "paused">
    #speedController: SliderElement
    dropdown: Dropdown<MazeSolverId>

    mazeSolvingUIHandler: PlaybackUIHandler<N> | null = null;

    #timer: number | null = null;
    constructor(toggleButtonId: string, sliderElementId: string, dropdownId: string, mazeModel: BaseMazeModel<N>) {
        this.#mazeModel = mazeModel

        this.#toggleButton = new ToggleButton<"playing" | "paused">(toggleButtonId, (state, buttonElement) => {
            const symbolElement = buttonElement.getElementsByTagName("span")[0]
            symbolElement.innerHTML = state === "playing" ?  "pause" : "play_arrow"
        }, "paused", true)

        this.dropdown = new Dropdown((dropdownItem: MazeSolverId) => {
            this.solveMaze(dropdownItem);
            this.#currentMazeSolver = dropdownItem
        }, dropdownId, Object.keys(mazeModel.mazeSolvers) as MazeSolverId[])

        this.#speedController = new SliderElement(sliderElementId)
        }
    solveMaze(mazeSolverId: MazeSolverId) {
        const solutionController = this.#mazeModel.generateSolution(mazeSolverId)
        if(this.mazeSolvingUIHandler) {this.mazeSolvingUIHandler.destruct()}
        this.mazeSolvingUIHandler = new PlaybackUIHandler<N>(solutionController, this.#toggleButton, this.#speedController)
    }
    greyOut(value: boolean) {
        this.dropdown.dropdownButton.greyOut(value);
        this.dropdown.collapse();
        if(value === true) {
            if(this.mazeSolvingUIHandler) {
                this.mazeSolvingUIHandler.destruct()
                this.mazeSolvingUIHandler = null;
            }
        } else {
            if(this.#currentMazeSolver) {
                this.solveMaze(this.#currentMazeSolver)
            }
        }
    }
    gridChange(value: "gridDraw" | "gridDrag") {
        if(!this.mazeSolvingUIHandler) {return;}
        if(this.mazeSolvingUIHandler.currentState !== "displaying") {
            this.solveMaze(this.#currentMazeSolver!)
            return;
        }
        if(this.#timer) {clearTimeout(this.#timer)}
        this.#timer = setTimeout((() => {
            this.mazeSolvingUIHandler = new PlaybackUIHandler<N>(this.#mazeModel.updateSolution(), this.#toggleButton, this.#speedController)
            this.mazeSolvingUIHandler.currentState = "displaying"
            this.#timer = null;
        }).bind(this), 300)
    }
}

class MazeGenerationController<N extends number> {
    speedConstant: number = 5
    concurentIterators: number = 1
    #mazeModel: BaseMazeModel<N>;
    #currentMazeGenerator: MazeGeneratorId | null = null;
    generateMazeButton: Button;
    dropdown: Dropdown<MazeGeneratorId>
    #callbackFn: (value: "start" | "end") => void
    constructor(generateMazeButton: string, dropdownId: string, mazeModel: BaseMazeModel<N>, callbackFn: (value: "start" | "end") => void) {
        this.#mazeModel = mazeModel
        this.generateMazeButton = new Button(generateMazeButton, true)
        this.#callbackFn = callbackFn
        this.generateMazeButton.setEventListener((() => {
            this.generateMazeButton.greyOut(true)
            this.dropdown.collapse()
            this.dropdown.dropdownButton.greyOut(true)
            this.generateMaze(this.#currentMazeGenerator!)
        }).bind(this))
        this.generateMazeButton.greyOut(true)
        this.dropdown = new Dropdown((dropdownItem: MazeGeneratorId) => {
            this.#currentMazeGenerator = dropdownItem
            this.generateMazeButton.greyOut(false)
        }, dropdownId, Object.keys(mazeModel.mazeGenerators) as MazeGeneratorId[])
    }
    generateMaze(mazeGeneratorId: MazeGeneratorId, dimensions?: Tuple<N>) {
        this.#callbackFn("start");
        let generationPlaybackAPI
        if(mazeGeneratorId === "Word Maze") {
            let word = prompt("What word to write?")
            while(true) {
                try {
                    generationPlaybackAPI = this.#mazeModel.generateNewMaze(mazeGeneratorId, dimensions, word)
                    break;
                } catch (e) {
                    word = prompt("Write a shorter word!")
                }
            }
        } else {
            generationPlaybackAPI = this.#mazeModel.generateNewMaze(mazeGeneratorId, dimensions)
        }
        for (let i = 0; i < this.concurentIterators; i++) {
            new IntervalHandler(generationPlaybackAPI, () => {
                if(this.#currentMazeGenerator) {this.generateMazeButton.greyOut(false)}
                this.dropdown.dropdownButton.greyOut(false)
                this.#callbackFn("end")
            }).newInterval("forwards", this.speedConstant)
        }
    }
}

class MazeController<N extends number>{
    mazeSolutionController: MazeSolutionController<N>;
    mazeGenerationController: MazeGenerationController<N>;
    mazeModel: BaseMazeModel<N>;
    mazeElement: HTMLElement
    constructor(elementId: string, mazeModel: BaseMazeModel<N>, generationCallbackFn: (value: "start" | "end") => void) {
        this.mazeModel = mazeModel;
        this.mazeElement = this.#getMazeElement(elementId)
        this.mazeGenerationController = this.mazeGenerationController = new MazeGenerationController("generate", "generationAlgorithms", this.mazeModel, (value) => {
            generationCallbackFn(value)
            if(value === "start") {
                this.mazeSolutionController.greyOut(true);
            } else {
                this.mazeSolutionController.greyOut(false);
            }
        })
        this.mazeSolutionController = new MazeSolutionController("playPauseToggle", "playbackSpeed", "solutionAlgorithms", this.mazeModel)
    }
    #getMazeElement(elementId: string) {
        //Get the DOM element to anchor the maze to
        const mazeElement = document.getElementById(elementId);
        if(!mazeElement) {throw new ReferenceError(`No DOM element of the name: ${elementId}`)}
        return(mazeElement)
    }
    /**
     * Creates the resizeObserver that keeps the grid properly sized for the window
     * Triggers an empty new maze to be generated every time which stops all maze solving.
     */
    constructResizeObserver(callbackFunction: (gridSize: [number, number]) => void) {
        const resizeObserver = new ResizeObserver((entries) => {
            for(const entry of entries) {
                if(entry.contentBoxSize) {
                    const newDimensions: [number, number] = [entry.contentBoxSize[0].inlineSize, entry.contentBoxSize[0].blockSize]
                    callbackFunction(newDimensions)
                }
            }
        })
        resizeObserver.observe(this.mazeElement)
        return resizeObserver
    }
    remove() {
        this.mazeModel.display.removeDisplay()
        const dropdowns = document.getElementsByClassName("dropdown-menu-wrapper")
        for(const dropdown of dropdowns) {
            const oldItems = dropdown.childNodes;
            while(oldItems.length) {
                oldItems[0].remove()
            }
        }
        this.mazeGenerationController.dropdown.dropdownButton.interactiveElement.innerHTML = "Maze Generation"
        this.mazeSolutionController.dropdown.dropdownButton.interactiveElement.innerHTML = "Maze Solving"
        this.mazeGenerationController.dropdown.dropdownButton.removeEventListener()
        this.mazeSolutionController.dropdown.dropdownButton.removeEventListener()
        this.mazeGenerationController.generateMazeButton.removeEventListener()
    }
}

class MazeController2D extends MazeController<2>{
    //Grid input controlls
    gridInputAPI: GridDrawingController2D;
    gridSize: number = 32;
    resizeObserver: ResizeObserver

    //Maze Solution Controller
    
    constructor(elementId: string, ) {
        super(elementId, new MazeModel2D([1,1]), (value) => value === "start" ? this.gridInputAPI.greyOut(true) : this.gridInputAPI.greyOut(false))
        const initialGridSize = this.#getGridDimensions([this.mazeElement.offsetWidth, this.mazeElement.offsetHeight])
        this.gridInputAPI = new GridDrawingController2D(this.mazeModel, this.mazeElement, (type) => {
            this.mazeSolutionController.gridChange(type)
        })
        this.resizeObserver = this.constructResizeObserver(this.#getResizeHandler(initialGridSize));
        this.mazeGenerationController.generateMaze("Empty Maze", this.#getGridDimensions([this.mazeElement.offsetWidth, this.mazeElement.offsetHeight]))
    }

    #getResizeHandler(initialGridSize: Tuple<2>) {
        let currentGridSize = initialGridSize
        return (newDimensions: Tuple<2>) => {
            const newGridSize = this.#getGridDimensions(newDimensions)
            if(newGridSize[0] !== currentGridSize[0] || newGridSize[1] !== currentGridSize[1]) {
                currentGridSize = newGridSize
                this.mazeGenerationController.generateMaze("Empty Maze", newGridSize)
            }
        }
    }
    changeGridSize(value: number) {
        this.gridSize = value;
        document.body.style.setProperty("--maze-size", `${value}px`)
        this.mazeGenerationController.generateMaze("Empty Maze", this.#getGridDimensions([this.mazeElement.offsetWidth, this.mazeElement.offsetHeight]))
    }
    #getGridDimensions(elementDimensions: [number, number]) {
        const getMaxOddGrids = (dimension: number) => (Math.floor(dimension/this.gridSize))%2 === 1 ? Math.floor(dimension/this.gridSize) : Math.floor(dimension/this.gridSize)-1
        const newGridSize: [number, number] = [getMaxOddGrids(elementDimensions[0]),getMaxOddGrids(elementDimensions[1])]
        return(newGridSize)
    }
    remove(): void {
        super.remove();
        this.gridInputAPI.greyOut(true)
        this.resizeObserver.disconnect()
    }
}

class MazeController3D extends MazeController<3> {
    resizeObserver: ResizeObserver
    constructor(elementId: string) {
        super(elementId, new MazeModel3D([15,5,15]), () => {})
        this.mazeGenerationController.speedConstant = 1
        this.resizeObserver = this.constructResizeObserver((gridSize) => {
            this.mazeModel.display.reziseDisplay(gridSize)
        })
        this.mazeGenerationController.concurentIterators = 5
    }
    remove(): void {
        super.remove()
        this.resizeObserver.disconnect()
    }
}

export {MazeController2D, MazeController3D}
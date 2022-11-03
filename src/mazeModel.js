var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _BaseMazeModel_mazeRoot, _BaseMazeModel_mazeGoal;
import { emptyMaze, plainPrimsAlgorithm, recursiveDivision, wordPrimsAlgorithm, depthFirst } from "./webworkers/mazeGenerators.js";
import { breadthFirstSearch, depthFirstSearchHorizontal, depthFirstSearchVertical, randomSearch, AStarEuclidian, AStarManhatten } from "./webworkers/mazeSolvers.js";
import { NGrid } from "./components/NGrid.js";
import { MazeDisplay2D, MazeDisplay3D } from "./mazeDisplays.js";
/**
 * Handles the Generation and Solving of mazes and producing the correct NGrid to display.
 * Also sends off instructions to a MazeDisplay when the internal Maze Model is changed.
 * If the maze is changed while it is solved it will auto generate a new solution.
 */
class BaseMazeModel {
    constructor(initialDimensions, mazeDisplay) {
        this.currentMazeSolver = null;
        this.mazeSolution = null;
        //Root and Goal of the maze
        _BaseMazeModel_mazeRoot.set(this, void 0);
        _BaseMazeModel_mazeGoal.set(this, void 0);
        this.mazeSolvers = {
            "Breadth First Search": (breadthFirstSearch),
            "Depth First Search Horizontal": (depthFirstSearchHorizontal),
            "Random Search": (randomSearch),
            "Depth First Search Vertical": (depthFirstSearchVertical),
            "A* Search Euclidian": (AStarEuclidian),
            "A* Search Manhatten": (AStarManhatten)
        };
        this.mazeGenerators = {
            "Empty Maze": (emptyMaze),
            "Recursive Division": (recursiveDivision),
            "Prims Algorithm": (plainPrimsAlgorithm),
            "Depth First": (depthFirst)
        };
        this.display = mazeDisplay;
        this.generateNewMaze("Empty Maze", initialDimensions);
    }
    /**
     * A method for checking if a gridCell is a specialGridCell.
     * @param gridCell The gridCell to check
     * @returns If it is a special Grid Cell it returns the type otherwise it returns undefined
     */
    checkForSpecialGridCell(gridCell) {
        if (gridCell.toString() == __classPrivateFieldGet(this, _BaseMazeModel_mazeGoal, "f").toString()) {
            return "goal";
        }
        if (gridCell.toString() == __classPrivateFieldGet(this, _BaseMazeModel_mazeRoot, "f").toString()) {
            return "root";
        }
    }
    /**
     * A method for moving a specialGridCell to another location on the grid.
     * @param gridCell The new gridCell to move the specialGridCell to
     * @param type the type of specialGridCell to move
     */
    moveSpecialGridCell(gridCell, type) {
        this.display.moveSpecialGridCell(type, gridCell);
        if (type === "goal") {
            __classPrivateFieldSet(this, _BaseMazeModel_mazeGoal, gridCell, "f");
        }
        if (type === "root") {
            __classPrivateFieldSet(this, _BaseMazeModel_mazeRoot, gridCell, "f");
        }
    }
    /**
     * A method for changing a gridCell into another regularGridCell Type.
     * @param gridCell The gridCell to change
     * @param value the value to change it to
     */
    changeMazeVertex(gridCell, value) {
        this.currentDisplayMaze.assertVertex(gridCell);
        if (this.currentDisplaySolution.getVertexValue(gridCell) !== 0) {
            if (value === 0) {
                return;
            }
            this.changeSolutionVertex(gridCell, 0);
        }
        this.currentDisplayMaze.setVertexValue(gridCell, value);
        this.display.changeGridCell(gridCell, value);
    }
    changeSolutionVertex(gridCell, value) {
        this.currentDisplaySolution.assertVertex(gridCell);
        if (this.currentDisplayMaze.getVertexValue(gridCell) === 1) {
            return;
        }
        this.currentDisplaySolution.setVertexValue(gridCell, value);
        this.display.changeGridCell(gridCell, value);
    }
    /**
     * A method for generating a new maze to display on the grid. It will wipe the display and await the playback sequence.
     * @param generationAlgorithm The MazeGenerator to use
     * @param dimensions Optionally new dimensions for the maze
     * @returns A playback controller which has methods for controlling the playback sequence.
     */
    generateNewMaze(generationAlgorithm, dimensions, ...config) {
        //Generates a new maze
        const newMaze = this.mazeGenerators[generationAlgorithm](dimensions ? dimensions : this.currentDisplayMaze.dimensions, ...config);
        //Generates the starting point for the playback
        this.currentDisplayMaze = new NGrid(newMaze.maze.dimensions, 0);
        this.currentDisplaySolution = new NGrid(newMaze.maze.dimensions, 0);
        this.display.setMaze(this.currentDisplayMaze);
        //If new dimensions were given they are saved and the Root and Goal are moved to their new locations.
        if (dimensions) {
            __classPrivateFieldSet(this, _BaseMazeModel_mazeRoot, dimensions.map(() => 0), "f");
            __classPrivateFieldSet(this, _BaseMazeModel_mazeGoal, dimensions.map((value) => value - 1), "f");
            this.display.moveSpecialGridCell("root", __classPrivateFieldGet(this, _BaseMazeModel_mazeRoot, "f"));
            this.display.moveSpecialGridCell("goal", __classPrivateFieldGet(this, _BaseMazeModel_mazeGoal, "f"));
        }
        return (new GenerationPlaybackAPI(this.changeMazeVertex.bind(this), newMaze));
    }
    /**
     * A method for generating a new solution to the current maze.
     * @param solvingAlgorithm The MazeSolver to use
     * @returns A playback controller which has methods for controlling the playback sequence.
     */
    generateSolution(solvingAlgorithm) {
        this.currentMazeSolver = this.mazeSolvers[solvingAlgorithm];
        const newSolution = this.currentMazeSolver(this.currentDisplayMaze, __classPrivateFieldGet(this, _BaseMazeModel_mazeRoot, "f"), __classPrivateFieldGet(this, _BaseMazeModel_mazeGoal, "f"));
        return (new SolutionPlaybackAPI(this.changeSolutionVertex.bind(this), newSolution));
    }
    updateSolution() {
        if (!this.currentMazeSolver) {
            throw new Error("Tried to update solution but no mazeSolver is currently attatched");
        }
        const newSolution = this.currentMazeSolver(this.currentDisplayMaze, __classPrivateFieldGet(this, _BaseMazeModel_mazeRoot, "f"), __classPrivateFieldGet(this, _BaseMazeModel_mazeGoal, "f"));
        const gridCellUpdates = NGrid.NGridDifferences(this.currentDisplaySolution, newSolution.exploredVertexes);
        gridCellUpdates.vertexes.forEach((value, index) => {
            this.changeSolutionVertex(value, gridCellUpdates.values[index]);
        });
        const newSolutionPlaybackAPI = new SolutionPlaybackAPI(this.changeSolutionVertex.bind(this), newSolution, true);
        newSolutionPlaybackAPI.displaySolution(true);
        return newSolutionPlaybackAPI;
    }
}
_BaseMazeModel_mazeRoot = new WeakMap(), _BaseMazeModel_mazeGoal = new WeakMap();
class PlaybackAPI {
    constructor(displayCallback, playback, preDisplayed = false) {
        this.playback = playback;
        this.callback = displayCallback;
        this.progress = preDisplayed ? this.playback.length - 1 : -1;
    }
    step(direction) {
        if (direction === "forwards") {
            if (this.progress >= this.playback.length - 1) {
                return false;
            }
            this.progress++;
            const nextGridCell = this.playback[this.progress];
            this.callback(nextGridCell, true);
            return (true);
        }
        else {
            if (this.progress <= -1) {
                return false;
            }
            const nextGridCell = this.playback[this.progress];
            this.callback(nextGridCell, false);
            this.progress--;
            return (true);
        }
    }
    displayFullPlayback(direction) {
        let returnValue = true;
        while (returnValue === true) {
            returnValue = this.step(direction);
        }
    }
}
class SolutionPlaybackAPI extends PlaybackAPI {
    constructor(displayCallback, mazeSolution, preDisplayed = false) {
        super((vertex, value) => { displayCallback(vertex, value ? 2 : 0); }, mazeSolution.playback, preDisplayed);
        this.displayingSolution = false;
        this.solutionCallback = (vertex, value) => { displayCallback(vertex, value ? 3 : 2); };
        this.solution = mazeSolution.solution;
    }
    displaySolution(value) {
        if (!this.solution) {
            return;
        }
        this.solution.forEach((solutionGridCell) => {
            this.solutionCallback(solutionGridCell, value);
        });
    }
    step(direction) {
        if (direction === "forwards") {
            if (this.progress === this.playback.length - 1) {
                this.displaySolution(true);
                this.displayingSolution = true;
            }
        }
        else {
            if (this.displayingSolution) {
                this.displaySolution(false);
                this.displayingSolution = false;
            }
        }
        return super.step(direction);
    }
}
class GenerationPlaybackAPI extends PlaybackAPI {
    constructor(displayCallback, mazeGenerated) {
        super((vertex, value) => {
            const playbackValue = mazeGenerated.playback.values[this.progress];
            if (value === true) {
                displayCallback(vertex, playbackValue);
            }
            else {
                displayCallback(vertex, playbackValue === 1 ? 0 : 1);
            }
        }, mazeGenerated.playback.vertexes); //Cursed ☠️
    }
}
class MazeModel2D extends BaseMazeModel {
    constructor(initialDimensions) {
        super(initialDimensions, new MazeDisplay2D("mazeWrapper"));
        this.mazeGenerators["Word Maze"] = wordPrimsAlgorithm;
    }
}
class MazeModel3D extends BaseMazeModel {
    constructor(initialdimensions) {
        super(initialdimensions, new MazeDisplay3D("mazeWrapper"));
    }
}
export { BaseMazeModel, MazeModel2D, MazeModel3D, PlaybackAPI, SolutionPlaybackAPI, GenerationPlaybackAPI };

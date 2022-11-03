
import {MazeGenerated, emptyMaze, plainPrimsAlgorithm, recursiveDivision, wordPrimsAlgorithm, depthFirst} from "./webworkers/mazeGenerators.js"
import {breadthFirstSearch, depthFirstSearchHorizontal, depthFirstSearchVertical, randomSearch, MazeSolution, AStarEuclidian, AStarManhatten} from "./webworkers/mazeSolvers.js"
import {NGrid, Tuple, Vertex} from "./components/NGrid.js";
import {MazeDisplay, specialGridCells, MazeDisplay2D, MazeDisplay3D} from "./mazeDisplays.js"

type MazeGeneratorId = "Empty Maze" | "Recursive Division" | "Prims Algorithm" | "Word Maze" | "Depth First";

type MazeSolverId = "Breadth First Search" | "Depth First Search Horizontal" | "Depth First Search Vertical" | "Random Search";

type MazeSolver<N extends number> = (maze: NGrid<N>, start: Tuple<N>, goal: Tuple<N>) => MazeSolution<N>;
type MazeGenerator<N extends number> = (dimensions: Tuple<N>, ...config: any[]) => MazeGenerated<N>;

/**
 * Handles the Generation and Solving of mazes and producing the correct NGrid to display.
 * Also sends off instructions to a MazeDisplay when the internal Maze Model is changed.
 * If the maze is changed while it is solved it will auto generate a new solution.
 */
class BaseMazeModel<N extends number> {
    //The maze displayed and the generation and solution process of that maze.
    currentDisplayMaze!: NGrid<N>;
    currentDisplaySolution!: NGrid<N>;

    currentMazeSolver: MazeSolver<N> | null = null;
    mazeSolution: MazeSolution<N> | null = null;

    display: MazeDisplay<N>;

    //The algorithms available
    mazeSolvers: {[key: string]: MazeSolver<N>};
    mazeGenerators: {[key: string]: MazeGenerator<N>};

    //Root and Goal of the maze
    #mazeRoot!: Tuple<N>;
    #mazeGoal!: Tuple<N>;

    constructor(initialDimensions: Tuple<N>, mazeDisplay: MazeDisplay<N>) {
        this.mazeSolvers = {
            "Breadth First Search": breadthFirstSearch<N>,
            "Depth First Search Horizontal": depthFirstSearchHorizontal<N>,
            "Random Search": randomSearch<N>,
            "Depth First Search Vertical": depthFirstSearchVertical<N>,
            "A* Search Euclidian": AStarEuclidian<N>,
            "A* Search Manhatten": AStarManhatten<N>
        }
        this.mazeGenerators = {
            "Empty Maze": emptyMaze<N>,
            "Recursive Division": recursiveDivision<N>,
            "Prims Algorithm": plainPrimsAlgorithm<N>,
            "Depth First": depthFirst<N>
        }
        this.display = mazeDisplay
        this.generateNewMaze("Empty Maze", initialDimensions)
    }
    /**
     * A method for checking if a gridCell is a specialGridCell.
     * @param gridCell The gridCell to check
     * @returns If it is a special Grid Cell it returns the type otherwise it returns undefined
     */
    checkForSpecialGridCell(gridCell: Tuple<N>): specialGridCells | undefined {
        if(gridCell.toString() == this.#mazeGoal.toString()) {
            return "goal"
        }
        if(gridCell.toString() == this.#mazeRoot.toString()) {
            return "root"
        }
    }
    /**
     * A method for moving a specialGridCell to another location on the grid.
     * @param gridCell The new gridCell to move the specialGridCell to
     * @param type the type of specialGridCell to move
     */
    moveSpecialGridCell(gridCell: Tuple<N>, type: specialGridCells) {
        this.display.moveSpecialGridCell(type, gridCell)
        if(type === "goal") {this.#mazeGoal = gridCell}
        if(type === "root") {this.#mazeRoot = gridCell}
    }
    /**
     * A method for changing a gridCell into another regularGridCell Type.
     * @param gridCell The gridCell to change
     * @param value the value to change it to
     */
    changeMazeVertex(gridCell: Tuple<N>, value: number) {
        this.currentDisplayMaze.assertVertex(gridCell);
        if(this.currentDisplaySolution.getVertexValue(gridCell) !== 0) {
            if(value === 0) {return;}
            this.changeSolutionVertex(gridCell, 0)
        }
        this.currentDisplayMaze.setVertexValue(gridCell, value);
        this.display.changeGridCell(gridCell, value);
    }
    changeSolutionVertex(gridCell: Tuple<N>, value: number) {
        this.currentDisplaySolution.assertVertex(gridCell);
        if(this.currentDisplayMaze.getVertexValue(gridCell) === 1) {return;}
        this.currentDisplaySolution.setVertexValue(gridCell, value);
        this.display.changeGridCell(gridCell, value)
    }
    /**
     * A method for generating a new maze to display on the grid. It will wipe the display and await the playback sequence.
     * @param generationAlgorithm The MazeGenerator to use
     * @param dimensions Optionally new dimensions for the maze
     * @returns A playback controller which has methods for controlling the playback sequence.
     */
    generateNewMaze(generationAlgorithm: MazeGeneratorId, dimensions?: Tuple<N>, ...config: any[]) {
        //Generates a new maze
        const newMaze = this.mazeGenerators[generationAlgorithm](dimensions ? dimensions : this.currentDisplayMaze.dimensions, ...config)

        //Generates the starting point for the playback
        this.currentDisplayMaze = new NGrid(newMaze.maze.dimensions, 0)
        this.currentDisplaySolution = new NGrid(newMaze.maze.dimensions, 0)
        this.display.setMaze(this.currentDisplayMaze);
        //If new dimensions were given they are saved and the Root and Goal are moved to their new locations.
        if(dimensions) {
            this.#mazeRoot = dimensions.map(() => 0) as Tuple<N>;
            this.#mazeGoal = dimensions.map((value) => value-1) as Tuple<N>;
            this.display.moveSpecialGridCell("root", this.#mazeRoot)
            this.display.moveSpecialGridCell("goal", this.#mazeGoal)
        }
        return(new GenerationPlaybackAPI(this.changeMazeVertex.bind(this), newMaze))
    }
    /**
     * A method for generating a new solution to the current maze.
     * @param solvingAlgorithm The MazeSolver to use
     * @returns A playback controller which has methods for controlling the playback sequence.
     */
    generateSolution(solvingAlgorithm: MazeSolverId) {
        this.currentMazeSolver = this.mazeSolvers[solvingAlgorithm];
        const newSolution = this.currentMazeSolver(this.currentDisplayMaze, this.#mazeRoot, this.#mazeGoal)
        return(new SolutionPlaybackAPI(this.changeSolutionVertex.bind(this), newSolution))
    }
    updateSolution() {
        if(!this.currentMazeSolver) {throw new Error("Tried to update solution but no mazeSolver is currently attatched")}
        const newSolution = this.currentMazeSolver(this.currentDisplayMaze, this.#mazeRoot, this.#mazeGoal);
        const gridCellUpdates = NGrid.NGridDifferences(this.currentDisplaySolution, newSolution.exploredVertexes);
        gridCellUpdates.vertexes.forEach((value, index) => {
            this.changeSolutionVertex(value, gridCellUpdates.values[index])
        })
        const newSolutionPlaybackAPI = new SolutionPlaybackAPI(this.changeSolutionVertex.bind(this), newSolution, true)
        newSolutionPlaybackAPI.displaySolution(true);
        return newSolutionPlaybackAPI
    }
}


class PlaybackAPI<N extends number>{
    playback: Vertex<N>[];
    progress: number;
    callback: (vertex: Vertex<N>, value: boolean) => void
    constructor(displayCallback: (vertex: Vertex<N>, value: boolean) => void, playback: Vertex<N>[], preDisplayed = false) {
        this.playback = playback
        this.callback = displayCallback
        this.progress = preDisplayed ? this.playback.length-1 : -1
    }
    step(direction:  "forwards" | "backwards"): boolean {
        if(direction === "forwards") {
            if(this.progress >= this.playback.length-1) {return false;}
            this.progress++
            const nextGridCell = this.playback[this.progress]
            this.callback(nextGridCell, true)
            return(true)
        } else {
            if(this.progress <= -1) {return false;}
            const nextGridCell = this.playback[this.progress]
            this.callback(nextGridCell, false)
            this.progress--
            return(true)
        }
    }
    displayFullPlayback(direction:  "forwards" | "backwards") {
        let returnValue = true;
        while(returnValue === true) {
            returnValue = this.step(direction)
        }
    }
}

class SolutionPlaybackAPI<N extends number> extends PlaybackAPI<N>{
    solution: Vertex<N>[] | undefined
    solutionCallback: (vertex: Vertex<N>, value: boolean) => void;
    displayingSolution: boolean = false;
    constructor(displayCallback: (vertex: Vertex<N>, value: number) => void, mazeSolution: MazeSolution<N>, preDisplayed = false) {
        super((vertex, value) => {displayCallback(vertex, value ? 2 : 0)}, mazeSolution.playback, preDisplayed);
        this.solutionCallback = (vertex: Vertex<N>, value: boolean) => {displayCallback(vertex, value ? 3 : 2)}
        this.solution = mazeSolution.solution;
    }
    displaySolution(value: boolean) {
        if(!this.solution) {return;}
        this.solution.forEach((solutionGridCell) => {
            this.solutionCallback(solutionGridCell, value)
        })
    }
    step(direction:  "forwards" | "backwards"): boolean {
        if(direction === "forwards") {
            if(this.progress === this.playback.length-1) {
                this.displaySolution(true)
                this.displayingSolution = true;
            }
        } else {
            if(this.displayingSolution) {
                this.displaySolution(false);
                this.displayingSolution = false;
            }
        }
        return super.step(direction)
    }
}

class GenerationPlaybackAPI<N extends number> extends PlaybackAPI<N>{
    constructor(displayCallback: (vertex: Vertex<N>, value: number) => void, mazeGenerated: MazeGenerated<N>) {
        super((vertex, value) => {
            const playbackValue = mazeGenerated.playback.values[this.progress]
            if(value === true) {
                displayCallback(vertex, playbackValue)
            } else {
                displayCallback(vertex, playbackValue === 1 ? 0 : 1)
            }
        }, mazeGenerated.playback.vertexes); //Cursed ☠️
    }
}

class MazeModel2D extends BaseMazeModel<2> {
    constructor(initialDimensions: Tuple<2>) {
        super(initialDimensions, new MazeDisplay2D("mazeWrapper"))
        this.mazeGenerators["Word Maze"] = wordPrimsAlgorithm
    }
}

class MazeModel3D extends BaseMazeModel<3> {
    constructor(initialdimensions: Tuple<3>) {
        super(initialdimensions, new MazeDisplay3D("mazeWrapper"))
    }
}


export {BaseMazeModel, MazeModel2D, MazeModel3D, MazeGeneratorId, MazeSolverId, PlaybackAPI, SolutionPlaybackAPI, GenerationPlaybackAPI}
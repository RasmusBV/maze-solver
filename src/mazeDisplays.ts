import { WebGLAPI } from "./components/webGLAPI.js";
import { NGrid, Tuple } from "./components/NGrid.js";
type specialGridCells = "goal" | "root"

type regularGridCells =  "maze-space" | "maze-wall" | "maze-explored" | "maze-solution"
interface MazeDisplay<N extends number> {
    /**
     * A method for moving a specialGridCell on the Display
     * @param type The type of specialGridCell to move
     * @param gridCell Where to move it to
     */
    moveSpecialGridCell(type: specialGridCells, gridCell: Tuple<N>): void,
    /**
     * A method for changing a gridCell on the Display
     * @param gridCell The gridCell to change
     * @param value The lookup value in mazeClassNames for the new ID of the gridCell on the Display
     */
    changeGridCell(gridCell: Tuple<N>, value: number): void,
    /**
     * A method for changing the entire maze at once.
     * It may be of a new dimension
     * @param maze A new maze to display
     */
    setMaze(maze: NGrid<N>): void,
    removeDisplay(): void,
    reziseDisplay(size: Tuple<2>): void
}
/**
 * A Class for interacting with the maze on the DOM.
 */
class MazeDisplay2D implements MazeDisplay<2> {
    #mazeElement: HTMLElement;
    gridApi: DOMGridAPI;
    constructor(elementId: string) {
        this.#mazeElement = this.#getMazeElement(elementId)
        this.gridApi = new DOMGridAPI(this.#mazeElement, {0: "maze-space", 1: "maze-wall", 2: "maze-explored", 3: "maze-solution"})
    }
    setMaze(maze: NGrid<2>) {
        this.gridApi.grid = maze;
    }
    changeGridCell(gridCell: [number, number], value: number|string) {
        this.gridApi.setGridCellValue(gridCell, value)
    }
    moveSpecialGridCell(type: specialGridCells, gridCell: [number, number]) {
        const newParent = this.gridApi.accessGridCell(gridCell)
        const element = document.querySelectorAll(`[${type}="true"]`)[0]
        if(element) {
            element.id = JSON.stringify(gridCell);
            newParent.appendChild(element);
            return;
        }
        //If the specialGridCell has been removed it generates a new one.
        const newElement = document.createElement("span")
        newElement.id = JSON.stringify(gridCell);
        newElement.className = "material-symbols-outlined";
        newElement.innerHTML = type === "goal" ?  "flag" : "home_pin"
        newElement.setAttribute(type, "true")
        newParent.appendChild(newElement)
    }

    #getMazeElement(elementId: string) {
        //Get the DOM element to anchor the maze to
        const mazeElement = document.getElementById(elementId);
        if(!mazeElement) {throw new ReferenceError(`No DOM element of the name: ${elementId}`)}
        return(mazeElement)
    }
    removeDisplay(): void {
        this.gridApi.changeSize([-this.gridApi.dimensions[0],-this.gridApi.dimensions[1]]);
    }
    reziseDisplay(size: Tuple<2>): void {
        
    }
}

/**
 * A Class for creating and manipulating grids on the DOM.
 * Is capable of changing the grid size and changing the id of its grid cells.
 */
class DOMGridAPI {
    dimensions: [number, number];
    #columns: HTMLElement[]
    #gridParent: HTMLElement;
    #getVertexId: (gridCell: [number, number]) => string;
    #gridClassNames: {[gridValue: number]: string};
    #reverseClassNames: {[className: string]: number};
    constructor(gridParent: HTMLElement, mazeClassNames: {[gridValue: number]: regularGridCells}, gridCellNamingScheme?: (gridCell: [number, number]) => string) {
        this.dimensions = [0,0]
        this.#columns = []
        this.#gridParent = gridParent;
        this.#gridClassNames = mazeClassNames;
        this.#reverseClassNames = this.#createReverseClassNames(mazeClassNames)
        this.#getVertexId = gridCellNamingScheme ? gridCellNamingScheme : gridCell => `[${gridCell[0]},${gridCell[1]}]`
    }

    /**
     * reverses the gridClassNames so it is possible to look up the value by the className
     * @param gridClassNames The gridClassNames provided for the constructor
     * @returns a reverse gridClassNames
     */
    #createReverseClassNames(gridClassNames: {[gridValue: string]: string}) {
        const reverseGridClassNames: {[className: string]: number} = {}
        Object.keys(gridClassNames).forEach((key) => {
            const value = gridClassNames[key]
            reverseGridClassNames[value] = parseInt(key)
        })
        return reverseGridClassNames
    }

    /**
     * This is for setting the entire grid of the DOM at the same time.
     */
    set grid(grid: NGrid<2>) {
        this.changeSize([grid.dimensions[0]-this.dimensions[0], grid.dimensions[1]-this.dimensions[1]])
        for(let i = 0; i < grid.dimensions[0]; i++) {
            for(let j = 0; j < grid.dimensions[1]; j++) {
                const vertex = [i,j];
                grid.assertVertex(vertex);
                const vertexValue = grid.getVertexValue(vertex);
                this.setGridCellValue([i,j], vertexValue)
            }
        }
    }

    /**
     * The method for changing the amount of columns in the grid.
     * Can both be a negative and positive amount to change it by.
     * @param amount the amount to change the amount of columns by
     */
    changeColumnNumber(amount: number): void {
        if(amount === 0) { return; }

        //If there needs to be added more columns
        if(amount > 0) {
            for(let i = 0; i < amount; i++) {
                //Creates the column
                const currentColumn = document.createElement("div");
                currentColumn.setAttribute("column", (this.dimensions[0]).toString());

                //Makes this column have as many rows as the other columns
                for(let j = 0; j < this.dimensions[1]; j++) {
                    const currentVertex = document.createElement("div");
                    currentVertex.id = this.#getVertexId([this.dimensions[0],j])
                    currentVertex.setAttribute("row", j.toString())
                    currentColumn.appendChild(currentVertex);
                }
                this.#gridParent.appendChild(currentColumn);

                //Adds the column to a list for referencing if they need to be removed
                this.#columns.push(currentColumn)
                this.dimensions[0]++
            }
        }

        //If columns need to be removed
        if(amount < 0) {

            //Uses the list of columns to one by one pop them and remove them from the dom.
            for(let i = 0; i > amount; i--) {
                const currentColumn = this.#columns.pop();
                if(currentColumn) {
                    currentColumn.remove()
                    this.dimensions[0]--
                }
            }
        }
    }

    /**
     * The method for changing the amount of rows in the grid.
     * Can both be a negative and positive amount to change it by.
     * @param amount the amount to change amount of rows by
     */
    changeRowNumber(amount: number) {
        if(amount === 0) {return} 

        if(amount > 0) {
            for(let i = 0; i < amount; i++) {
                for(let j = 0; j < this.#columns.length; j++) {
                    const currentColumn = this.#columns[j]
                    const currentVertex = document.createElement("div");
                    currentVertex.id = this.#getVertexId([j, this.dimensions[1]])
                    currentVertex.setAttribute("row", this.dimensions[1].toString())
                    currentColumn.appendChild(currentVertex);
                }
                this.dimensions[1]++
            }
        }

        if(amount < 0) {
            for(let i = 0; i > amount; i--) {
                const currentRow = document.querySelectorAll(`[row="${this.dimensions[1]-1}"]`)
                currentRow.forEach((gridCell) => {gridCell.remove()})
                this.dimensions[1]--
            }
        }
    }

    /**
     * A shorthand for changing both the amount of columns and rows at the same time.
     * @param amount the amount to change both the columns and rows by
     */
    changeSize(amount: [number, number]) {
        this.changeRowNumber(amount[1])
        this.changeColumnNumber(amount[0])
    }

    /**
     * The method for changing the className of grid cells
     * @param gridCell The vertex to change the className of
     * @param value The key for the className object provided or the actual className
     */
    setGridCellValue(gridCell: [number, number], value: number|string): void {
        const currentVertex = this.#columns[gridCell[0]].querySelectorAll(`[row="${gridCell[1]}"]`)[0]
        if(!currentVertex) {throw new RangeError(`No vertex on the DOM at: ${JSON.stringify(gridCell)}`)}
        if(typeof value === "string") {
            currentVertex.className = value
        } else {
            currentVertex.className = this.#gridClassNames[value]
        }
    }

    /**
     * The method for getting the className or the key of the className if it exists.
     * @param gridCell The grid cell you want the value of
     */
    getGridCellValue(gridCell: [number, number]) {
        const gridCellElement = this.accessGridCell(gridCell)
        if(typeof this.#reverseClassNames[gridCellElement.className] === "number") {
            return this.#reverseClassNames[gridCellElement.className]
        } else {
            return gridCellElement.className
        }
    }

    /**
     * A method for retrieving the HTMLElement that corresponds to that gridCell.
     * If that HTMLElement is modified it may cause undefined behaviour.
     * 
     * Use with caution!
     * @param gridCell the gridCell to access
     * @returns the HTMLElement that corresponds to that gridCell
     */
    accessGridCell(gridCell: [number, number]) {
        const gridCellElement = this.#columns[gridCell[0]].querySelectorAll(`[row="${gridCell[1]}"]`)[0]
        if(!gridCellElement) {throw new RangeError(`No vertex on the DOM at: ${JSON.stringify(gridCell)}`)}
        return(gridCellElement)
    }
}
//DONE FOR NOW !! VERY NICE :))) MEDIUM PROUD <3

class MazeDisplay3D implements MazeDisplay<3> {
    #mazeElement: HTMLElement
    #webGLAPI: WebGLAPI
    #canvas
    constructor(elementId: string) {
        this.#mazeElement = this.#getMazeElement(elementId)
        this.#canvas = document.createElement('canvas')
        this.#mazeElement.appendChild(this.#canvas)
        this.#webGLAPI = new WebGLAPI(this.#canvas);
    }
    moveSpecialGridCell(type: specialGridCells, gridCell: Tuple<3>) {

    }
    changeGridCell(gridCell: Tuple<3>, value: number) {
        this.#webGLAPI.setGridCellValue(gridCell, value)
    }
    setMaze(maze: NGrid<3>) {
        this.#webGLAPI.setGrid(maze)
    }
    #getMazeElement(elementId: string) {
        //Get the DOM element to anchor the maze to
        const mazeElement = document.getElementById(elementId);
        if(!mazeElement) {throw new ReferenceError(`No DOM element of the name: ${elementId}`)}
        return(mazeElement)
    }
    removeDisplay(): void {
        this.#webGLAPI.kill = true;
        this.#canvas.remove();
    }
    reziseDisplay(size: Tuple<2>): void {
        this.#webGLAPI.changeCanvasSize(size)
    }
}


export {MazeDisplay2D, MazeDisplay3D, MazeDisplay, specialGridCells, regularGridCells}
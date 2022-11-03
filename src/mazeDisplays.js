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
var _MazeDisplay2D_instances, _MazeDisplay2D_mazeElement, _MazeDisplay2D_getMazeElement, _DOMGridAPI_instances, _DOMGridAPI_columns, _DOMGridAPI_gridParent, _DOMGridAPI_getVertexId, _DOMGridAPI_gridClassNames, _DOMGridAPI_reverseClassNames, _DOMGridAPI_createReverseClassNames, _MazeDisplay3D_instances, _MazeDisplay3D_mazeElement, _MazeDisplay3D_webGLAPI, _MazeDisplay3D_canvas, _MazeDisplay3D_getMazeElement;
import { WebGLAPI } from "./components/webGLAPI.js";
/**
 * A Class for interacting with the maze on the DOM.
 */
class MazeDisplay2D {
    constructor(elementId) {
        _MazeDisplay2D_instances.add(this);
        _MazeDisplay2D_mazeElement.set(this, void 0);
        __classPrivateFieldSet(this, _MazeDisplay2D_mazeElement, __classPrivateFieldGet(this, _MazeDisplay2D_instances, "m", _MazeDisplay2D_getMazeElement).call(this, elementId), "f");
        this.gridApi = new DOMGridAPI(__classPrivateFieldGet(this, _MazeDisplay2D_mazeElement, "f"), { 0: "maze-space", 1: "maze-wall", 2: "maze-explored", 3: "maze-solution" });
    }
    setMaze(maze) {
        this.gridApi.grid = maze;
    }
    changeGridCell(gridCell, value) {
        this.gridApi.setGridCellValue(gridCell, value);
    }
    moveSpecialGridCell(type, gridCell) {
        const newParent = this.gridApi.accessGridCell(gridCell);
        const element = document.querySelectorAll(`[${type}="true"]`)[0];
        if (element) {
            element.id = JSON.stringify(gridCell);
            newParent.appendChild(element);
            return;
        }
        //If the specialGridCell has been removed it generates a new one.
        const newElement = document.createElement("span");
        newElement.id = JSON.stringify(gridCell);
        newElement.className = "material-symbols-outlined";
        newElement.innerHTML = type === "goal" ? "flag" : "home_pin";
        newElement.setAttribute(type, "true");
        newParent.appendChild(newElement);
    }
    removeDisplay() {
        this.gridApi.changeSize([-this.gridApi.dimensions[0], -this.gridApi.dimensions[1]]);
    }
    reziseDisplay(size) {
    }
}
_MazeDisplay2D_mazeElement = new WeakMap(), _MazeDisplay2D_instances = new WeakSet(), _MazeDisplay2D_getMazeElement = function _MazeDisplay2D_getMazeElement(elementId) {
    //Get the DOM element to anchor the maze to
    const mazeElement = document.getElementById(elementId);
    if (!mazeElement) {
        throw new ReferenceError(`No DOM element of the name: ${elementId}`);
    }
    return (mazeElement);
};
/**
 * A Class for creating and manipulating grids on the DOM.
 * Is capable of changing the grid size and changing the id of its grid cells.
 */
class DOMGridAPI {
    constructor(gridParent, mazeClassNames, gridCellNamingScheme) {
        _DOMGridAPI_instances.add(this);
        _DOMGridAPI_columns.set(this, void 0);
        _DOMGridAPI_gridParent.set(this, void 0);
        _DOMGridAPI_getVertexId.set(this, void 0);
        _DOMGridAPI_gridClassNames.set(this, void 0);
        _DOMGridAPI_reverseClassNames.set(this, void 0);
        this.dimensions = [0, 0];
        __classPrivateFieldSet(this, _DOMGridAPI_columns, [], "f");
        __classPrivateFieldSet(this, _DOMGridAPI_gridParent, gridParent, "f");
        __classPrivateFieldSet(this, _DOMGridAPI_gridClassNames, mazeClassNames, "f");
        __classPrivateFieldSet(this, _DOMGridAPI_reverseClassNames, __classPrivateFieldGet(this, _DOMGridAPI_instances, "m", _DOMGridAPI_createReverseClassNames).call(this, mazeClassNames), "f");
        __classPrivateFieldSet(this, _DOMGridAPI_getVertexId, gridCellNamingScheme ? gridCellNamingScheme : gridCell => `[${gridCell[0]},${gridCell[1]}]`, "f");
    }
    /**
     * This is for setting the entire grid of the DOM at the same time.
     */
    set grid(grid) {
        this.changeSize([grid.dimensions[0] - this.dimensions[0], grid.dimensions[1] - this.dimensions[1]]);
        for (let i = 0; i < grid.dimensions[0]; i++) {
            for (let j = 0; j < grid.dimensions[1]; j++) {
                const vertex = [i, j];
                grid.assertVertex(vertex);
                const vertexValue = grid.getVertexValue(vertex);
                this.setGridCellValue([i, j], vertexValue);
            }
        }
    }
    /**
     * The method for changing the amount of columns in the grid.
     * Can both be a negative and positive amount to change it by.
     * @param amount the amount to change the amount of columns by
     */
    changeColumnNumber(amount) {
        if (amount === 0) {
            return;
        }
        //If there needs to be added more columns
        if (amount > 0) {
            for (let i = 0; i < amount; i++) {
                //Creates the column
                const currentColumn = document.createElement("div");
                currentColumn.setAttribute("column", (this.dimensions[0]).toString());
                //Makes this column have as many rows as the other columns
                for (let j = 0; j < this.dimensions[1]; j++) {
                    const currentVertex = document.createElement("div");
                    currentVertex.id = __classPrivateFieldGet(this, _DOMGridAPI_getVertexId, "f").call(this, [this.dimensions[0], j]);
                    currentVertex.setAttribute("row", j.toString());
                    currentColumn.appendChild(currentVertex);
                }
                __classPrivateFieldGet(this, _DOMGridAPI_gridParent, "f").appendChild(currentColumn);
                //Adds the column to a list for referencing if they need to be removed
                __classPrivateFieldGet(this, _DOMGridAPI_columns, "f").push(currentColumn);
                this.dimensions[0]++;
            }
        }
        //If columns need to be removed
        if (amount < 0) {
            //Uses the list of columns to one by one pop them and remove them from the dom.
            for (let i = 0; i > amount; i--) {
                const currentColumn = __classPrivateFieldGet(this, _DOMGridAPI_columns, "f").pop();
                if (currentColumn) {
                    currentColumn.remove();
                    this.dimensions[0]--;
                }
            }
        }
    }
    /**
     * The method for changing the amount of rows in the grid.
     * Can both be a negative and positive amount to change it by.
     * @param amount the amount to change amount of rows by
     */
    changeRowNumber(amount) {
        if (amount === 0) {
            return;
        }
        if (amount > 0) {
            for (let i = 0; i < amount; i++) {
                for (let j = 0; j < __classPrivateFieldGet(this, _DOMGridAPI_columns, "f").length; j++) {
                    const currentColumn = __classPrivateFieldGet(this, _DOMGridAPI_columns, "f")[j];
                    const currentVertex = document.createElement("div");
                    currentVertex.id = __classPrivateFieldGet(this, _DOMGridAPI_getVertexId, "f").call(this, [j, this.dimensions[1]]);
                    currentVertex.setAttribute("row", this.dimensions[1].toString());
                    currentColumn.appendChild(currentVertex);
                }
                this.dimensions[1]++;
            }
        }
        if (amount < 0) {
            for (let i = 0; i > amount; i--) {
                const currentRow = document.querySelectorAll(`[row="${this.dimensions[1] - 1}"]`);
                currentRow.forEach((gridCell) => { gridCell.remove(); });
                this.dimensions[1]--;
            }
        }
    }
    /**
     * A shorthand for changing both the amount of columns and rows at the same time.
     * @param amount the amount to change both the columns and rows by
     */
    changeSize(amount) {
        this.changeRowNumber(amount[1]);
        this.changeColumnNumber(amount[0]);
    }
    /**
     * The method for changing the className of grid cells
     * @param gridCell The vertex to change the className of
     * @param value The key for the className object provided or the actual className
     */
    setGridCellValue(gridCell, value) {
        const currentVertex = __classPrivateFieldGet(this, _DOMGridAPI_columns, "f")[gridCell[0]].querySelectorAll(`[row="${gridCell[1]}"]`)[0];
        if (!currentVertex) {
            throw new RangeError(`No vertex on the DOM at: ${JSON.stringify(gridCell)}`);
        }
        if (typeof value === "string") {
            currentVertex.className = value;
        }
        else {
            currentVertex.className = __classPrivateFieldGet(this, _DOMGridAPI_gridClassNames, "f")[value];
        }
    }
    /**
     * The method for getting the className or the key of the className if it exists.
     * @param gridCell The grid cell you want the value of
     */
    getGridCellValue(gridCell) {
        const gridCellElement = this.accessGridCell(gridCell);
        if (typeof __classPrivateFieldGet(this, _DOMGridAPI_reverseClassNames, "f")[gridCellElement.className] === "number") {
            return __classPrivateFieldGet(this, _DOMGridAPI_reverseClassNames, "f")[gridCellElement.className];
        }
        else {
            return gridCellElement.className;
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
    accessGridCell(gridCell) {
        const gridCellElement = __classPrivateFieldGet(this, _DOMGridAPI_columns, "f")[gridCell[0]].querySelectorAll(`[row="${gridCell[1]}"]`)[0];
        if (!gridCellElement) {
            throw new RangeError(`No vertex on the DOM at: ${JSON.stringify(gridCell)}`);
        }
        return (gridCellElement);
    }
}
_DOMGridAPI_columns = new WeakMap(), _DOMGridAPI_gridParent = new WeakMap(), _DOMGridAPI_getVertexId = new WeakMap(), _DOMGridAPI_gridClassNames = new WeakMap(), _DOMGridAPI_reverseClassNames = new WeakMap(), _DOMGridAPI_instances = new WeakSet(), _DOMGridAPI_createReverseClassNames = function _DOMGridAPI_createReverseClassNames(gridClassNames) {
    const reverseGridClassNames = {};
    Object.keys(gridClassNames).forEach((key) => {
        const value = gridClassNames[key];
        reverseGridClassNames[value] = parseInt(key);
    });
    return reverseGridClassNames;
};
//DONE FOR NOW !! VERY NICE :))) MEDIUM PROUD <3
class MazeDisplay3D {
    constructor(elementId) {
        _MazeDisplay3D_instances.add(this);
        _MazeDisplay3D_mazeElement.set(this, void 0);
        _MazeDisplay3D_webGLAPI.set(this, void 0);
        _MazeDisplay3D_canvas.set(this, void 0);
        __classPrivateFieldSet(this, _MazeDisplay3D_mazeElement, __classPrivateFieldGet(this, _MazeDisplay3D_instances, "m", _MazeDisplay3D_getMazeElement).call(this, elementId), "f");
        __classPrivateFieldSet(this, _MazeDisplay3D_canvas, document.createElement('canvas'), "f");
        __classPrivateFieldGet(this, _MazeDisplay3D_mazeElement, "f").appendChild(__classPrivateFieldGet(this, _MazeDisplay3D_canvas, "f"));
        __classPrivateFieldSet(this, _MazeDisplay3D_webGLAPI, new WebGLAPI(__classPrivateFieldGet(this, _MazeDisplay3D_canvas, "f")), "f");
    }
    moveSpecialGridCell(type, gridCell) {
    }
    changeGridCell(gridCell, value) {
        __classPrivateFieldGet(this, _MazeDisplay3D_webGLAPI, "f").setGridCellValue(gridCell, value);
    }
    setMaze(maze) {
        __classPrivateFieldGet(this, _MazeDisplay3D_webGLAPI, "f").setGrid(maze);
    }
    removeDisplay() {
        __classPrivateFieldGet(this, _MazeDisplay3D_webGLAPI, "f").kill = true;
        __classPrivateFieldGet(this, _MazeDisplay3D_canvas, "f").remove();
    }
    reziseDisplay(size) {
        __classPrivateFieldGet(this, _MazeDisplay3D_webGLAPI, "f").changeCanvasSize(size);
    }
}
_MazeDisplay3D_mazeElement = new WeakMap(), _MazeDisplay3D_webGLAPI = new WeakMap(), _MazeDisplay3D_canvas = new WeakMap(), _MazeDisplay3D_instances = new WeakSet(), _MazeDisplay3D_getMazeElement = function _MazeDisplay3D_getMazeElement(elementId) {
    //Get the DOM element to anchor the maze to
    const mazeElement = document.getElementById(elementId);
    if (!mazeElement) {
        throw new ReferenceError(`No DOM element of the name: ${elementId}`);
    }
    return (mazeElement);
};
export { MazeDisplay2D, MazeDisplay3D };

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
var _NGrid_instances, _NGrid_lookupTable, _NGrid_grid, _NGrid_generateLookupTable, _NGrid_gridLayoutGenerator, _NGrid_getIndexFromVertex, _NGrid_getVertexFromIndex;
/**
 * An Class for simulating an N-Dimensional array that contains useful
 * methods for accessing the values in the grid as if it was N-Dimensional.
 * @param dimensions The dimensions of the grid.
 * @param initialValue The initial value to fill the NGrid with.
 */
class NGrid {
    constructor(dimensions, initialValue) {
        _NGrid_instances.add(this);
        _NGrid_lookupTable.set(this, void 0);
        _NGrid_grid.set(this, void 0);
        this.dimensions = dimensions;
        __classPrivateFieldSet(this, _NGrid_lookupTable, __classPrivateFieldGet(this, _NGrid_instances, "m", _NGrid_generateLookupTable).call(this, dimensions), "f");
        __classPrivateFieldSet(this, _NGrid_grid, __classPrivateFieldGet(this, _NGrid_instances, "m", _NGrid_gridLayoutGenerator).call(this, dimensions, initialValue), "f");
    }
    //Static methods:
    /**
     * A static method for determining if 2 vertexes of any NGrid are identical.
     * @param vertex1 The first vertex
     * @param vertex2 The second vertex
     * @returns true if it is the same vertex, false if not
     */
    static sameVertex(vertex1, vertex2) {
        for (let i = 0; i < vertex1.length; i++) {
            if (vertex1[i] !== vertex2[i]) {
                return false;
            }
        }
        return true;
    }
    /**
    * A static method for subtracting 2 vertexes
    * @param vertex1 The first vertex
    * @param vertex2 The second vertex
    * @returns the 2 vertexes subtracted from each other
    */
    static subtractVertexes(vertex1, vertex2) {
        return (vertex1.map((value, index) => value - vertex2[index]));
    }
    /**
     * A static method for adding 2 vertexes
     * @param vertex1 The first vertex
     * @param vertex2 The second vertex
     * @returns the 2 vertexes added to each other
     */
    static addVertexes(vertex1, vertex2) {
        return (vertex1.map((value, index) => value + vertex2[index]));
    }
    /**
     * Scales a vertex by a scalar
     * @param vertex The vertex to scale
     * @param scalar The scalar of the vertex
     * @param snap If the vertex is to be rounded to the neares whole number
     * @returns The scaled vertex
     */
    static scaleVertex(vertex, scalar, snap = true) {
        if (snap) {
            return (vertex.map((value) => Math.round(value * scalar)));
        }
        else {
            return (vertex.map((value) => value * scalar));
        }
    }
    /**
     * For interpolating between 2 vertexes
     * @param gridCell1 A Vertex
     * @param gridCell2 Another Vertex
     * @returns An array of the vertexes in a straight line between the 2 vertexes
     */
    static interpolateBetweenVertexes(vertex1, vertex2) {
        const difference = this.subtractVertexes(vertex1, vertex2);
        for (const magnitude of difference) {
            if (Math.abs(magnitude) > 1) {
                const totalLength = Math.sqrt((difference.map((value) => value * value)).reduce((previousValue, currentValue) => previousValue + currentValue, 0));
                const normalizedVector = this.scaleVertex(difference, 1 / totalLength, false);
                let vertexArray = [];
                for (let currentLength = 0; currentLength < totalLength; currentLength += 1) {
                    const newVertex = this.subtractVertexes(vertex1, this.scaleVertex(normalizedVector, currentLength));
                    vertexArray.push(newVertex);
                }
                const returnArray = Array.from(new Set(vertexArray.map((value) => JSON.stringify(value))), (value) => JSON.parse(value)); //Magic to remove duplicates 🤠
                return returnArray;
            }
        }
        return ([vertex1, vertex2]);
    }
    static NGridDifferences(oldGrid, newGrid) {
        const indexes = [];
        const values = __classPrivateFieldGet(newGrid, _NGrid_grid, "f").filter((value, index) => {
            const difference = value !== __classPrivateFieldGet(oldGrid, _NGrid_grid, "f")[index];
            difference ? indexes.push(index) : null;
            return difference;
        });
        const vertexes = indexes.map((value) => __classPrivateFieldGet(oldGrid, _NGrid_instances, "m", _NGrid_getVertexFromIndex).call(oldGrid, value));
        return ({ vertexes: vertexes, values: values });
    }
    /**
     * A method for determining if a vertex is both
     * - The same dimensionality as the NGrid.
     * - Within the bounds of the NGrid.
     * @param vertex The vertex to check.
     * @returns If the vertex is within the NGrid.
     */
    assertVertex(vertex) {
        if (vertex.length !== this.dimensions.length) {
            throw new RangeError(`The vertex is ${vertex.length}-dimensional, while the maze is ${this.dimensions.length}-dimensional`);
        }
        for (let i = 0; i < vertex.length; i++) {
            if (vertex[i] >= this.dimensions[i] || vertex[i] < 0) {
                throw new RangeError(`The vertex is not within the bounds of the maze.\nVertex: ${JSON.stringify(vertex)}\nBounds: ${JSON.stringify(this.dimensions)}`);
            }
        }
    }
    /**
     * Returns the origin vertex. Can be used as a fallback if a function
     * Recieves a number[] which is not a Vertex.
     * @returns The Vertex with all 0's
     */
    getOriginVertex() {
        const originArray = this.dimensions.map(value => 0);
        const originVertex = originArray;
        return (originVertex);
    }
    /**
     * Changes the value of a vertex within the NGrid
     * @param vertex The vertex in the NGrid to change the value of
     * @param value the new value for the vertex
     * @returns null if the vertex is not within the NGrid
     */
    setVertexValue(vertex, value) {
        const vertexIndex = __classPrivateFieldGet(this, _NGrid_instances, "m", _NGrid_getIndexFromVertex).call(this, vertex);
        __classPrivateFieldGet(this, _NGrid_grid, "f")[vertexIndex] = value;
    }
    /**
     * Returns the value of the vertex in the NGrid
     * @param vertex The vertex to check
     * @returns The value of the vertex in the maze or null if the vertex is not within the NGrid
     */
    getVertexValue(vertex) {
        const vertexIndex = __classPrivateFieldGet(this, _NGrid_instances, "m", _NGrid_getIndexFromVertex).call(this, vertex);
        return (__classPrivateFieldGet(this, _NGrid_grid, "f")[vertexIndex]);
    }
    ;
    getVertexNeighbours(vertex, directionless) {
        const allNeighbours = {};
        const allNeighboursDirectonLess = {};
        const addNeighbour = (vertex, direction) => {
            try {
                this.assertVertex(vertex);
            }
            catch (e) {
                return;
            }
            const vertexValue = this.getVertexValue(vertex);
            if (directionless) {
                vertexValue in allNeighboursDirectonLess ? allNeighboursDirectonLess[vertexValue].push(vertex) : allNeighboursDirectonLess[vertexValue] = [vertex];
            }
            if (!(vertexValue in allNeighbours)) {
                allNeighbours[vertexValue] = {};
            }
            direction in allNeighbours[vertexValue] ? allNeighbours[vertexValue][direction].push(vertex) : allNeighbours[vertexValue][direction] = [vertex];
        };
        for (let i = 0; i < vertex.length; i++) {
            //For each dimension the vertex is defined in generates the
            //coordinates for the neighbours of the vertex that exist.
            const backwards = vertex.map((n, j) => { return (j === i ? n - 1 : n); });
            addNeighbour(backwards, i);
            const forwards = vertex.map((n, j) => { return (j === i ? n + 1 : n); });
            addNeighbour(forwards, i);
        }
        if (directionless) {
            return (allNeighboursDirectonLess);
        }
        return (allNeighbours);
    }
    ;
    printGrid() {
        console.log(JSON.stringify(__classPrivateFieldGet(this, _NGrid_grid, "f")));
    }
    /**
     * A method for inserting a subgrid into a larger grid.
     * @param subGrid the subGrid to insert into the grid
     * @param corner the corner to insert the subgrid at
     * @param callbackFn an optional callback function to apply every time a vertex on the main grid is changed.
     */
    insertSubGrid(subGrid, corner, callbackFn) {
        const offSet = __classPrivateFieldGet(this, _NGrid_instances, "m", _NGrid_getIndexFromVertex).call(this, corner);
        let subGridMap = [0];
        for (let i = 0; i < subGrid.dimensions.length; i++) {
            let newSubGridMap = [];
            for (let j = 0; j < subGrid.dimensions[subGrid.dimensions.length - i - 1]; j++) {
                newSubGridMap.push(...subGridMap.map((value) => value + __classPrivateFieldGet(this, _NGrid_lookupTable, "f")[subGrid.dimensions.length - i - 1] * j));
            }
            subGridMap = newSubGridMap;
        }
        subGridMap = subGridMap.map((value) => value + offSet);
        if (callbackFn) {
            for (let i = 0; i < __classPrivateFieldGet(subGrid, _NGrid_grid, "f").length; i++) {
                __classPrivateFieldGet(this, _NGrid_grid, "f")[subGridMap[i]] = __classPrivateFieldGet(subGrid, _NGrid_grid, "f")[i];
                callbackFn(__classPrivateFieldGet(this, _NGrid_instances, "m", _NGrid_getVertexFromIndex).call(this, subGridMap[i]), __classPrivateFieldGet(subGrid, _NGrid_grid, "f")[i]);
            }
        }
        else {
            for (let i = 0; i < __classPrivateFieldGet(subGrid, _NGrid_grid, "f").length; i++) {
                __classPrivateFieldGet(this, _NGrid_grid, "f")[subGridMap[i]] = __classPrivateFieldGet(subGrid, _NGrid_grid, "f")[i];
            }
        }
    }
}
_NGrid_lookupTable = new WeakMap(), _NGrid_grid = new WeakMap(), _NGrid_instances = new WeakSet(), _NGrid_generateLookupTable = function _NGrid_generateLookupTable(dimensions) {
    return dimensions.map((_, i, array) => array.slice(i + 1).reduce((total, value) => total * value, 1));
}, _NGrid_gridLayoutGenerator = function _NGrid_gridLayoutGenerator(dimensions, initialValue) {
    if (dimensions.length < 1) {
        throw new RangeError(`Grid has to have at least 1 axis`);
    }
    dimensions.forEach((value, i) => {
        if (value < 1) {
            throw new RangeError(`Only values larger than 0 are allowed in the dimensions.\nYour dimensions: ${JSON.stringify(dimensions)}\nError found at:  ${"+".repeat(dimensions[i].toString().length).padStart(JSON.stringify(dimensions.slice(0, i)).length + 2, " ")}`);
        }
    });
    return (new Array(dimensions.reduce((total, value) => total * value, 1)).fill(initialValue));
}, _NGrid_getIndexFromVertex = function _NGrid_getIndexFromVertex(vertex) {
    let runningTotal = 0;
    for (let i = 0; i < vertex.length; i++) {
        runningTotal += vertex[i] * __classPrivateFieldGet(this, _NGrid_lookupTable, "f")[i];
    }
    return (runningTotal);
}, _NGrid_getVertexFromIndex = function _NGrid_getVertexFromIndex(index) {
    let runningTotal = index;
    const returnVertex = this.getOriginVertex();
    for (let i = 0; i < __classPrivateFieldGet(this, _NGrid_lookupTable, "f").length; i++) {
        returnVertex[i] = Math.floor(runningTotal / __classPrivateFieldGet(this, _NGrid_lookupTable, "f")[i]);
        runningTotal = runningTotal % __classPrivateFieldGet(this, _NGrid_lookupTable, "f")[i];
    }
    return returnVertex;
};
//Words cannot descibe it :)) Is veery nice
export { NGrid };

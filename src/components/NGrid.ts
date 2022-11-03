
type Brand<K, T> = K & { __brand: T }
type Tuple<N extends number> = N extends N ? number extends N ? number[] : _TupleOf<number, N, []> : never;
type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N ? R : _TupleOf<T, N, [T, ...R]>;

type Vertex<N extends number> = Brand<Tuple<N>, 'Vertex'>

/**
 * An Class for simulating an N-Dimensional array that contains useful
 * methods for accessing the values in the grid as if it was N-Dimensional. 
 * @param dimensions The dimensions of the grid.
 * @param initialValue The initial value to fill the NGrid with.
 */
class NGrid<N extends number> {
    dimensions: Tuple<N>;
    #lookupTable: Tuple<N>;
    #grid: number[];
    constructor(dimensions: Tuple<N>, initialValue: number) {
        this.dimensions = dimensions;
        this.#lookupTable = this.#generateLookupTable(dimensions)
        this.#grid = this.#gridLayoutGenerator(dimensions, initialValue)
    }
    //Static methods:
    /**
     * A static method for determining if 2 vertexes of any NGrid are identical.
     * @param vertex1 The first vertex
     * @param vertex2 The second vertex
     * @returns true if it is the same vertex, false if not
     */
    static sameVertex<T extends number>(vertex1: Tuple<T>, vertex2: Tuple<T>) {
        for(let i = 0; i < vertex1.length; i++) {
            if(vertex1[i] !== vertex2[i]) {
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
    static subtractVertexes<T extends number>(vertex1: Tuple<T>, vertex2: Tuple<T>) {
        return(vertex1.map((value, index) => value - vertex2[index])) as Tuple<T>
    }
    /**
     * A static method for adding 2 vertexes
     * @param vertex1 The first vertex
     * @param vertex2 The second vertex
     * @returns the 2 vertexes added to each other
     */
    static addVertexes<T extends number>(vertex1: Tuple<T>, vertex2: Tuple<T>) {
        return(vertex1.map((value, index) => value + vertex2[index])) as Tuple<T>
    }
    /**
     * Scales a vertex by a scalar
     * @param vertex The vertex to scale
     * @param scalar The scalar of the vertex
     * @param snap If the vertex is to be rounded to the neares whole number
     * @returns The scaled vertex
     */
    static scaleVertex<T extends number>(vertex: Tuple<T>, scalar: number, snap: boolean = true) {
        if(snap) {
            return(vertex.map((value) => Math.round(value*scalar))) as Tuple<T>
        } else {
            return(vertex.map((value) => value*scalar)) as Tuple<T>
        }
    }
    /**
     * For interpolating between 2 vertexes
     * @param gridCell1 A Vertex
     * @param gridCell2 Another Vertex
     * @returns An array of the vertexes in a straight line between the 2 vertexes
     */
    static interpolateBetweenVertexes<T extends number>(vertex1: Tuple<T>, vertex2: Tuple<T>): Tuple<T>[] {
        const difference = this.subtractVertexes(vertex1, vertex2);
        for(const magnitude of difference) {
            if(Math.abs(magnitude) > 1) {
                const totalLength = Math.sqrt((difference.map((value) => value * value)).reduce((previousValue, currentValue) => previousValue + currentValue,0));
                const normalizedVector = this.scaleVertex(difference, 1/totalLength, false)
                let vertexArray: Tuple<T>[] = []
                for(let currentLength = 0; currentLength < totalLength; currentLength += 1) {
                    const newVertex: Tuple<T> = this.subtractVertexes(vertex1, this.scaleVertex(normalizedVector, currentLength))
                    vertexArray.push(newVertex)
                }
                const returnArray = Array.from(new Set(vertexArray.map((value) => JSON.stringify(value))), (value) => JSON.parse(value)) as Tuple<T>[] //Magic to remove duplicates 🤠
                return returnArray;
            }
        }
        return([vertex1, vertex2])
    }
    static NGridDifferences<N extends number>(oldGrid: NGrid<N>, newGrid: NGrid<N>) {
        const indexes: number[] = []
        const values = newGrid.#grid.filter((value, index) => {
            const difference = value !== oldGrid.#grid[index]
            difference ? indexes.push(index) : null
            return difference
        })
        const vertexes = indexes.map((value) => oldGrid.#getVertexFromIndex(value))
        return({vertexes: vertexes, values: values})
    }
    #generateLookupTable(dimensions: Tuple<N>) {
        return(dimensions.map((_, i, array) => array.slice(i+1).reduce((total, value) => total*value, 1)) as Tuple<N>)
    }
    /**
     * Generates an Array of the size needed if a nested array of the size
     * specified by the dimensions was given.
     *
     * Ex:
     * - dimensions = [2,3]
     * - returns [0,0,0,0,0,0]
     *
     * @param dimensions the dimensions of the NGrid 
     * @returns an Array of the size specified by the dimensions of the maze initialized with zeroes
    */
    #gridLayoutGenerator(dimensions: Tuple<N>, initialValue: number):number[] {
        if(dimensions.length < 1) {
            throw new RangeError(`Grid has to have at least 1 axis`)
        }
        dimensions.forEach((value, i) => {if(value < 1) {
            throw new RangeError(`Only values larger than 0 are allowed in the dimensions.\nYour dimensions: ${JSON.stringify(dimensions)}\nError found at:  ${"+".repeat(dimensions[i].toString().length).padStart(JSON.stringify(dimensions.slice(0,i)).length+2, " ")}`)}
        })
        return(new Array(dimensions.reduce((total, value) => total*value, 1)).fill(initialValue))
    }
    /**
     * A method for determining if a vertex is both
     * - The same dimensionality as the NGrid.
     * - Within the bounds of the NGrid.
     * @param vertex The vertex to check.
     * @returns If the vertex is within the NGrid.
     */
    assertVertex(vertex: number[]): asserts vertex is Vertex<N> {
        if(vertex.length !== this.dimensions.length) {
            throw new RangeError(`The vertex is ${vertex.length}-dimensional, while the maze is ${this.dimensions.length}-dimensional`)
        }
        for(let i = 0; i < vertex.length; i++) {
            if(vertex[i] >= this.dimensions[i] || vertex[i] < 0) {
                throw new RangeError(`The vertex is not within the bounds of the maze.\nVertex: ${JSON.stringify(vertex)}\nBounds: ${JSON.stringify(this.dimensions)}`);
            }
        }
    }
    /**
     * Returns the origin vertex. Can be used as a fallback if a function
     * Recieves a number[] which is not a Vertex.
     * @returns The Vertex with all 0's
     */
    getOriginVertex(): Vertex<N> {
        const originArray = this.dimensions.map(value => 0)
        const originVertex = originArray as Vertex<N>
        return(originVertex)
    }
    #getIndexFromVertex(vertex: Vertex<N>): number {
        let runningTotal: number = 0;
        for(let i = 0; i < vertex.length; i++) {
            runningTotal += vertex[i]*this.#lookupTable[i]
        }
        return(runningTotal)
    }
    #getVertexFromIndex(index: number): Vertex<N> {
        let runningTotal = index
        const returnVertex = this.getOriginVertex()
        for(let i = 0; i < this.#lookupTable.length; i++) {
            returnVertex[i] = Math.floor(runningTotal/this.#lookupTable[i])
            runningTotal = runningTotal % this.#lookupTable[i]
        }
        return returnVertex
    }
    /**
     * Changes the value of a vertex within the NGrid
     * @param vertex The vertex in the NGrid to change the value of
     * @param value the new value for the vertex
     * @returns null if the vertex is not within the NGrid
     */
    setVertexValue(vertex: Vertex<N>, value: number): void {
        const vertexIndex = this.#getIndexFromVertex(vertex)
        this.#grid[vertexIndex] = value
    }
    /**
     * Returns the value of the vertex in the NGrid
     * @param vertex The vertex to check
     * @returns The value of the vertex in the maze or null if the vertex is not within the NGrid
     */
    getVertexValue(vertex: Vertex<N>): number {
        const vertexIndex = this.#getIndexFromVertex(vertex)
        return(this.#grid[vertexIndex])
    };
    /**
     * Checks what neighbours a vertex has and returns them with their values.
     * If the vertex is not valid returns null.
     * @param vertex The vertex to check.
     * @return An object with the vertex values of the neighbours as keys and an array of the neighbours with that value as values or null.
     */
    getVertexNeighbours(vertex: Vertex<N>, directionless: true): {[vertexValue: number]: Array<Vertex<N>>}
    getVertexNeighbours(vertex: Vertex<N>): {[vertexValue: number]: {[direction: number]: Array<Vertex<N>>}}
    getVertexNeighbours(vertex: Vertex<N>, directionless?: true): {[vertexValue: number]: {[direction: number]: Array<Vertex<N>>}} | {[vertexValue: number]: Array<Vertex<N>>}{
        const allNeighbours: {[vertexValue: number]: {[direction: number]: Array<Vertex<N>>}} = {}
        const allNeighboursDirectonLess: {[vertexValue: number]: Array<Vertex<N>>} = {}
        const addNeighbour = (vertex: number[], direction:number) => {
            try {
                this.assertVertex(vertex)
            } catch(e) {
                return;
            }
            const vertexValue = this.getVertexValue(vertex);
            if(directionless) {
                vertexValue in allNeighboursDirectonLess ? allNeighboursDirectonLess[vertexValue].push(vertex) : allNeighboursDirectonLess[vertexValue] = [vertex];
            }
            if(!(vertexValue in allNeighbours)) {
                allNeighbours[vertexValue] = {}
            }
            direction in allNeighbours[vertexValue] ? allNeighbours[vertexValue][direction].push(vertex) : allNeighbours[vertexValue][direction] = [vertex];
        }
        for (let i = 0; i < vertex.length; i++) {
            //For each dimension the vertex is defined in generates the
            //coordinates for the neighbours of the vertex that exist.
            const backwards = vertex.map((n, j) => { return (j === i ? n - 1 : n); });
            addNeighbour(backwards, i)
            const forwards = vertex.map((n, j) => { return (j === i ? n + 1 : n); });
            addNeighbour(forwards, i)
        }
        if(directionless) {return(allNeighboursDirectonLess)}
        return (allNeighbours);
    };
    printGrid() {
        console.log(JSON.stringify(this.#grid))
    }
    /**
     * A method for inserting a subgrid into a larger grid.
     * @param subGrid the subGrid to insert into the grid
     * @param corner the corner to insert the subgrid at
     * @param callbackFn an optional callback function to apply every time a vertex on the main grid is changed.
     */
    insertSubGrid(subGrid: NGrid<N>, corner: Vertex<N>, callbackFn?: (vertex: Vertex<N>, value: number) => void) {
        const offSet = this.#getIndexFromVertex(corner)
        let subGridMap = [0]
        for(let i = 0; i < subGrid.dimensions.length; i++) {
            let newSubGridMap = []
            for(let j = 0; j < subGrid.dimensions[subGrid.dimensions.length-i-1]; j++) {
                newSubGridMap.push(...subGridMap.map((value) => value + this.#lookupTable[subGrid.dimensions.length-i-1]*j))
            }
            subGridMap = newSubGridMap
        }
        subGridMap = subGridMap.map((value) => value+offSet);
        if(callbackFn) {
            for(let i = 0; i < subGrid.#grid.length; i++) {
                this.#grid[subGridMap[i]] = subGrid.#grid[i]
                callbackFn(this.#getVertexFromIndex(subGridMap[i]), subGrid.#grid[i])
            }
        } else {
            for(let i = 0; i < subGrid.#grid.length; i++) {
                this.#grid[subGridMap[i]] = subGrid.#grid[i]
            }
        }
        
    }
}
//Words cannot descibe it :)) Is veery nice


export {NGrid, Vertex, Tuple}
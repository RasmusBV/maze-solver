import {NGrid, Vertex, Tuple} from "../components/NGrid.js";
import {getWordPlayback} from "../components/fontGenerator.js"
import {QueueSystem, SelectorType} from "../components/queueSystem.js"


interface MazeGenerated<N extends number> {
    playback: {
        vertexes: Vertex<N>[]
        values: number[]
    }
    maze: NGrid<N>
}

class MazeGeneratorUtils<N extends number>{
    mazeGrid: NGrid<N>;
    mazeGenerationPlaybackVertexes: Vertex<N>[] = [];
    mazeGenerationPlaybackValues: number[] = [];
    constructor(dimensions: Tuple<N>) {
        this.mazeGrid = new NGrid(dimensions, 0)
    }
    changeMazeGrid(vertex: Vertex<N>, value: number) {
        this.mazeGrid.setVertexValue(vertex, value)
        this.mazeGenerationPlaybackValues.push(value)
        this.mazeGenerationPlaybackVertexes.push(vertex)
    }
}


//Fix me for N-dimensional case :))
function filledMazePreprocessor2(mazeGeneratorUtils: MazeGeneratorUtils<2>) {
    const passes = mazeGeneratorUtils.mazeGrid.dimensions[0] + mazeGeneratorUtils.mazeGrid.dimensions[1] - 1
    for(let i = 0; i < passes; i++) {
        for(let j = 0; j < i+1; j++) {
            if(j >= mazeGeneratorUtils.mazeGrid.dimensions[0]) {continue}
            if(i-j >= mazeGeneratorUtils.mazeGrid.dimensions[1]) {continue}
            const vertex = [j,i-j]
            mazeGeneratorUtils.mazeGrid.assertVertex(vertex)
            mazeGeneratorUtils.changeMazeGrid(vertex,1)
        }
    }
    return mazeGeneratorUtils
}

function filledMazePreprocessor<N extends number>(mazeGeneratorUtils: MazeGeneratorUtils<N>) {
    const passes = mazeGeneratorUtils.mazeGrid.dimensions.reduce((previousValue, currentValue) => previousValue + currentValue-1, 0);
    const recursiveWhatever = (currentPass: number, dimensions: Tuple<N> , axis: number = 0, currentSum: number = 0): number[][] => {
        if(axis === dimensions.length-1) {
            return [[currentPass-currentSum]]
        }
        let returnArray: number[][] = []
        for(let j = 0; j <= currentPass-currentSum; j++) {
            if(j >= dimensions[axis]) {continue;}
            const returnValue = recursiveWhatever(currentPass, dimensions, axis+1, currentSum+j)
            returnArray.push(...returnValue.map((value) => [j, ...value]))
        }
        return returnArray
    }
    for(let i = 0; i <= passes; i++) {
        const generatedLayer = recursiveWhatever(i, mazeGeneratorUtils.mazeGrid.dimensions)
        for(const vertex of generatedLayer) {
            try {
                mazeGeneratorUtils.mazeGrid.assertVertex(vertex)
            } catch (e) {
                continue;
            }
            mazeGeneratorUtils.changeMazeGrid(vertex,1)
        }
    }
    return(mazeGeneratorUtils)
}

function wordMazePreprocessor(mazeGeneratorUitls: MazeGeneratorUtils<2>, word: string, type: "builder" | "carver") {
    const wordPlayback = getWordPlayback(word, [Math.floor(mazeGeneratorUitls.mazeGrid.dimensions[0]/2), Math.floor(mazeGeneratorUitls.mazeGrid.dimensions[1]/2)])
    if(wordPlayback.width + 4 > mazeGeneratorUitls.mazeGrid.dimensions[0]) {throw new RangeError(`Word: ${word} too long to display on the given dimensions.\nWord width: ${wordPlayback.width}, maze width: ${mazeGeneratorUitls.mazeGrid.dimensions[0]}`)}
    wordPlayback.playback.forEach((vertex) => {
        mazeGeneratorUitls.mazeGrid.assertVertex(vertex)
        mazeGeneratorUitls.changeMazeGrid(vertex, type === "builder" ? 1 : 0)
    })
    return mazeGeneratorUitls
}

function emptyMaze<N extends number>(dimension: Tuple<N>): MazeGenerated<N> {
    return({playback: {vertexes: [], values: []}, maze: new NGrid(dimension, 0)})
}


/**
 * A function for generating a maze on an NGrid with Prims Algorithm.
 * @param mazeGeneratorUtils The current state of the maze being generated. Expects a board of mostly walls
 * @returns The new state of the maze being generated
 */
function primsAlgorithm<N extends number>(mazeGeneratorUtils: MazeGeneratorUtils<N>, selectorType: SelectorType, vertexSorting: (vertexes: Vertex<N>[]) => Vertex<N>[]) {
    const startLocation = new Array(mazeGeneratorUtils.mazeGrid.dimensions.length).fill(0) as Tuple<N>
    const queue = new QueueSystem<Vertex<N>>(selectorType)
    mazeGeneratorUtils.mazeGrid.assertVertex(startLocation)
    mazeGeneratorUtils.changeMazeGrid(startLocation, 0);
    vertexSorting(mazeGeneratorUtils.mazeGrid.getVertexNeighbours(startLocation, true)[1]).forEach((vertex) => queue.add(vertex));

    while(queue.queue.length > 0) {
        const wall = queue.next();
        const wallNeighbours = mazeGeneratorUtils.mazeGrid.getVertexNeighbours(wall, true)[0];
        if(wallNeighbours.length !== 1) {continue;}
        const neighbouringVertex = wallNeighbours[0];
        const newVertex = neighbouringVertex.map((value, index) => 2*wall[index] - value)
        try {
            mazeGeneratorUtils.mazeGrid.assertVertex(newVertex)
        } catch(e) {
            continue;
        }
        mazeGeneratorUtils.changeMazeGrid(wall, 0);
        mazeGeneratorUtils.changeMazeGrid(newVertex, 0);
        const newWalls = mazeGeneratorUtils.mazeGrid.getVertexNeighbours(newVertex, true)[1];
        if(newWalls.length === 0) {continue;}
        vertexSorting(newWalls).forEach((newWall) => {queue.add(newWall)})
    }
    return(mazeGeneratorUtils)
}

function recursiveDivision<N extends number>(dimensions: Tuple<N>) {
    const mazeGeneratorUtils = new MazeGeneratorUtils(dimensions)
    
    function bisect(smallCorner: Tuple<N>, bigCorner: Tuple<N>) {
        const difference = NGrid.subtractVertexes(bigCorner, smallCorner)
        if(Math.max(...difference) === 1) {return;}

        //Get the axis which is currently the biggest
        const axis = difference.indexOf(Math.max(...difference))

        //Get all odd indexes between smallCorner and bigCorner on the chosen axis
        const indexes = new Array(difference[axis]).fill(0)
        .map((_, index) => index+smallCorner[axis])
        .filter((value) => value%2!==0)

        //Choose a random index
        const placement = indexes[Math.floor(Math.random() * indexes.length)]
        
        //Generate the face which will devide the corners
        const bisectionFace = new NGrid(difference.map((value, index) => index === axis ? 1 : value) as Tuple<N>, 1)
        const bisectionFaceHole = bisectionFace.dimensions.map((value, index) => {
            if(index === axis) {return 0}
            let randomValue = Math.floor(Math.random() * value)
            if(randomValue % 2 !== 1) {
                return randomValue
            } else {
                return randomValue === 0 ? randomValue+1 : randomValue-1
            }
        })
        bisectionFace.setVertexValue(bisectionFaceHole as Vertex<N>, 0)

        //Generate the coordinate for the corner of the insertion
        const subGridCoordinate = smallCorner.map((value, index) => index === axis ? placement : value)
        mazeGeneratorUtils.mazeGrid.insertSubGrid(bisectionFace, subGridCoordinate as Vertex<N>, (vertex: Vertex<N>, value: number) => {
            mazeGeneratorUtils.mazeGenerationPlaybackValues.push(value)
            mazeGeneratorUtils.mazeGenerationPlaybackVertexes.push(vertex)
        })
        bisect(smallCorner, bigCorner.map((value, index) => index === axis ? placement : value) as Tuple<N>)
        bisect(smallCorner.map((value, index) => index === axis ? placement+1 : value) as Tuple<N>, bigCorner)
    }
    bisect(mazeGeneratorUtils.mazeGrid.getOriginVertex(), mazeGeneratorUtils.mazeGrid.dimensions)
    return(
        {
            playback: {
                vertexes: mazeGeneratorUtils.mazeGenerationPlaybackVertexes,
                values: mazeGeneratorUtils.mazeGenerationPlaybackValues
            },
            maze: mazeGeneratorUtils.mazeGrid
        }
    )
}

function kruskalsAlgorithm<N extends number>(mazeGeneratorUtils: MazeGeneratorUtils<N>) {
    const recursiveSetCreator = <T extends number>(dimensions: Tuple<T>): Tuple<T>[] => {
        if(dimensions.length === 1) {
            return new Array(Math.floor(dimensions[0]/2)+1).fill(0).map((_, index) => [index*2]) as Tuple<T>[]
        }
        const returnArray: Tuple<T>[] = []
        for(let i = 0; i < dimensions[0]; i+=2) {
            returnArray.push(...recursiveSetCreator(dimensions.slice(1)).map((value: number[]) => [i, ...value]) as Tuple<T>[])
        }
        return(returnArray)
    }
    const wallListCreator = <N extends number>(dimensions: Tuple<N>): Tuple<N>[] => {
        const wallList: Tuple<N>[] = []
        for(let i = 0; i < dimensions.length; i++) {
            wallList.push(...recursiveSetCreator(dimensions).map((value) => value.map((number, index) => index === i ? number+1 : number)) as Tuple<N>[])
        }
        return wallList
    }
    const wallToCells = (wall: Tuple<N>) => {
        const cell1 = wall.map((value) => value%2 === 0 ? value : value+1)
        
        const cell2 = wall.map((value) => value%2 === 0 ? value : value-1)

    }

    const cellSet = recursiveSetCreator<N>(mazeGeneratorUtils.mazeGrid.dimensions).map((value) => JSON.stringify(value)) as Tuple<N>[]
    const wallList = wallListCreator(mazeGeneratorUtils.mazeGrid.dimensions)
    
    
    return mazeGeneratorUtils
}

function plainPrimsAlgorithm<N extends number>(dimensions: Tuple<N>) {
    const mazeGenerated = primsAlgorithm(filledMazePreprocessor(new MazeGeneratorUtils(dimensions)), "random", (vertexes) => vertexes.sort(() => 0.5 - Math.random()))
    return(
        {
            playback: {
                vertexes: mazeGenerated.mazeGenerationPlaybackVertexes,
                values: mazeGenerated.mazeGenerationPlaybackValues
            },
            maze: mazeGenerated.mazeGrid
        }
    )
}

function wordPrimsAlgorithm(dimensions: Tuple<2>, word: string) {
    const mazeGenerated = primsAlgorithm(wordMazePreprocessor(filledMazePreprocessor(new MazeGeneratorUtils(dimensions)), word, "carver"), "random", (vertexes) => vertexes.sort(() => 0.5 - Math.random()))
    return(
        {
            playback: {
                vertexes: mazeGenerated.mazeGenerationPlaybackVertexes,
                values: mazeGenerated.mazeGenerationPlaybackValues
            },
            maze: mazeGenerated.mazeGrid
        }
    )
}

function depthFirst<N extends number>(dimensions: Tuple<N>) {
    const mazeGenerated = primsAlgorithm(filledMazePreprocessor(new MazeGeneratorUtils(dimensions)), "pop", (vertexes) => vertexes.sort((a, b) => 0.5 - Math.random()))
    return(
        {
            playback: {
                vertexes: mazeGenerated.mazeGenerationPlaybackVertexes,
                values: mazeGenerated.mazeGenerationPlaybackValues
            },
            maze: mazeGenerated.mazeGrid
        }
    )
}

function plainKruskalsAlgorithm(dimensions: Tuple<2>) {
    const mazeGenerated = kruskalsAlgorithm(filledMazePreprocessor(new MazeGeneratorUtils(dimensions)))
    return(
        {
            playback: {
                vertexes: mazeGenerated.mazeGenerationPlaybackVertexes,
                values: mazeGenerated.mazeGenerationPlaybackValues
            },
            maze: mazeGenerated.mazeGrid
        }
    )
}

export {emptyMaze, plainPrimsAlgorithm, MazeGenerated, recursiveDivision, wordPrimsAlgorithm, depthFirst, plainKruskalsAlgorithm}
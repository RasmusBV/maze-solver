import { NGrid } from "../components/NGrid.js";
import { getWordPlayback } from "../components/fontGenerator.js";
import { QueueSystem } from "../components/queueSystem.js";
class MazeGeneratorUtils {
    constructor(dimensions) {
        this.mazeGenerationPlaybackVertexes = [];
        this.mazeGenerationPlaybackValues = [];
        this.mazeGrid = new NGrid(dimensions, 0);
    }
    changeMazeGrid(vertex, value) {
        this.mazeGrid.setVertexValue(vertex, value);
        this.mazeGenerationPlaybackValues.push(value);
        this.mazeGenerationPlaybackVertexes.push(vertex);
    }
}
//Fix me for N-dimensional case :))
function filledMazePreprocessor2(mazeGeneratorUtils) {
    const passes = mazeGeneratorUtils.mazeGrid.dimensions[0] + mazeGeneratorUtils.mazeGrid.dimensions[1] - 1;
    for (let i = 0; i < passes; i++) {
        for (let j = 0; j < i + 1; j++) {
            if (j >= mazeGeneratorUtils.mazeGrid.dimensions[0]) {
                continue;
            }
            if (i - j >= mazeGeneratorUtils.mazeGrid.dimensions[1]) {
                continue;
            }
            const vertex = [j, i - j];
            mazeGeneratorUtils.mazeGrid.assertVertex(vertex);
            mazeGeneratorUtils.changeMazeGrid(vertex, 1);
        }
    }
    return mazeGeneratorUtils;
}
function filledMazePreprocessor(mazeGeneratorUtils) {
    const passes = mazeGeneratorUtils.mazeGrid.dimensions.reduce((previousValue, currentValue) => previousValue + currentValue - 1, 0);
    const recursiveWhatever = (currentPass, dimensions, axis = 0, currentSum = 0) => {
        if (axis === dimensions.length - 1) {
            return [[currentPass - currentSum]];
        }
        let returnArray = [];
        for (let j = 0; j <= currentPass - currentSum; j++) {
            if (j >= dimensions[axis]) {
                continue;
            }
            const returnValue = recursiveWhatever(currentPass, dimensions, axis + 1, currentSum + j);
            returnArray.push(...returnValue.map((value) => [j, ...value]));
        }
        return returnArray;
    };
    for (let i = 0; i <= passes; i++) {
        const generatedLayer = recursiveWhatever(i, mazeGeneratorUtils.mazeGrid.dimensions);
        for (const vertex of generatedLayer) {
            try {
                mazeGeneratorUtils.mazeGrid.assertVertex(vertex);
            }
            catch (e) {
                continue;
            }
            mazeGeneratorUtils.changeMazeGrid(vertex, 1);
        }
    }
    return (mazeGeneratorUtils);
}
function wordMazePreprocessor(mazeGeneratorUitls, word, type) {
    const wordPlayback = getWordPlayback(word, [Math.floor(mazeGeneratorUitls.mazeGrid.dimensions[0] / 2), Math.floor(mazeGeneratorUitls.mazeGrid.dimensions[1] / 2)]);
    if (wordPlayback.width + 4 > mazeGeneratorUitls.mazeGrid.dimensions[0]) {
        throw new RangeError(`Word: ${word} too long to display on the given dimensions.\nWord width: ${wordPlayback.width}, maze width: ${mazeGeneratorUitls.mazeGrid.dimensions[0]}`);
    }
    wordPlayback.playback.forEach((vertex) => {
        mazeGeneratorUitls.mazeGrid.assertVertex(vertex);
        mazeGeneratorUitls.changeMazeGrid(vertex, type === "builder" ? 1 : 0);
    });
    return mazeGeneratorUitls;
}
function emptyMaze(dimension) {
    return ({ playback: { vertexes: [], values: [] }, maze: new NGrid(dimension, 0) });
}
/**
 * A function for generating a maze on an NGrid with Prims Algorithm.
 * @param mazeGeneratorUtils The current state of the maze being generated. Expects a board of mostly walls
 * @returns The new state of the maze being generated
 */
function primsAlgorithm(mazeGeneratorUtils, selectorType, vertexSorting) {
    const startLocation = new Array(mazeGeneratorUtils.mazeGrid.dimensions.length).fill(0);
    const queue = new QueueSystem(selectorType);
    mazeGeneratorUtils.mazeGrid.assertVertex(startLocation);
    mazeGeneratorUtils.changeMazeGrid(startLocation, 0);
    vertexSorting(mazeGeneratorUtils.mazeGrid.getVertexNeighbours(startLocation, true)[1]).forEach((vertex) => queue.add(vertex));
    while (queue.queue.length > 0) {
        const wall = queue.next();
        const wallNeighbours = mazeGeneratorUtils.mazeGrid.getVertexNeighbours(wall, true)[0];
        if (wallNeighbours.length !== 1) {
            continue;
        }
        const neighbouringVertex = wallNeighbours[0];
        const newVertex = neighbouringVertex.map((value, index) => 2 * wall[index] - value);
        try {
            mazeGeneratorUtils.mazeGrid.assertVertex(newVertex);
        }
        catch (e) {
            continue;
        }
        mazeGeneratorUtils.changeMazeGrid(wall, 0);
        mazeGeneratorUtils.changeMazeGrid(newVertex, 0);
        const newWalls = mazeGeneratorUtils.mazeGrid.getVertexNeighbours(newVertex, true)[1];
        if (newWalls.length === 0) {
            continue;
        }
        vertexSorting(newWalls).forEach((newWall) => { queue.add(newWall); });
    }
    return (mazeGeneratorUtils);
}
function recursiveDivision(dimensions) {
    const mazeGeneratorUtils = new MazeGeneratorUtils(dimensions);
    function bisect(smallCorner, bigCorner) {
        const difference = NGrid.subtractVertexes(bigCorner, smallCorner);
        if (Math.max(...difference) === 1) {
            return;
        }
        //Get the axis which is currently the biggest
        const axis = difference.indexOf(Math.max(...difference));
        //Get all odd indexes between smallCorner and bigCorner on the chosen axis
        const indexes = new Array(difference[axis]).fill(0)
            .map((_, index) => index + smallCorner[axis])
            .filter((value) => value % 2 !== 0);
        //Choose a random index
        const placement = indexes[Math.floor(Math.random() * indexes.length)];
        //Generate the face which will devide the corners
        const bisectionFace = new NGrid(difference.map((value, index) => index === axis ? 1 : value), 1);
        const bisectionFaceHole = bisectionFace.dimensions.map((value, index) => {
            if (index === axis) {
                return 0;
            }
            let randomValue = Math.floor(Math.random() * value);
            if (randomValue % 2 !== 1) {
                return randomValue;
            }
            else {
                return randomValue === 0 ? randomValue + 1 : randomValue - 1;
            }
        });
        bisectionFace.setVertexValue(bisectionFaceHole, 0);
        //Generate the coordinate for the corner of the insertion
        const subGridCoordinate = smallCorner.map((value, index) => index === axis ? placement : value);
        mazeGeneratorUtils.mazeGrid.insertSubGrid(bisectionFace, subGridCoordinate, (vertex, value) => {
            mazeGeneratorUtils.mazeGenerationPlaybackValues.push(value);
            mazeGeneratorUtils.mazeGenerationPlaybackVertexes.push(vertex);
        });
        bisect(smallCorner, bigCorner.map((value, index) => index === axis ? placement : value));
        bisect(smallCorner.map((value, index) => index === axis ? placement + 1 : value), bigCorner);
    }
    bisect(mazeGeneratorUtils.mazeGrid.getOriginVertex(), mazeGeneratorUtils.mazeGrid.dimensions);
    return ({
        playback: {
            vertexes: mazeGeneratorUtils.mazeGenerationPlaybackVertexes,
            values: mazeGeneratorUtils.mazeGenerationPlaybackValues
        },
        maze: mazeGeneratorUtils.mazeGrid
    });
}
function kruskalsAlgorithm(mazeGeneratorUtils) {
    const recursiveSetCreator = (dimensions) => {
        if (dimensions.length === 1) {
            return new Array(Math.floor(dimensions[0] / 2) + 1).fill(0).map((_, index) => [index * 2]);
        }
        const returnArray = [];
        for (let i = 0; i < dimensions[0]; i += 2) {
            returnArray.push(...recursiveSetCreator(dimensions.slice(1)).map((value) => [i, ...value]));
        }
        return (returnArray);
    };
    const wallListCreator = (dimensions) => {
        const wallList = [];
        for (let i = 0; i < dimensions.length; i++) {
            wallList.push(...recursiveSetCreator(dimensions).map((value) => value.map((number, index) => index === i ? number + 1 : number)));
        }
        return wallList;
    };
    const wallToCells = (wall) => {
        const cell1 = wall.map((value) => value % 2 === 0 ? value : value + 1);
        const cell2 = wall.map((value) => value % 2 === 0 ? value : value - 1);
    };
    const cellSet = recursiveSetCreator(mazeGeneratorUtils.mazeGrid.dimensions).map((value) => JSON.stringify(value));
    const wallList = wallListCreator(mazeGeneratorUtils.mazeGrid.dimensions);
    return mazeGeneratorUtils;
}
function plainPrimsAlgorithm(dimensions) {
    const mazeGenerated = primsAlgorithm(filledMazePreprocessor(new MazeGeneratorUtils(dimensions)), "random", (vertexes) => vertexes.sort(() => 0.5 - Math.random()));
    return ({
        playback: {
            vertexes: mazeGenerated.mazeGenerationPlaybackVertexes,
            values: mazeGenerated.mazeGenerationPlaybackValues
        },
        maze: mazeGenerated.mazeGrid
    });
}
function wordPrimsAlgorithm(dimensions, word) {
    const mazeGenerated = primsAlgorithm(wordMazePreprocessor(filledMazePreprocessor(new MazeGeneratorUtils(dimensions)), word, "carver"), "random", (vertexes) => vertexes.sort(() => 0.5 - Math.random()));
    return ({
        playback: {
            vertexes: mazeGenerated.mazeGenerationPlaybackVertexes,
            values: mazeGenerated.mazeGenerationPlaybackValues
        },
        maze: mazeGenerated.mazeGrid
    });
}
function depthFirst(dimensions) {
    const mazeGenerated = primsAlgorithm(filledMazePreprocessor(new MazeGeneratorUtils(dimensions)), "pop", (vertexes) => vertexes.sort((a, b) => 0.5 - Math.random()));
    return ({
        playback: {
            vertexes: mazeGenerated.mazeGenerationPlaybackVertexes,
            values: mazeGenerated.mazeGenerationPlaybackValues
        },
        maze: mazeGenerated.mazeGrid
    });
}
function plainKruskalsAlgorithm(dimensions) {
    const mazeGenerated = kruskalsAlgorithm(filledMazePreprocessor(new MazeGeneratorUtils(dimensions)));
    return ({
        playback: {
            vertexes: mazeGenerated.mazeGenerationPlaybackVertexes,
            values: mazeGenerated.mazeGenerationPlaybackValues
        },
        maze: mazeGenerated.mazeGrid
    });
}
export { emptyMaze, plainPrimsAlgorithm, recursiveDivision, wordPrimsAlgorithm, depthFirst, plainKruskalsAlgorithm };

import {NGrid, Vertex, Tuple} from "../components/NGrid.js";
import {WeightedQueue} from "../components/queueSystem.js"

interface MazeSolution<N extends number> {
    playback: Vertex<N>[]
    solution: Vertex<N>[] | undefined
    exploredVertexes: NGrid<N>
}
/**
 * A utility Class which all maze solving functions use
 */
class MazeSolverUtils<N extends number> {
    maze: NGrid<N>;
    exploredVertexes: NGrid<N>;
    mazeSolvingPlayback: Vertex<N>[];
    solution: NGrid<N>;
    constructor(maze: NGrid<N>) {
        this.maze = maze;
        this.exploredVertexes = new NGrid(maze.dimensions, 0);
        this.mazeSolvingPlayback = [];
        this.solution = new NGrid(maze.dimensions, 0)
    }
}

class CameFrom<N extends number> {
    cameFrom: {[childVertex: string]: Vertex<N>} = {};
    add(child: Vertex<N>, parent: Vertex<N>) {
        this.cameFrom[JSON.stringify(child)] = parent
    }
    getParent(child: Vertex<N>) {
        if(!(JSON.stringify(child) in this.cameFrom)) {throw new ReferenceError(`Vertex: ${child} was never searched`)}
        return(this.cameFrom[JSON.stringify(child)])
    }
    /**
     * Searches the cameFrom Dict for the goal by moving backwards from the goal
     * @param goal the goal of the maze searcher
     * @param start the root of the maze searcher
     */
    solutionSearcher(goal: Vertex<N>, start: Vertex<N>) {
        let mazeSolution: Vertex<N>[] = []
        let currentVertex = goal;
        let startString = JSON.stringify(start)
        if(!(JSON.stringify(currentVertex) in this.cameFrom)) {
            throw new ReferenceError(`No solution found, goal: ${goal} was never searched.`)
        }
        mazeSolution.push(currentVertex);
        while(JSON.stringify(currentVertex) !== startString) {
            currentVertex = this.cameFrom[JSON.stringify(currentVertex)];
            if(currentVertex === undefined) {
                console.table(mazeSolution)
                throw new ReferenceError(`No solution found, cameFrom chain ended at: ${currentVertex}`)
            }
            mazeSolution.push(currentVertex);
        }
        return(mazeSolution);
    }
}

function weightedQueueSearch<N extends number>(maze: NGrid<N>, start: Tuple<N>, goal: Tuple<N>, weightFunction: (vertex: Vertex<N>) => number) {
    const mazeSolverUtils: MazeSolverUtils<N> = new MazeSolverUtils(maze);
    const cameFrom: CameFrom<N> = new CameFrom();

    const queue = new WeightedQueue<Vertex<N>>((vertex: Vertex<N>) => {
        mazeSolverUtils.mazeSolvingPlayback.push(vertex);
        mazeSolverUtils.solution.setVertexValue(vertex, 2);
    })
    //Checks that the start and goal are valid Vertexes
    mazeSolverUtils.maze.assertVertex(start);
    mazeSolverUtils.maze.assertVertex(goal);

    //Setup for breadth first search
    mazeSolverUtils.exploredVertexes.setVertexValue(start, 1);
    queue.add(start, 1);

    //Main loop of breadth first search
    while(queue.hasNext() === true) {

        //Retrieves the next queue item
        const currentVertex = queue.next()

        //Checks if it has reached the goal yet
        if(NGrid.sameVertex(goal, currentVertex)) {break;}
        const currentVertexNeigbours = mazeSolverUtils.maze.getVertexNeighbours(currentVertex, true);
        //Loops over all the neighbours that are part of the maze and not a wall
        //If they are not explored yet they are added to the explored vertexes and the queue
        if(currentVertexNeigbours[0].length === 0) {continue;}
        currentVertexNeigbours[0].forEach((currentVertexNeigbour) => {
            if(mazeSolverUtils.exploredVertexes.getVertexValue(currentVertexNeigbour) === 0) {
                mazeSolverUtils.exploredVertexes.setVertexValue(currentVertexNeigbour, 1);
                queue.add(currentVertexNeigbour, weightFunction(currentVertexNeigbour))
                cameFrom.add(currentVertexNeigbour, currentVertex)
            }
        })
    }
    let mazeSolution: MazeSolution<N> = {
        playback: mazeSolverUtils.mazeSolvingPlayback,
        solution: undefined,
        exploredVertexes: mazeSolverUtils.solution
    };
    try {
        mazeSolution.solution = cameFrom.solutionSearcher(goal, start)
    } catch(e) {
    }
    return(mazeSolution)
}

/**
 * A mazesolving algorithm which randomly explores new vertexes in the maze
 * 
 * @param maze The maze to solve
 * @param start The start of the maze
 * @param goal The goal of the maze
 * @returns An Object containing the maze solution and a playback of the search
 */
function randomSearch<N extends number>(maze: NGrid<N>, start: Tuple<N>, goal: Tuple<N>) {
    return(weightedQueueSearch(maze, start, goal, (vertex: Vertex<N>) => Math.random()))
}
/**
 * A mazesolving algorithm which uses a the Breadth First Search Algorithm
 * 
 * @param maze The maze to solve
 * @param start The start of the maze
 * @param goal The goal of the maze
 * @returns An Object containing the maze solution and a playback of the search
 */
function breadthFirstSearch<N extends number>(maze: NGrid<N>, start: Tuple<N>, goal: Tuple<N>) {
    return(weightedQueueSearch(maze, start, goal, (vertex: Vertex<N>) => 1))
}
/**
 * A mazesolving algorithm which uses a the Depth First Search Algorithm
 * 
 * @param maze The maze to solve
 * @param start The start of the maze
 * @param goal The goal of the maze
 * @returns An Object containing the maze solution and a playback of the search
 */
function depthFirstSearchVertical<N extends number>(maze: NGrid<N>, start: Tuple<N>, goal: Tuple<N>) {
    return(weightedQueueSearch(maze, start, goal, (vertex: Vertex<N>) => Math.abs(vertex[0]-start[0])))
}
/**
 * A mazesolving algorithm which uses a the Depth First Search Algorithm
 * 
 * @param maze The maze to solve
 * @param start The start of the maze
 * @param goal The goal of the maze
 * @returns An Object containing the maze solution and a playback of the search
 */
function depthFirstSearchHorizontal<N extends number>(maze: NGrid<N>, start: Tuple<N>, goal: Tuple<N>) {
    return(weightedQueueSearch(maze, start, goal, (vertex: Vertex<N>) => Math.abs(vertex[1]-start[1])))
}


function AStar<N extends number>(maze: NGrid<N>, start: Tuple<N>, goal: Tuple<N>, heuristic: (vertex: Vertex<N>, goal: Vertex<N>) => number) {
    const mazeSolverUtils: MazeSolverUtils<N> = new MazeSolverUtils(maze);
    const cameFrom: CameFrom<N> = new CameFrom();

    const fScore = new WeightedQueue<Vertex<N>>((vertex: Vertex<N>) => {
        mazeSolverUtils.mazeSolvingPlayback.push(vertex);
        mazeSolverUtils.solution.setVertexValue(vertex, 2);
    })
    //Checks that the start and goal are valid Vertexes
    mazeSolverUtils.maze.assertVertex(start);
    mazeSolverUtils.maze.assertVertex(goal);

    //Setup for AStar
    fScore.add(start, heuristic(start, goal));
    const gScore: {[vertex: string]: number} = {}
    gScore[JSON.stringify(start)] = 0;

    //Main loop of AStar
    while(fScore.hasNext()) {
        const currentVertex = fScore.next()

        //Checks if it has reached the goal yet
        if(NGrid.sameVertex(goal, currentVertex)) {break;}
        const currentVertexNeigbours = mazeSolverUtils.maze.getVertexNeighbours(currentVertex, true);
        if(currentVertexNeigbours[0].length === 0) {continue;}
        currentVertexNeigbours[0].forEach((currentVertexNeigbour) => {
            const tentativeGScore = gScore[JSON.stringify(currentVertex)] + 1
            if(!(JSON.stringify(currentVertexNeigbour) in gScore) || tentativeGScore < gScore[JSON.stringify(currentVertexNeigbour)]) {
                cameFrom.add(currentVertexNeigbour, currentVertex);
                gScore[JSON.stringify(currentVertexNeigbour)] = tentativeGScore
                fScore.add(currentVertexNeigbour, tentativeGScore + heuristic(currentVertexNeigbour, goal))
            }
        })
    }
    let mazeSolution: MazeSolution<N> = {
        playback: mazeSolverUtils.mazeSolvingPlayback,
        solution: undefined,
        exploredVertexes: mazeSolverUtils.solution
    };
    try {
        mazeSolution.solution = cameFrom.solutionSearcher(goal, start)
    } catch(e) {
    }
    return(mazeSolution)
}
/**
 * A mazesolving algorithm which uses the A* Search Algorithm with a Euclidian Heuristic
 * 
 * @param maze The maze to solve
 * @param start The start of the maze
 * @param goal The goal of the maze
 * @returns An Object containing the maze solution and a playback of the search
 */
function AStarEuclidian<N extends number>(maze: NGrid<N>, start: Tuple<N>, goal: Tuple<N>) {
    const heuristic = (vertex: Vertex<N>, goal: Vertex<N>) => {
        const goalVector= NGrid.subtractVertexes(goal, vertex)
        const goalDistance = Math.sqrt((goalVector.map((value) => value * value)).reduce((previousValue, currentValue) => previousValue + currentValue,0));
        return(goalDistance)
    }
    return(AStar(maze, start, goal, heuristic))
}
/**
 * A mazesolving algorithm which uses the A* Search Algorithm with a Manhatten Heuristic
 * 
 * @param maze The maze to solve
 * @param start The start of the maze
 * @param goal The goal of the maze
 * @returns An Object containing the maze solution and a playback of the search
 */
function AStarManhatten<N extends number>(maze: NGrid<N>, start: Tuple<N>, goal: Tuple<N>) {
    const heuristic = (vertex: Vertex<N>, goal: Vertex<N>) => {
        const goalVector= NGrid.subtractVertexes(goal, vertex)
        const goalDistance = goalVector.reduce((previousValue, currentValue) => previousValue + Math.abs(currentValue),0);
        return(goalDistance)
    }
    return(AStar(maze, start, goal, heuristic))
}

export {breadthFirstSearch, depthFirstSearchHorizontal, depthFirstSearchVertical, randomSearch, MazeSolution, AStarEuclidian, AStarManhatten}
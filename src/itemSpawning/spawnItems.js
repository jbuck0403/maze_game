import MazeTools from "../mazeGeneration/mazeTools";
import { highlightCell } from "../../reflect/mutators";
import { emptySpace } from "../mazeGeneration/mazeGenerator";
import { r } from "../App";

const mazeTool = new MazeTools();

export default class Spawner {
  itemIDs = { wall: "x" };

  async spawnItem(itemToSpawn, numToSpawn, coords = false) {
    const maze = await mazeTool.createMazeCopy(); // create a copy of the current state of the maze

    const findRandomEmptySpace = () => {
      const returnRandomSpace = () => {
        return [
          Math.floor(Math.random() * highestY),
          Math.floor(Math.random() * highestX),
        ];
      };
      const [highestY, highestX] = [maze.length - 1, maze[0].length - 1];
      while (true) {
        let [row, col] = returnRandomSpace();
        if (maze[row][col] == emptySpace) return [row, col];
      }
    };

    const addItemToMaze = async (row, col) => {
      const mazeCopy = await mazeTool.createMazeCopy();
      mazeCopy[row][col] = `${itemToSpawn}`;

      r.mutate.updateMaze(mazeCopy);
    };

    for (let idx = 0; idx <= numToSpawn; idx++) {
      const [row, col] = coords ? coords : findRandomEmptySpace();
      addItemToMaze(row, col);
    }
  }
}

//randomly pick spaces and spawn the chosen item there
//make a mutator to ensure that the chosen item is always the item that was spawned
//divide the width of the map by the number of items to spawn

// const quarterSizeX = Math.floor(maze[0].length / 4)
// const quarterSizeY = Math.floor(maze.length / 4)
// const halfSizeX = Math.floor(maze[0].length / 2)
// const halfSizeY = Math.floor(maze.length / 2)
// const quadrant1 = [[0,0], [quarterSizeY, quarterSizeX]]
// const quadrant2 = [[quarterSizeY + 1, quarterSizeX + 1], [quarterSizeY * 2, quarterSizeX * 2]]
// const quadrant3 = [[halfSizeY + 1, halfSizeX + 1], [Math.floor(halfSizeY * 1.5), Math.floor(halfSizeX * 1.5)]]
// const quadrant4 = [[],[]]

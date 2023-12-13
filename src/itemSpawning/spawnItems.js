import MazeTools from "../mazeGeneration/mazeTools";
import { emptySpace } from "../mazeGeneration/mazeGenerator";
// import { r } from "../App";

export default class Spawner {
  constructor(room) {
    this.room = room;
  }

  itemIDs = { wall: "x" };
  mazeTool = new MazeTools(this.room);

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

      this.room.mutate.updateMaze(mazeCopy);
    };

    for (let idx = 0; idx <= numToSpawn; idx++) {
      const [row, col] = coords ? coords : findRandomEmptySpace();
      addItemToMaze(row, col);
    }
  }
}

import { r } from "../App";

export default class MazeTools {
  async createMazeCopy(maze = false) {
    if (maze == false) {
      maze = await r.mutate.getMaze();
    }
    return maze.map((row) => row.slice());
  }
}

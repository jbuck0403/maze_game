import Cell from "./CellClass";

export default class Maze {
  constructor(mazeSize) {
    this.maze = Array.from({ length: mazeSize }, () =>
      Array(mazeSize).fill(new Cell())
    );
  }
}

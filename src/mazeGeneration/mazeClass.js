import Cell from "./CellClass";

// export default class Maze {
//   constructor(mazeSize) {
//     this.maze = Array.from({ length: mazeSize }, (_, rowIndex) =>
//       Array(mazeSize)
//         .fill(null)
//         .map((_, colIndex) => new Cell(colIndex, rowIndex))
//     );
//   }
//   initializeNeighbors() {
//     const { maze } = this;
//     const numRows = maze.length;
//     const numCols = maze[0].length;

//     for (let row = 0; row < numRows; row++) {
//       for (let col = 0; col < numCols; col++) {
//         const cell = maze[row][col];

//         // Set neighbors
//         cell.adj.n = row > 0 ? maze[row - 1][col].c : null;
//         cell.adj.e = col < numCols - 1 ? maze[row][col + 1].c : null;
//         cell.adj.s = row < numRows - 1 ? maze[row + 1][col].c : null;
//         cell.adj.w = col > 0 ? maze[row][col - 1].c : null;
//       }
//     }
//   }
// }

export default class Maze {
  constructor(mazeSize) {
    this.maze = Array.from({ length: mazeSize }, (_) =>
      Array(mazeSize)
        .fill(null)
        .map((_) => new Cell())
    );
  }
  //   initializeNeighbors() {
  //     const { maze } = this;
  //     const numRows = maze.length;
  //     const numCols = maze[0].length;

  //     for (let row = 0; row < numRows; row++) {
  //       for (let col = 0; col < numCols; col++) {
  //         const cell = maze[row][col];

  //         // Set neighbors
  //         cell.adj.n = row > 0 ? maze[row - 1][col].c : null;
  //         cell.adj.e = col < numCols - 1 ? maze[row][col + 1].c : null;
  //         cell.adj.s = row < numRows - 1 ? maze[row + 1][col].c : null;
  //         cell.adj.w = col > 0 ? maze[row][col - 1].c : null;
  //       }
  //     }
  //   }
}

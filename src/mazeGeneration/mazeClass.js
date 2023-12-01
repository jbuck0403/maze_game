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
}

// function createInitialBlock() {
//   const x = "x";
//   function addFirstWall(block) {
//     const possibilities = [
//       [1, 2],
//       [3, 2],
//       [2, 1],
//       [2, 3],
//     ];
//     const randomChoice = Math.floor(Math.random() * 4);
//     block[2][2] = x;
//     block[possibilities[randomChoice][0]][possibilities[randomChoice][1]] = x;

//     return block;
//   }
//   let block = [
//     [x, x, x, x, x],
//     [x, 0, 0, 0, x],
//     [x, 0, 0, 0, x],
//     [x, 0, 0, 0, x],
//     [x, x, x, x, x],
//   ];

//   block = addFirstWall(block);
//   return block;
// }

// function makeBigger(block) {
//   let doubleBlock = block.map((row) => {
//     console.log(row);
//     return row + row.slice(1);
//   });

//   console.log(makeBigger(doubleBlock));
// }

// makeBigger(createInitialBlock());

//create a 5x5 maze with walls on the outside and the center plus one block to the nesw of the center
//example
/* where 0 is open space and 1 is wall
  1 1 1 1 1
  1 0 0 0 1
  1 0 0 0 1
  1 0 0 0 1
  1 1 1 1 1

  add the center wall
  1 1 1 1 1
  1 0 1 0 1
  1 0 1 0 1
  1 0 0 0 1
  1 1 1 1 1
  
  multiply by 4 but share the same connecting walls and make 1 wall into empty space on each new addition (marked as 0)
  1 1 1 1 1 1 1 1 1
  1 0 1 0 1 0 1 0 1
  1 0 1 0 1 0 1 0 1
  1 0 0 0 0 0 0 0 1
  1 0 1 1 1 1 1 0 1
  1 0 1 0 0 0 1 0 1
  1 0 1 0 1 0 1 0 1
  1 0 0 0 1 0 0 0 1
  1 1 1 1 1 1 1 1 1

  repeat

  double by copying the maze except for the 0th element of each row (the left column)
  1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
  1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1
  1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1
  1 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 1
  1 0 1 1 1 1 1 0 1 0 1 1 1 1 1 0 1
  1 0 1 0 0 0 1 0 1 0 1 0 0 0 1 0 1
  1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1
  1 0 0 0 1 0 0 0 1 0 0 0 1 0 0 0 1
  1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1

  add the bottom portion by copying everything except for the top row

  1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
  1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1
  1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1
  1 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 1
  1 0 1 1 1 1 1 0 1 0 1 1 1 1 1 0 1
  1 0 1 0 0 0 1 0 1 0 1 0 0 0 1 0 1
  1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1
  1 0 0 0 1 0 0 0 1 0 0 0 1 0 0 0 1
  1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
  1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1
  1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1
  1 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 1
  1 0 1 1 1 1 1 0 1 0 1 1 1 1 1 0 1
  1 0 1 0 0 0 1 0 1 0 1 0 0 0 1 0 1
  1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1
  1 0 0 0 1 0 0 0 1 0 0 0 1 0 0 0 1
  1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1

  open paths between the new additions (always an odd number, never 0 and never row/col.length - 1)

  1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
  1 0 1 0 1 0 1 0 0 0 1 0 1 0 1 0 1
  1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1
  1 0 0 0 0 0 0 0 1 0 0 0 0 0 0 0 1
  1 0 1 1 1 1 1 0 1 0 1 1 1 1 1 0 1
  1 0 1 0 0 0 1 0 1 0 1 0 0 0 1 0 1
  1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1
  1 0 0 0 1 0 0 0 1 0 0 0 1 0 0 0 1
  1 1 1 1 1 0 1 1 1 1 1 0 1 1 1 1 1
  1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1
  1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1
  1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1
  1 0 1 1 1 1 1 0 1 0 1 1 1 1 1 0 1
  1 0 1 0 0 0 1 0 1 0 1 0 0 0 1 0 1
  1 0 1 0 1 0 1 0 1 0 1 0 1 0 1 0 1
  1 0 0 0 1 0 0 0 1 0 0 0 1 0 0 0 1
  1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
*/

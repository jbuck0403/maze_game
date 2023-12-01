//utilizes a modified tessellation algorithm for maze generation

function createBlock(row, col, numBlocks) {
  let topPath = row == 0 ? false : true;
  let bottomPath = row == numBlocks ? false : true;
  let leftPath = col == 0 ? false : true;
  let rightPath = col == numBlocks ? false : true;
  const x = "x";
  const o = 0;
  let wallCoords;
  let block = [
    [x, x, x, x, x],
    [x, o, o, o, x],
    [x, o, o, o, x],
    [x, o, o, o, x],
    [x, x, x, x, x],
  ];

  function randomNum(max) {
    return Math.floor(Math.random() * max);
  }
  function addFirstWall() {
    const possibilities = [
      [1, 2],
      [3, 2],
      [2, 1],
      [2, 3],
      // [1, 1],
      // [1, 3],
      // [3, 1],
      // [3, 3],
    ];
    wallCoords = randomNum(possibilities.length);
    block[2][2] = x;
    block[possibilities[wallCoords][0]][possibilities[wallCoords][1]] = x;

    return block;
  }

  function addPaths(top = false, bottom = false, left = false, right = false) {
    const accessible = [];

    if (top) {
      const accessibleTop = [];
      block[1].forEach((cell, idx) => {
        if (cell != x) accessibleTop.push([0, idx]);
      });
      accessible.push(accessibleTop);
    }
    if (bottom) {
      const accessibleBottom = [];
      block[3].forEach((cell, idx) => {
        if (cell != x) accessibleBottom.push([4, idx]);
      });
      accessible.push(accessibleBottom);
    }
    if (left) {
      const accessibleLeft = [];
      block.forEach((row, idx) => {
        if (row[1] != x) accessibleLeft.push([idx, 0]);
      });
      accessible.push(accessibleLeft);
    }
    if (right) {
      const accessibleRight = [];
      block.forEach((row, idx) => {
        if (row[3] != x) accessibleRight.push([idx, 4]);
      });
      accessible.push(accessibleRight);
    }

    accessible.forEach((direction) => {
      const randWall = randomNum(direction.length);
      console.log(direction);
      block[direction[randWall][0]][direction[randWall][1]] = o;
    });
  }
  addFirstWall();
  addPaths(topPath, bottomPath, leftPath, rightPath);
  return block;
}

export default function createMazeFromBlocks(numBlocks = 5) {
  const removeBottom = (block) => {
    return block.slice(0, block.length - 1);
  };

  const removeRight = (block) => {
    return block.map((row) => {
      return row.slice(0, row.length - 1);
    });
  };

  const stitchBlocks = (blockRow) => {
    const stitchedBlockRow = [];
    let line = [];
    for (let idx = 0; idx < blockRow[0].length; idx++) {
      blockRow.forEach((block) => {
        line = [...line, ...block[idx]];
      });
      stitchedBlockRow.push(line);
      line = [];
    }
    return stitchedBlockRow;
  };

  let maze = [];
  let blockRow = [];
  for (let row = 0; row <= numBlocks; row++) {
    for (let col = 0; col <= numBlocks; col++) {
      if (row == numBlocks && col != numBlocks)
        blockRow.push(removeRight(createBlock(row, col, numBlocks)));
      else if (col == numBlocks)
        blockRow.push(createBlock(row, col, numBlocks));
      else
        blockRow.push(
          removeBottom(removeRight(createBlock(row, col, numBlocks)))
        );
    }
    maze = [...maze, ...stitchBlocks(blockRow)];
    blockRow = [];
  }
  return maze;
}

// export function makeBigger(block) {
//   let doubleBlock = block.map((row) => {
//     return [...row, ...row.slice(1)];
//   });

//   return doubleBlock;
// }

// export function doubleAgain(doubleBlock) {
//   doubleBlock.forEach((row, idx) => {
//     if (idx > 0) doubleBlock = [...doubleBlock, row];
//   });
//   return doubleBlock;
// }

//remove one wall on each of the 4 sides of each block
//at the end fill in all perimeter walls
// switch (direction) {
//   case "top":
//     block[1].forEach((cell, idx) => {
//       if (cell != x) accessible.push([0, idx]);
//     });
//   case "bottom":
//     block[3].forEach((cell, idx) => {
//       if (cell != x) accessible.push([4, idx]);
//     });
//   case "left":
//     block.forEach((row, idx) => {
//       if (row[1] != x) accessible.push(idx, 0);
//     });
//   case "right":
//     block.forEach((row, idx) => {
//       if (row[3] != x) accessible.push(idx, 4);
//     });
// }
// const createBlockNoLeftWall = (
//   topPath = false,
//   bottomPath = false,
//   leftPath = false,
//   rightPath = false
// ) => {
//   let block = createBlock(topPath, bottomPath, leftPath, rightPath);
//   const newBlock = block.map((row) => {
//     return row.slice(1);
//   });
//   return newBlock;
// };

// const createBlockNoBottomWall = (
//   topPath = false,
//   bottomPath = false,
//   leftPath = false,
//   rightPath = false
// ) => {
//   let block = createBlock(topPath, bottomPath, leftPath, rightPath);
//   const newBlock = [];
//   block.forEach((row, idx) => {
//     if (idx != block.length - 1) {
//       newBlock.push(row);
//     }
//   });
//   return newBlock;
// };

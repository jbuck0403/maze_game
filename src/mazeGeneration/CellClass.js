// export default class Cell {
//   constructor(
//     x,
//     y,
//     visited = false,
//     northWall = true,
//     eastWall = true,
//     southWall = true,
//     westWall = true
//   ) {
//     this.c = [x, y];
//     this.adj = { n: null, e: null, s: null, w: null };
//     this.v = visited;
//     this.n = northWall;
//     this.e = eastWall;
//     this.s = southWall;
//     this.w = westWall;
//   }
// }

export default class Cell {
  constructor(
    //   x,
    //   y,
    visited = 0,
    northWall = 1,
    eastWall = 1,
    southWall = 1,
    westWall = 1
  ) {
    this.d = Number(`${visited}${northWall}${eastWall}${southWall}${westWall}`);
  }
}

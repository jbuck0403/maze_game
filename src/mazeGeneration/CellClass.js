export default class Cell {
  constructor(
    visited = false,
    northWall = true,
    eastWall = true,
    southWall = true,
    westWall = true
  ) {
    this.visited = visited;
    this.northWall = northWall;
    this.eastWall = eastWall;
    this.southWall = southWall;
    this.westWall = westWall;
  }
}

import { passableSpace } from "./mazeGenerator";

export default class MazeMovement {
  checkObstacle = (maze, newPosition) => {
    if (passableSpace.includes(maze[newPosition[0]][newPosition[1]])) {
      return true;
    } else {
      return false;
    }
  };

  checkValidMove = (maze, newPosition, direction) => {
    switch (direction) {
      case "UP":
        if (newPosition[0] >= 0 && this.checkObstacle(maze, newPosition)) {
          return true;
        } else return false;
      case "DOWN":
        if (
          newPosition[0] < maze.length &&
          this.checkObstacle(maze, newPosition)
        )
          return true;
        else return false;
      case "LEFT":
        if (newPosition[0] >= 0 && this.checkObstacle(maze, newPosition))
          return true;
        else return false;
      case "RIGHT":
        if (
          newPosition[1] < maze[0].length &&
          this.checkObstacle(maze, newPosition)
        )
          return true;
        else return false;
      default:
        return false;
      // }
    }
  };

  moveInDirection = (maze, direction, currentPosition) => {
    let newPosition;
    switch (direction) {
      case "UP":
        newPosition = [currentPosition[0] - 1, currentPosition[1]];
        if (this.checkValidMove(maze, newPosition, direction)) {
          return [currentPosition[0] - 1, currentPosition[1]];
        } else return currentPosition;
      case "DOWN":
        newPosition = [currentPosition[0] + 1, currentPosition[1]];
        if (this.checkValidMove(maze, newPosition, direction)) {
          return newPosition;
        } else return currentPosition;
      case "LEFT":
        newPosition = [currentPosition[0], currentPosition[1] - 1];
        if (this.checkValidMove(maze, newPosition, direction)) {
          return newPosition;
        } else return currentPosition;
      case "RIGHT":
        newPosition = [currentPosition[0], currentPosition[1] + 1];
        if (this.checkValidMove(maze, newPosition, direction)) {
          return newPosition;
        } else return currentPosition;
      default:
        return currentPosition;
    }
  };
}

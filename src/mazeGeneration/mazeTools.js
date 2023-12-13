// import { r } from "../App";

export default class MazeTools {
  constructor(room) {
    this.room = room;
  }

  async createMazeCopy(maze = false) {
    if (maze == false) {
      maze = await this.room.mutate.getMaze();
    }
    return maze.map((row) => row.slice());
  }

  highlightCell(position, playerNum, objectType = "player") {
    const className = `${objectType}${playerNum}`;
    const genericClassName = `${objectType}`;
    const positionID = `_${position[1]}-${position[0]}`;

    if (document) {
      const prevPosition = document.querySelector(`.${className}`);
      const currentPosition = document.getElementById(positionID);

      if (prevPosition) {
        prevPosition.classList.remove(genericClassName);
        prevPosition.classList.remove(className);
      }
      if (currentPosition) {
        currentPosition.classList.add(genericClassName);
        currentPosition.classList.add(className);
      }
    }
  }
}

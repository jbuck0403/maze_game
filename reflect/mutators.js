// This file defines our "mutators".
//
// Mutators are how you change data in Reflect apps.
//
// They are registered with Reflect at construction-time and callable like:
// `myReflect.mutate.increment()`.
//
// Reflect runs each mutation immediately (optimistically) on the client,
// against the local cache, and then later (usually moments later) sends a
// description of the mutation (its name and arguments) to the server, so that
// the server can *re-run* the mutation there against the authoritative
// datastore.
//
// This re-running of mutations is how Reflect handles conflicts: the
// mutators defensively check the database when they run and do the appropriate
// thing. The Reflect sync protocol ensures that the server-side result takes
// precedence over the client-side optimistic result.

export const mutators = {
  increment,
  updateMaze,
  updatePlayerPosition,
};

const emptySpace = 0;

export const populateMaze = (currentPlayers) => {
  const maze = Array.from({ length: 25 }, () => Array(25).fill(0));

  currentPlayers.forEach((playerID) => {
    console.log(playerID);
    const startingPosition = startPositionByPlayer(playerID);

    maze[startingPosition[0]][startingPosition[1]] = playerID;
  });
  // console.log(maze);

  return maze;
};

// async function getPrevPosition(tx, characterID) {
//   const currentPosition =
//     (await tx.get(`prevPosition${characterID}`)) ??
//     startPositionByPlayer(characterID);

//   return currentPosition;
// }

const moveCharacterInMaze = (mazeData) => {
  // console.log(mazeData.characterID);
  console.log("$$$", mazeData.prevPosition, mazeData.newPosition);
  // const mazeCopy = [...mazeData.maze];
  const mazeCopy = mazeData.maze.map((row) => row.slice());

  if (mazeData.newPosition != mazeData.prevPosition) {
    mazeCopy[mazeData.prevPosition[0]][mazeData.prevPosition[1]] = 0;
    mazeCopy[mazeData.newPosition[0]][mazeData.newPosition[1]] =
      mazeData.characterID;
  }

  return mazeCopy;
};

const startPositionByPlayer = (playerID) => {
  let position;
  switch (playerID) {
    case 1:
      position = [0, 0];
      break;
    case 2:
      position = [0, 24];
      break;
    case 3:
      position = [24, 0];
      break;
    case 4:
      position = [24, 24];
      break;
    default:
      return false;
  }

  return position;
};

async function setCharacterPosition(tx, characterID, position) {
  await tx.set(`position${characterID}`, position);
}

async function setPrevCharacterPosition(tx, characterID, position) {
  await tx.set(`prevPosition${characterID}`, position);
}

//WORKING
async function increment(tx, delta) {
  const value = (await tx.get("count")) ?? 0;
  await tx.set("count", value + delta);
}

async function updateMaze(tx, playerData) {
  const playerID = playerData.characterID;
  const currentPlayers = playerData.currentPlayers;
  const newPosition = playerData.newPosition;
  const prevPosition = playerData.prevPosition;

  const maze = (await tx.get("maze")) ?? populateMaze(currentPlayers);

  const updatedMaze = moveCharacterInMaze({
    maze: maze,
    characterID: playerID,
    newPosition: newPosition,
    prevPosition: prevPosition,
  });

  await tx.set("maze", updatedMaze);
  return updatedMaze;
}

//WORKING
async function updatePlayerPosition(tx, playerData) {
  const playerID = playerData.id;
  const direction = playerData.direction;
  const currentPlayers = playerData.currentPlayers;
  const maze = (await tx.get("maze")) ?? populateMaze(currentPlayers);

  const checkObstacle = (maze, newPosition) => {
    if (maze[newPosition[0]][newPosition[1]] === emptySpace) {
      return true;
    } else {
      return false;
    }
  };

  const checkValidMove = (maze, newPosition, direction, highestX, highestY) => {
    switch (direction) {
      case "UP":
        if (newPosition[0] >= 0 && checkObstacle(maze, newPosition)) {
          return true;
        } else return false;
      case "DOWN":
        if (newPosition[1] <= highestY && checkObstacle(maze, newPosition))
          return true;
        else return false;
      case "LEFT":
        if (newPosition[0] >= 0 && checkObstacle(maze, newPosition))
          return true;
        else return false;
      case "RIGHT":
        if (newPosition[1] <= highestX && checkObstacle(maze, newPosition))
          return true;
        else return false;
      default:
        return false;
      // }
    }
  };

  const moveInDirection = (maze, direction) => {
    let newPosition;
    switch (direction) {
      case "UP":
        newPosition = [currentPosition[0] - 1, currentPosition[1]];
        if (checkValidMove(maze, newPosition, direction, 24, 24)) {
          return [currentPosition[0] - 1, currentPosition[1]];
        } else return currentPosition;
      case "DOWN":
        newPosition = [currentPosition[0] + 1, currentPosition[1]];
        if (checkValidMove(maze, newPosition, direction, 24, 24)) {
          return newPosition;
        } else return currentPosition;
      case "LEFT":
        newPosition = [currentPosition[0], currentPosition[1] - 1];
        if (checkValidMove(maze, newPosition, direction, 24, 24)) {
          return newPosition;
        } else return currentPosition;
      case "RIGHT":
        newPosition = [currentPosition[0], currentPosition[1] + 1];
        if (checkValidMove(maze, newPosition, direction, 24, 24)) {
          return newPosition;
        } else return currentPosition;
      default:
        return currentPosition;
    }
  };

  const currentPosition =
    (await tx.get(`position${playerID}`)) ?? startPositionByPlayer(playerID);
  const newPosition = moveInDirection(maze, direction);

  if (newPosition != currentPosition) {
    setPrevCharacterPosition(tx, playerID, currentPosition);
  }

  setCharacterPosition(tx, playerID, newPosition);

  return updateMaze(tx, {
    characterID: playerID,
    currentPlayers: currentPlayers,
    newPosition: newPosition,
    prevPosition: currentPosition,
  });
}

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
// import ItemSpawner from "../src/itemSpawning/spawnItems";
import { createMazeFromBlocks } from "../src/mazeGeneration/mazeGenerator";
import MazeMovement from "../src/mazeGeneration/mazeMovement";
import { emptySpace, wall } from "../src/mazeGeneration/mazeGenerator";
// import Spawner from "../src/itemSpawning/spawnItems";

const mazeSize = 8;
const mazeMoveTool = new MazeMovement();
// const spawner = new Spawner();

export const mutators = {
  updateMazeAfterMovement,
  updatePlayerPosition,
  initMaze,
  updateMaze,
  getMaze,
  setBarricade,
  getbarricadePosition,
  getPlayerPosition,
  removeUsersBarricades,
  getPlayerRoster,
  addToPlayerRoster,
};

// const emptySpace = 0;

const createMazeCopy = async (tx) => {
  const maze = await getMaze(tx);
  return maze.map((row) => row.slice());
};

async function removeUsersBarricades(tx, playerNum) {
  // get the current barricades placed by the current user
  const currentBarricades = await getbarricadePosition(tx, playerNum);

  if (currentBarricades.length > 0) {
    // create a shallow copy of the maze array
    const mazeCopy = await createMazeCopy(tx);
    // remove all barricades
    currentBarricades.forEach((barricadeCoords) => {
      mazeCopy[barricadeCoords[0]][barricadeCoords[1]] = emptySpace;
    });
    tx.set(`barricades${playerNum}`, []);
    updateMaze(tx, mazeCopy);
  }
}

async function setBarricade(tx, barricadeData) {
  // unpack the barricadeData dict
  const [playerNum, direction] = [
    barricadeData.playerNum,
    barricadeData.direction,
  ];
  // create a shallow copy of the maze array
  const mazeCopy = await createMazeCopy(tx);
  // get the current users current position
  const playerPosition = await getPlayerPosition(tx, playerNum);
  // get the coordinates for where the user wants to place the barricade
  const newBarricade = await mazeMoveTool.moveInDirection(
    mazeCopy,
    direction,
    playerPosition
  );

  if (newBarricade != playerPosition) {
    let updatedBarricades;
    // get the current barricades placed by the current user
    const currentBarricades = await getbarricadePosition(tx, playerNum);
    // if the current user has more than 2 barricades on the maze
    if (currentBarricades.length >= 3) {
      // store the coordinates for the barricade about to be removed
      const barricadeToRemove = currentBarricades[0];
      // remove barricades in fifo order
      updatedBarricades = currentBarricades.filter((_, idx) => idx > 0);
      // set the coordinates of the barricade being removed to empty space
      mazeCopy[barricadeToRemove[0]][barricadeToRemove[1]] = emptySpace;
    } else updatedBarricades = currentBarricades;
    // add the barricade to the map
    mazeCopy[newBarricade[0]][newBarricade[1]] = wall;
    // add to reflect server the new current barricades for the player
    tx.set(`barricades${playerNum}`, [...updatedBarricades, newBarricade]);
    updateMaze(tx, mazeCopy);
  }
}

async function getbarricadePosition(tx, playerNum) {
  return (await tx.get(`barricades${playerNum}`)) ?? [];
}

// const moveObjectInMaze = (tx, playerNum, objectID, direction) => {
//   //find by tx.get
//   getCurrentCombatObjects(tx, playerNum);
//   //remove prev cell id
//   //move object
//   //set with tx.set
//   //update new cell id
// };
// const spawnObjectFromCharacter = async (
//   tx,
//   playerNum,
//   objectID,
//   objectKey,
//   direction
// ) => {
//   const maze = await getMaze(tx);
//   const characterPosition = await getPlayerPosition(tx, playerNum);
//   const spawnPosition = mazeMoveTool.moveInDirection(
//     maze,
//     direction,
//     characterPosition
//   );

//   // if the desired spawn location is valid
//   if (spawnPosition != characterPosition) {
//     await tx.set(`${playerNum}${objectID}${objectKey}`);
//     // spawner.spawnItem(objectID, 1, spawnPosition);
//   }
// };

// const getCurrentCombatObjects = async (tx, playerNum, objectID) => {
//   //returns an array of keys matching that object id for the given player which are currently on the map
//   return (await tx.get(`${playerNum}${objectID}`)) ?? null;
// };

// const getCurrentProjectile = async(tx, playerNum);

// const setCurrentCombatObjects = async (tx, data) => {
//   const [playerNum, objectID, keys] = [
//     data.playerNum,
//     data.objectID,
//     data.keys,
//   ];
//   //requires an array of keys for current objects of a given ID currently in the maze
//   //ex player num 1, object id 'projectile' keys [1,2,3] = 1projectile => [1,2,3] meaning 3 projectiles currently in maze from player 1
//   await tx.set(`${playerNum}${objectID}`, keys);
// };

async function getPlayerRoster(tx) {
  return (await tx.get("roster")) ?? [];
}

async function addToPlayerRoster(tx, userName) {
  const roster = getPlayerRoster(tx);
  if (roster.length < 4) {
    tx.set("roster", [...roster, userName]);
  }
}

async function getPlayerPosition(tx, playerNum) {
  return (await tx.get(`position${playerNum}`)) ?? false;
}

export const highlightCell = (position, playerNum, objectType = "player") => {
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
};

export const populateMaze = (tx, currentPlayers, mazeSize) => {
  const maze = createMazeFromBlocks(mazeSize);

  currentPlayers.forEach((playerID) => {
    const startingPosition = startPositionByPlayer(
      tx,
      maze.length - 1,
      maze[0].length - 1,
      playerID
    );

    maze[startingPosition[0]][startingPosition[1]] = playerID;
  });

  return maze;
};

const moveCharacterInMaze = (mazeData) => {
  const mazeCopy = mazeData.maze.map((row) => row.slice());

  if (mazeData.newPosition != mazeData.prevPosition) {
    mazeCopy[mazeData.prevPosition[0]][mazeData.prevPosition[1]] = emptySpace;
    mazeCopy[mazeData.newPosition[0]][mazeData.newPosition[1]] =
      mazeData.characterID;
  }

  return mazeCopy;
};

const startPositionByPlayer = (tx, mazeYEnd, mazeXEnd, playerID) => {
  let position;
  switch (playerID) {
    case 1:
      position = [1, 1];
      break;
    case 2:
      position = [1, mazeXEnd - 1];
      break;
    case 3:
      position = [mazeYEnd - 1, 1];
      break;
    case 4:
      position = [mazeYEnd - 1, mazeXEnd - 1];
      break;
    default:
      return false;
  }
  setCharacterPosition(tx, playerID, position);
  return position;
};

async function setCharacterPosition(tx, characterID, position) {
  await tx.set(`position${characterID}`, position);
}

async function setPrevCharacterPosition(tx, characterID, position) {
  await tx.set(`prevPosition${characterID}`, position);
}

async function initMaze(tx, startingPlayers, mazeSize) {
  const maze =
    (await tx.get("maze")) ?? populateMaze(tx, startingPlayers, mazeSize);
  await tx.set("maze", maze);
}

async function getMaze(tx) {
  return await tx.get("maze");
}

async function updateMaze(tx, updatedMaze) {
  await tx.set("maze", updatedMaze);
}

async function updateMazeAfterMovement(tx, playerData) {
  const playerID = playerData.characterID;
  const currentPlayers = playerData.currentPlayers;
  const newPosition = playerData.newPosition;
  const prevPosition = playerData.prevPosition;

  const maze =
    (await tx.get("maze")) ?? populateMaze(tx, currentPlayers, mazeSize);

  const updatedMaze = moveCharacterInMaze({
    maze: maze,
    characterID: playerID,
    newPosition: newPosition,
    prevPosition: prevPosition,
  });

  await tx.set("maze", updatedMaze);
  return updatedMaze;
}

// const checkObstacle = (maze, newPosition) => {
//   if (maze[newPosition[0]][newPosition[1]] === emptySpace) {
//     return true;
//   } else {
//     return false;
//   }
// };

// const checkValidMove = (maze, newPosition, direction) => {
//   switch (direction) {
//     case "UP":
//       if (newPosition[0] >= 0 && checkObstacle(maze, newPosition)) {
//         return true;
//       } else return false;
//     case "DOWN":
//       if (newPosition[0] < maze.length && checkObstacle(maze, newPosition))
//         return true;
//       else return false;
//     case "LEFT":
//       if (newPosition[0] >= 0 && checkObstacle(maze, newPosition)) return true;
//       else return false;
//     case "RIGHT":
//       if (newPosition[1] < maze[0].length && checkObstacle(maze, newPosition))
//         return true;
//       else return false;
//     default:
//       return false;
//     // }
//   }
// };

// const moveInDirection = (maze, direction, currentPosition) => {
//   let newPosition;
//   switch (direction) {
//     case "UP":
//       newPosition = [currentPosition[0] - 1, currentPosition[1]];
//       if (checkValidMove(maze, newPosition, direction)) {
//         return [currentPosition[0] - 1, currentPosition[1]];
//       } else return currentPosition;
//     case "DOWN":
//       newPosition = [currentPosition[0] + 1, currentPosition[1]];
//       if (checkValidMove(maze, newPosition, direction)) {
//         return newPosition;
//       } else return currentPosition;
//     case "LEFT":
//       newPosition = [currentPosition[0], currentPosition[1] - 1];
//       if (checkValidMove(maze, newPosition, direction)) {
//         return newPosition;
//       } else return currentPosition;
//     case "RIGHT":
//       newPosition = [currentPosition[0], currentPosition[1] + 1];
//       if (checkValidMove(maze, newPosition, direction)) {
//         return newPosition;
//       } else return currentPosition;
//     default:
//       return currentPosition;
//   }
// };

async function updatePlayerPosition(tx, playerData) {
  const playerID = playerData.id;
  const direction = playerData.direction;
  const currentPlayers = playerData.currentPlayers;
  const maze =
    (await tx.get("maze")) ?? populateMaze(tx, currentPlayers, mazeSize);

  const currentPosition =
    (await tx.get(`position${playerID}`)) ??
    startPositionByPlayer(tx, maze.length - 1, maze[0].length - 1, playerID);
  const newPosition = mazeMoveTool.moveInDirection(
    maze,
    direction,
    currentPosition
  );

  if (newPosition != currentPosition) {
    setPrevCharacterPosition(tx, playerID, currentPosition);
  }

  setCharacterPosition(tx, playerID, newPosition);

  return updateMazeAfterMovement(tx, {
    characterID: playerID,
    currentPlayers: currentPlayers,
    newPosition: newPosition,
    prevPosition: currentPosition,
  });
}

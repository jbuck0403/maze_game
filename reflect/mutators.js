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

//reflect imports
import { generate } from "@rocicorp/rails";
import { createOrchestrationMutators } from "reflect-orchestrator";
import { orchestrationOptions } from "./orchestration-options";

//maze imports
import {
  artifact,
  collectible,
  createMazeFromBlocks,
} from "../src/mazeGeneration/mazeGenerator";
import { emptySpace, wall } from "../src/mazeGeneration/mazeGenerator";
import MazeMovement from "../src/mazeGeneration/mazeMovement";

//maze generation variables
const mazeSize = 8;
const artifactsToSpawn = 5;
const artifactSpawnVariation = 15;

//custom tools
const mazeMoveTool = new MazeMovement();

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
  removeFromPlayerRoster,
  getStartingPlayers,
  setStartingPlayers,
  resetForceStart,
  initForceStartDict,
  forceStartOptIn,
  destroyWalls,
  spawnItem,
  initClient,
  initRoster,
  clientList,
  startGame,
  stopGame,
  addArtifactToMaze,
  dropArtifact,
  initArtifacts,
  declareWinner,
  attackPlayer,
  ...createOrchestrationMutators(orchestrationOptions),
};

async function startGame(tx) {
  tx.set("gameInProgress", true);
}

async function stopGame(tx) {
  tx.set("gameInProgress", false);
}

async function initRoster(tx, presentUsers) {
  tx.set("roster", presentUsers);
}

export const { init: initClientHelper, list: listClients } = generate("client");

async function initClient(tx) {
  await initClientHelper(tx, {
    id: tx.clientID,
    userID: tx.auth?.userID ?? null,
  });
}

async function clientList(tx) {
  return await listClients(tx);
}

async function addArtifactToMaze(tx) {
  const verifyArtifactSpawnVariance = (
    spawnCoords,
    minDistance = artifactSpawnVariation
  ) => {
    const determineDistance = (coords1, coords2) => {
      const rowDiff = coords2[0] - coords1[0];
      const colDiff = coords2[1] - coords1[1];
      const diff = Math.abs(Math.sqrt(colDiff * colDiff + rowDiff * rowDiff));

      return diff;
    };
    const findClosestArtifactDistance = () => {
      let currentDistance;
      currentArtifacts.forEach((coords) => {
        if (currentDistance === undefined) {
          currentDistance = determineDistance(coords, spawnCoords);
        } else {
          const newDistance = determineDistance(coords, spawnCoords);
          if (newDistance < currentDistance) {
            currentDistance = newDistance;
          }
        }
      });

      return currentDistance;
    };

    return findClosestArtifactDistance() >= minDistance;
  };

  const mazeCopy = await createMazeCopy(tx);
  const currentArtifacts = (await tx.get("artifactsInMaze")) ?? [];

  if (currentArtifacts.length < artifactsToSpawn) {
    let newCoords = findRandomEmptySpace(mazeCopy);

    while (
      currentArtifacts.length > 0 &&
      !verifyArtifactSpawnVariance(newCoords)
    ) {
      newCoords = findRandomEmptySpace(mazeCopy);
    }

    tx.set("artifactsInMaze", [...currentArtifacts, newCoords]);

    mazeCopy[newCoords[0]][newCoords[1]] = artifact;
    updateMaze(tx, mazeCopy);
  }
}

// async function updateArtifactLocations(tx, newCoords) {
//   const currentArtifacts = (await tx.get("artifactLocations")) ?? [];
//   tx.set("artifactLocations", [...currentArtifacts, newCoords]);
// }

const findRandomEmptySpace = (mazeCopy) => {
  const returnRandomSpace = () => {
    return [
      Math.floor(Math.random() * highestY),
      Math.floor(Math.random() * highestX),
    ];
  };
  const [highestY, highestX] = [mazeCopy.length - 1, mazeCopy[0].length - 1];
  while (true) {
    let [row, col] = returnRandomSpace();
    if (mazeCopy[row][col] == emptySpace) return [row, col];
  }
};

async function spawnItem(tx, itemToSpawn, coords = false, numToSpawn = 1) {
  const mazeCopy = await createMazeCopy(tx); // create a copy of the current state of the maze

  const addItemToMaze = async (row, col) => {
    mazeCopy[row][col] = `${itemToSpawn}`;

    updateMaze(tx, mazeCopy);
  };

  for (let idx = 0; idx < numToSpawn; idx++) {
    const [row, col] = coords ? coords : findRandomEmptySpace(mazeCopy);
    addItemToMaze(row, col);
  }
}

async function resetForceStart(tx) {
  tx.set("forceStart", undefined);
}

async function initForceStartDict(tx) {
  const roster = await getPlayerRoster(tx);
  const forceStartDict = {};
  roster.forEach((user) => {
    forceStartDict[user] = false;
  });

  tx.set("forceStart", forceStartDict);
}

async function forceStartOptIn(tx, userID) {
  const initForceStart = () => {
    const forceStart = {};
    roster.forEach((user) => {
      forceStart[user] = false;
    });

    return forceStart;
  };
  const roster = await getPlayerRoster(tx);
  const forceStart = (await tx.get("forceStart")) ?? initForceStart();
  const updatedForceStart = { ...forceStart, [userID]: true };

  tx.set("forceStart", updatedForceStart);
}

const createMazeCopy = async (tx) => {
  const maze = await getMaze(tx);
  return maze.map((row) => row.slice());
};

async function destroyWalls(tx, playerNum) {
  const checkDestroyable = (row, col) => {
    const mazeRowWidth = mazeCopy[0].length - 1;
    const mazeColLength = mazeCopy.length - 1;
    if (row == 0 || row == mazeRowWidth || col == 0 || col == mazeColLength) {
      return false;
    } else if (mazeCopy[row][col] != wall) {
      return false;
    } else return true;
  };
  const removeWallFromMazeCopy = (row, col) => {
    if (checkDestroyable(row, col)) {
      mazeCopy[row][col] = emptySpace;
    }
  };
  // create a shallow copy of the maze array
  const mazeCopy = await createMazeCopy(tx);
  // get the current users current position
  const [playerRow, playerCol] = await getPlayerPosition(tx, playerNum);
  const coordsToCheck = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];
  coordsToCheck.forEach(([row, col]) => {
    removeWallFromMazeCopy(playerRow + row, playerCol + col);
  });

  updateMaze(tx, mazeCopy);
}

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

  if (
    newBarricade != playerPosition &&
    !collectible.includes(mazeCopy[newBarricade[0]][newBarricade[1]])
  ) {
    let updatedBarricades;
    // get the current barricades placed by the current user
    const currentBarricades = await getbarricadePosition(tx, playerNum);
    // if the current user has more than 2 barricades on the maze
    if (currentBarricades.length >= 2) {
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

async function setStartingPlayers(tx) {
  const generateStartingPlayers = () => {
    const startingPlayers = [];
    for (let i = 1; i <= numPlayers; i++) {
      startingPlayers.push(i);
    }
    return startingPlayers;
  };

  const roster = await getPlayerRoster(tx);
  // console.log("mutators roster", roster);
  const numPlayers = roster.length;
  const startingPlayers = generateStartingPlayers();
  // console.log("mutators startingPlayers", startingPlayers);

  tx.set("startingPlayers", startingPlayers);
}

async function getStartingPlayers(tx) {
  const startingPlayers = await tx.get("startingPlayers");

  return startingPlayers;
}

async function getbarricadePosition(tx, playerNum) {
  return (await tx.get(`barricades${playerNum}`)) ?? [];
}

async function getPlayerRoster(tx) {
  return (await tx.get("roster")) ?? [];
}

async function addToPlayerRoster(tx, userName) {
  const roster = await getPlayerRoster(tx);

  if (roster.length < 4 && !roster.includes(userName)) {
    const updatedRoster = [...roster, userName];
    tx.set("roster", updatedRoster);

    return setStartingPlayers(tx, updatedRoster);
  }
}

async function removeFromPlayerRoster(tx, userName) {
  // console.log(`removing ${userName} from roster`);
  const roster = await getPlayerRoster(tx);
  const updatedRoster = roster.filter((user) => {
    return user !== userName;
  });
  // console.log(updatedRoster);
  tx.set("roster", updatedRoster);
}

async function getPlayerPosition(tx, playerNum) {
  return (await tx.get(`position${playerNum}`)) ?? false;
}

const generateStartingArtifacts = (
  maze,
  numArtifactsToSpawn = artifactsToSpawn
) => {
  const verifySpawnVariance = (
    spawnCoords,
    currentArtifacts,
    minDistance = artifactSpawnVariation
  ) => {
    const determineDistance = (coords1, coords2) => {
      const rowDiff = coords2[0] - coords1[0];
      const colDiff = coords2[1] - coords1[1];
      const diff = Math.abs(Math.sqrt(colDiff * colDiff + rowDiff * rowDiff));

      return diff;
    };
    const findClosestDistance = () => {
      const players = [
        [1, 1],
        [maze.length - 1, maze[0].length - 1],
        [1, maze.length - 1],
        [maze[0].length - 1, 1],
      ];
      const pointsToCheck = [...players, ...currentArtifacts];
      let currentDistance;
      pointsToCheck.forEach((coords) => {
        if (currentDistance === undefined) {
          currentDistance = determineDistance(coords, spawnCoords);
        } else {
          const newDistance = determineDistance(coords, spawnCoords);
          if (newDistance < currentDistance) {
            currentDistance = newDistance;
          }
        }
      });

      return currentDistance;
    };

    return findClosestDistance() >= minDistance;
  };

  const findEmptyCenterSpace = () => {
    let center = [Math.floor(maze.length / 2), Math.floor(maze[0].length / 2)];

    let [centerRow, centerCol] = center;

    const coordsToCheck = [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [1, -1],
      [-1, -1],
    ];

    for (let [row, col] of coordsToCheck) {
      const [newRow, newCol] = [centerRow + row, centerCol + col];
      if (maze[newRow][newCol] === emptySpace) {
        return [newRow, newCol];
      }
    }
  };

  const spawnLocations = [findEmptyCenterSpace()];

  while (spawnLocations.length < numArtifactsToSpawn) {
    const spawnCoords = findRandomEmptySpace(maze);
    if (
      spawnLocations.length === 0 ||
      verifySpawnVariance(spawnCoords, spawnLocations)
    ) {
      spawnLocations.push(spawnCoords);
    }
  }

  return spawnLocations;
};

function populateMaze(tx, currentPlayers, mazeSize) {
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

  const artifactSpawnLocations = generateStartingArtifacts(maze);

  artifactSpawnLocations.forEach(([row, col]) => {
    maze[row][col] = artifact;
  });

  tx.set("artifactsInMaze", artifactSpawnLocations);

  return maze;
}

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
      position = [mazeYEnd - 1, mazeXEnd - 1];
      break;
    case 3:
      position = [1, mazeXEnd - 1];
      break;
    case 4:
      position = [mazeYEnd - 1, 1];
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

async function checkIfGatheredArtifact(
  tx,
  maze,
  newPosition,
  playerID,
  playerCollectedArtifacts,
  numCollectedArtifacts,
  artifactsInMaze
) {
  if (maze[newPosition[0]][newPosition[1]] === artifact) {
    // console.log("found artifact");
    tx.set("numCollectedArtifacts", numCollectedArtifacts + 1);
    tx.set(`player${playerID}Artifacts`, playerCollectedArtifacts + 1);
    const filteredArtifacts = artifactsInMaze.filter((coord) => {
      return coord[0] !== newPosition[0] && coord[1] !== newPosition[1];
    });
    tx.set("artifactsInMaze", filteredArtifacts);
  }
}

async function updatePlayerPosition(tx, playerData) {
  const numCollectedArtifacts = (await tx.get("numCollectedArtifacts")) ?? 0;
  const artifactsInMaze = (await tx.get("artifactsInMaze")) ?? [];
  const playerID = playerData.id;
  const playerCollectedArtifacts =
    (await tx.get(`player${playerID}Artifacts`)) ?? 0;
  const direction = playerData.direction;
  const currentPlayers = playerData.currentPlayers;
  const maze =
    (await tx.get("maze")) ?? populateMaze(tx, currentPlayers, mazeSize);
  // console.log("my artifacts", playerCollectedArtifacts);
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

  checkIfGatheredArtifact(
    tx,
    maze,
    newPosition,
    playerID,
    playerCollectedArtifacts,
    numCollectedArtifacts,
    artifactsInMaze
  );

  setCharacterPosition(tx, playerID, newPosition);

  return updateMazeAfterMovement(tx, {
    characterID: playerID,
    currentPlayers: currentPlayers,
    newPosition: newPosition,
    prevPosition: currentPosition,
  });
}

async function attackPlayer(tx, playerData) {
  const killPlayer = (enemyNum, enemyPosition) => {
    //remove one artifact
    const enemyArtifacts = otherPlayersArtifacts[enemyNum - 1];

    if (enemyArtifacts >= 2) {
      const newPosition = findRandomEmptySpace(mazeCopy);

      //move player to random empty spot in maze
      setCharacterPosition(tx, enemyNum, newPosition);

      mazeCopy[enemyPosition[0]][enemyPosition[1]] = emptySpace;
      mazeCopy[newPosition[0]][newPosition[1]] = enemyNum;

      return enemyNum;
    } else return false;
  };

  const playerNum = playerData.playerNum;
  const currentPlayers = playerData.startingPlayers;

  // create a shallow copy of the maze array
  const mazeCopy = await createMazeCopy(tx);
  // get the current users current position
  const [playerRow, playerCol] = await getPlayerPosition(tx, playerNum);
  const otherPlayersPromises = currentPlayers.map((player) => {
    return getPlayerPosition(tx, player);
  });
  const otherPlayersArtifactsPromises = currentPlayers.map((player) => {
    return tx.get(`player${player}Artifacts`) ?? 0;
  });
  const otherPlayers = await Promise.all(otherPlayersPromises);
  const otherPlayersArtifacts = await Promise.all(
    otherPlayersArtifactsPromises
  );

  const coordsToCheck = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];
  const playersKilled = [];
  coordsToCheck.forEach(([row, col]) => {
    otherPlayers.forEach((enemy, idx) => {
      if (idx === playerNum - 1) return;
      else if (enemy[0] === playerRow + row && enemy[1] === playerCol + col) {
        const killedPlayer = killPlayer(currentPlayers[idx], [
          enemy[0],
          enemy[1],
        ]);
        if (killedPlayer) {
          playersKilled.push(killedPlayer);
        }
      }
    });
  });
  updateMaze(tx, mazeCopy);
  return playersKilled;
}

async function dropArtifact(tx, playerNum) {
  const playerCollectedArtifacts =
    (await tx.get(`player${playerNum}Artifacts`)) ?? 0;
  const numCollectedArtifacts = (await tx.get("numCollectedArtifacts")) ?? 0;

  tx.set("numCollectedArtifacts", numCollectedArtifacts - 1);
  tx.set(`player${playerNum}Artifacts`, playerCollectedArtifacts - 1);
}

async function initArtifacts(tx) {
  tx.set("artifactSpawningTriggered", true);
}

async function declareWinner(tx, playerNum) {
  tx.set("winner", playerNum);
}

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

export const populateMaze = (currentPlayers) => {
  const maze = Array.from({ length: 25 }, () => Array(25).fill(0));

  currentPlayers.forEach((player) => {
    const startingPosition = startPositionByPlayer(player);
    maze[startingPosition[0]][startingPosition[1]] = player;
  });

  return maze;
};

const moveCharacterInMaze = (
  maze,
  currentPosition,
  newPosition,
  characterToMove
) => {
  const mazeCopy = [...maze];

  mazeCopy[currentPosition[0]][currentPosition[1]] = 0;
  mazeCopy[newPosition[0]][newPosition[1]] = characterToMove;

  return mazeCopy;
};

const startPositionByPlayer = (playerID) => {
  switch (playerID) {
    case 1:
      return [0, 0];
    case 2:
      return [0, 24];
    case 3:
      return [24, 0];
    case 4:
      return [24, 24];
  }
};

async function increment(tx, delta) {
  const value = (await tx.get("count")) ?? 0;
  await tx.set("count", value + delta);
}

async function updateMaze(tx, playerData) {
  const playerID = playerData.id;
  const currentPlayers = playerData.currentPlayers;
  const newPosition =
    (await tx.get(`position${playerID}`)) ?? startPositionByPlayer(playerID);

  console.log(newPosition);
  const maze = (await tx.get("maze")) ?? populateMaze(currentPlayers);

  const updatedMaze = moveCharacterInMaze(
    maze,
    currentPosition,
    newPosition,
    playerID
  );

  await tx.set("maze", updatedMaze);
}

async function updatePlayerPosition(tx, playerData) {
  const playerID = playerData.id;
  const direction = playerData.direction;

  const checkValidMove = (newPosition, direction, highestX, highestY) => {
    switch (direction) {
      case "UP":
        if (newPosition <= highestY) return true;
        else return false;
      case "DOWN":
        if (newPosition > 0) return true;
        else return false;
      case "LEFT":
        if (newPosition > 0) return true;
        else return false;
      case "RIGHT":
        if (newPosition < highestX) return true;
        else return false;
      default:
        return false;
    }
  };

  const moveInDirection = (direction) => {
    switch (direction) {
      case "UP":
        if (checkValidMove(currentPosition[1] + 1, direction, 24, 24)) {
          return [currentPosition[0], currentPosition[1] + 1];
        } else return currentPosition;
      case "DOWN":
        if (checkValidMove(currentPosition[1], direction, 24, 24)) {
          return [currentPosition[0], currentPosition[1] - 1];
        } else return currentPosition;
      case "LEFT":
        if (checkValidMove(currentPosition[0], direction, 24, 24)) {
          return [currentPosition[0] - 1, currentPosition[1]];
        } else return currentPosition;
      case "RIGHT":
        if (checkValidMove(currentPosition[0], direction, 24, 24)) {
          return [currentPosition[0] + 1, currentPosition[1]];
        } else return currentPosition;
      default:
        return currentPosition;
    }
  };
  const currentPosition =
    (await tx.get(`position${playerID}`)) ?? startPositionByPlayer(playerID);
  const newPosition = moveInDirection(direction);

  await tx.set(`position${playerID}`, newPosition);
}

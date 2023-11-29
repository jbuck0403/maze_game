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
  moveCharacter,
};

const startPositionByPlayer = (playerNum) => {
  switch (playerNum) {
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

async function updateMaze(tx, playerNum, newCoords) {
  const populateMaze = (playerNum) => {
    const maze = Array.from({ length: 25 }, () => Array(25).fill(0));
    const startingPosition = startPositionByPlayer(playerNum);

    maze[startingPosition[0]][startingPosition[1]] = playerNum;
    console.log(maze);

    return maze;
  };

  const maze = (await tx.get("maze")) ?? populateMaze(playerNum);

  if (maze[newCoords[0]][newCoords[1]] != playerNum) {
    maze[newCoords[0]][newCoords[1]] = playerNum;
  }

  await tx.set("maze", maze);
}

async function moveCharacter(tx, args) {
  const playerNum = args.id;
  const direction = args.direction;
  console.log(playerNum, direction);
  const checkValidMove = (newPosition, direction, highestX, highestY) => {
    switch (direction) {
      case "UP":
        if (newPosition < highestY) return true;
      case "DOWN":
        if (newPosition > 0) return true;
      case "LEFT":
        if (newPosition > 0) return true;
      case "RIGHT":
        if (newPosition < highestX) return true;
      default:
        return false;
    }
  };

  const moveInDirection = (direction) => {
    switch (direction) {
      case "UP":
        if (checkValidMove(currentPosition[1], direction, 24, 24)) {
          // console.log([currentPosition[0], currentPosition[1] + 1]);
          return [currentPosition[0], currentPosition[1] + 1];
        }
      case "DOWN":
        if (checkValidMove(currentPosition[1], direction, 24, 24)) {
          return [currentPosition[0], currentPosition[1] - 1];
        }
      case "LEFT":
        if (checkValidMove(currentPosition[0], direction, 24, 24)) {
          return [currentPosition[0] - 1, currentPosition[1]];
        }
      case "RIGHT":
        if (checkValidMove(currentPosition[0], direction, 24, 24)) {
          return [currentPosition[0] + 1, currentPosition[1]];
        }
      default:
        return currentPosition;
    }
  };
  const currentPosition =
    (await tx.get("position")) ?? startPositionByPlayer(playerNum);
  const newPosition = moveInDirection(direction);

  if (currentPosition != newPosition) {
    updateMaze(playerNum, newPosition);
  }

  await tx.set("position", newPosition);
}

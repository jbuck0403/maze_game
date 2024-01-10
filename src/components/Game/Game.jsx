//imports
import "./Game.css";
import { NavigationContext } from "../Router/MyRouter";

//react imports
import { useContext, useEffect, useState } from "react";
import { useSubscribe } from "@rocicorp/reflect/react";
import { useNavigate } from "react-router-dom";

//component imports
import MazeComponent from "../Maze/Maze";
import MazeTools from "../../mazeGeneration/mazeTools";
import ScoreBoard from "../ScoreBoard/ScoreBoard";

//game variables
const inputLimit = 10;
const timeThreshold = 1000;
const refreshRate = timeThreshold / inputLimit;
const wallBreakInterval = timeThreshold * 10;
const naturalArtifactSpawnInterval = timeThreshold * 1;
const artifactDecayInterval = timeThreshold * 20;
const attackInterval = timeThreshold * 3;
const wallBreakKey = "q";
const attackPlayerKey = "e";
const destroyBarricadesKey = " ";
const timeToReturnHome = 15;
const winCountdownInterval = timeThreshold * 15;
let playerNum = -1;
let lastInputTime = 0;
let moveDirection;
let keyDown = [];
let movementTimeoutID;
let lastWallBreakTime = 0;
let lastNaturalArtifactSpawnTime = 0;
let naturalArtifactSpawnTimeoutID;
let numNaturalArtifactSpawns = 0;
let artifactDecayTimeoutID;
let numPlayerCollectedArtifacts;
let winCountdownTimeoutID;
let lastAttackTime = 0;

const handleAttemptToLeavePage = (e) => {
  e.preventDefault();
  e.returnValue = "";
};

function Game({ r, startingPlayers }) {
  //protected route logic
  const navigate = useNavigate();
  const context = useContext(NavigationContext);

  useEffect(() => {
    if (!context.hasVisitedLobby) {
      navigate("/");
    }
  }, []);

  //game logic
  const mazeTool = new MazeTools(r);

  function handleNaturalArtifactSpawning() {
    const currentTime = Date.now();
    if (
      numNaturalArtifactSpawns < 5 &&
      currentTime - lastNaturalArtifactSpawnTime > naturalArtifactSpawnInterval
    ) {
      r.mutate.addArtifactToMaze();
      lastNaturalArtifactSpawnTime = currentTime;
      numNaturalArtifactSpawns += 1;

      naturalArtifactSpawnTimeoutID = setTimeout(
        handleNaturalArtifactSpawning,
        naturalArtifactSpawnInterval
      );
    }
  }

  // Add event listener when the component mounts
  useEffect(() => {
    function handleCharacterMovement() {
      if (keyDown.length > 0) {
        // if the player is currently holding a key
        const currentTime = Date.now();
        // ensure the player can only move at a maximum rate
        if (currentTime - lastInputTime > refreshRate) {
          moveDirection = null;
          // check which key is being pressed
          if (keyDown[0] === "w") moveDirection = "UP";
          else if (keyDown[0] === "a") moveDirection = "LEFT";
          else if (keyDown[0] === "s") moveDirection = "DOWN";
          else if (keyDown[0] === "d") moveDirection = "RIGHT";

          // if a key is being pressed
          if (moveDirection && startingPlayers) {
            // process the key press into player movement
            r.mutate.updatePlayerPosition({
              direction: moveDirection,
              id: playerNum,
              currentPlayers: startingPlayers,
            });
            lastInputTime = currentTime; // update the time since the last key press
          }
        }
      }
      movementTimeoutID = setTimeout(handleCharacterMovement, refreshRate); // call the movement function at a fixed rate
    }
    // checks which key is pressed for movement
    function movementKeyDownHandler(event) {
      const { key } = event;

      if (movementTimeoutID === undefined) {
        handleCharacterMovement(keyDown);
      }

      if (["w", "a", "s", "d"].includes(key)) {
        if (!keyDown.includes(key) && startingPlayers) {
          //do initial movement immediately on key press
          r.mutate.updatePlayerPosition({
            direction: key,
            id: playerNum,
            currentPlayers: startingPlayers,
          });
          //queue up continued movement for if key is held down
          keyDown.push(key);
        }
      }
    }

    // checks when the player stops trying to move
    function movementKeyUpHandler(event) {
      const { key } = event;
      keyDown = keyDown.filter((e) => e !== key);
      // clearTimeout(movementTimeoutID);
    }

    function barricadeKeyHandler(event) {
      const { key } = event;
      //if the player hasn't fired a barricade and an arrow key was pressed
      if (key.slice(0, 5) === "Arrow") {
        event.preventDefault();
        r.mutate.setBarricade({
          playerNum: playerNum,
          direction: key.slice(5).toUpperCase(),
        });
      }
    }

    async function attackPlayerHandler(event) {
      const { key } = event;
      const currentTime = Date.now();

      if (
        key === attackPlayerKey &&
        currentTime - lastAttackTime > attackInterval
      ) {
        const killedPlayers = await r.mutate.attackPlayer({
          playerNum: playerNum,
          startingPlayers: startingPlayers,
        });

        if (killedPlayers) {
          killedPlayers.forEach((player) => {
            r.mutate.dropArtifact(player);
            r.mutate.addArtifactToMaze();
          });
        }

        lastAttackTime = currentTime;
      }
    }

    function removeBarricadeKeyHandler(event) {
      const { key } = event;
      if (key === destroyBarricadesKey) {
        r.mutate.removeUsersBarricades(playerNum);
      }
    }

    function destroyWallsHandler(event) {
      const { key } = event;
      const currentTime = Date.now();
      if (
        key === wallBreakKey &&
        currentTime - lastWallBreakTime > wallBreakInterval
      ) {
        r.mutate.destroyWalls(playerNum);
        lastWallBreakTime = currentTime;
      }
    }

    r.mutate.initMaze(startingPlayers);
    // handleNaturalArtifactSpawning();

    window.addEventListener("beforeunload", handleAttemptToLeavePage);
    window.addEventListener("keydown", movementKeyDownHandler);
    window.addEventListener("keydown", barricadeKeyHandler);
    window.addEventListener("keydown", removeBarricadeKeyHandler);
    window.addEventListener("keyup", movementKeyUpHandler);
    window.addEventListener("keydown", destroyWallsHandler);
    window.addEventListener("keydown", attackPlayerHandler);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("beforeunload", handleAttemptToLeavePage);
      window.removeEventListener("keydown", movementKeyDownHandler);
      window.removeEventListener("keydown", barricadeKeyHandler);
      window.removeEventListener("keydown", removeBarricadeKeyHandler);
      window.removeEventListener("keyup", movementKeyUpHandler);
      window.removeEventListener("keydown", destroyWallsHandler);
      window.removeEventListener("keydown", attackPlayerHandler);
      clearTimeout(movementTimeoutID);
    };
  }, []);

  const [prevArtifactCount, setPrevArtifactCount] = useState(0);
  const [winner, setWinner] = useState();
  const [returningHomeCount, setReturningHomeCount] = useState();

  // keep the maze up to date on each change
  const maze = useSubscribe(r, (tx) => tx.get("maze"), [[]]);
  const roster = useSubscribe(r, (tx) => tx.get("roster"), []);
  playerNum = roster.findIndex((player) => player === r.userID) + 1;
  const gameOver = useSubscribe(r, (tx) => tx.get("winner"), false);

  const artifactSpawningTriggered = useSubscribe(
    r,
    (tx) => tx.get("artifactSpawningTriggered"),
    false
  );

  useEffect(() => {
    if (!artifactSpawningTriggered) {
      handleNaturalArtifactSpawning();
      r.mutate.initArtifacts();
    }
  }, [artifactSpawningTriggered]);

  const artifactsInMaze = useSubscribe(
    r,
    (tx) => tx.get("artifactsInMaze"),
    undefined
  );

  const numCollectedArtifacts = useSubscribe(
    r,
    (tx) => tx.get("numCollectedArtifacts"),
    0
  );

  useEffect(() => {
    if (gameOver) {
      window.removeEventListener("beforeunload", handleAttemptToLeavePage);
      r.close();
    }
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) {
      if (returningHomeCount === undefined) {
        setReturningHomeCount(timeToReturnHome);
      }
      if (returningHomeCount > 0) {
        setTimeout(
          () => setReturningHomeCount((prev) => prev - 1),
          timeThreshold
        );
      } else if (returningHomeCount === 0) {
        homeBtnHandler();
      }
    }
  }, [gameOver, returningHomeCount]);

  useEffect(() => {
    if (numCollectedArtifacts === 5) {
      const winner = playerCollectedArtifactsAll.indexOf(5) + 1;

      if (winner > -1) {
        r.mutate.declareWinner(winner);
        setWinner(winner);
      }
    }
  }, [numCollectedArtifacts]);

  useEffect(() => {
    if (artifactsInMaze && artifactsInMaze.length === 5) {
      clearTimeout(naturalArtifactSpawnTimeoutID);
    }
  }, [artifactsInMaze]);
  const playerCollectedArtifactsAll = startingPlayers.map((player) => {
    return useSubscribe(r, (tx) => tx.get(`player${player}Artifacts`), 0);
  });

  useEffect(() => {
    function winCountdown() {
      const winningPlayer =
        playerCollectedArtifactsAll.includes(3) ||
        playerCollectedArtifactsAll.includes(4)
          ? playerCollectedArtifactsAll.indexOf(3) + 1
          : playerCollectedArtifactsAll.indexOf(4) + 1;
      setWinner(winningPlayer);
      r.mutate.declareWinner(winningPlayer);
    }
    function handleArtifactDecay() {
      r.mutate.dropArtifact(playerNum);
      r.mutate.addArtifactToMaze();

      if (numPlayerCollectedArtifacts > 1) {
        artifactDecayTimeoutID = setTimeout(
          handleArtifactDecay,
          artifactDecayInterval
        );
      }
    }

    if (
      winCountdownTimeoutID !== undefined &&
      playerCollectedArtifactsAll[playerNum - 1] < 3
    ) {
      clearTimeout(winCountdownTimeoutID);
      winCountdownTimeoutID = undefined;
    }

    if (
      (playerCollectedArtifactsAll.includes(3) ||
        playerCollectedArtifactsAll.includes(4)) &&
      winCountdownTimeoutID === undefined
    ) {
      winCountdownTimeoutID = setTimeout(winCountdown, winCountdownInterval);
    }

    setPrevArtifactCount(numPlayerCollectedArtifacts);
    numPlayerCollectedArtifacts = playerCollectedArtifactsAll[playerNum - 1];
    if (numPlayerCollectedArtifacts > prevArtifactCount) {
      clearTimeout(artifactDecayTimeoutID);
      artifactDecayTimeoutID = setTimeout(
        handleArtifactDecay,
        artifactDecayInterval
      );
    }
  }, [playerCollectedArtifactsAll]);

  // maintain a record of all player positions
  const playerPositions = startingPlayers.map((player) => {
    return useSubscribe(r, (tx) => tx.get(`position${player}`), [1, 1]);
  });

  useEffect(() => {
    // show player colors
    if (playerPositions) {
      startingPlayers.forEach((player, idx) => {
        mazeTool.highlightCell(playerPositions[idx], player);
      });
    }
  }, [playerPositions]);

  const homeBtnHandler = () => {
    window.location.href = "/";
  };

  return (
    <>
      {returningHomeCount && (
        <div>
          {returningHomeCount > 0
            ? `Returning home in ${returningHomeCount}`
            : "Redirecting..."}
        </div>
      )}
      {mazeTool &&
        roster &&
        startingPlayers &&
        playerCollectedArtifactsAll &&
        roster.length === startingPlayers.length && (
          <ScoreBoard
            playerCollectedArtifactsAll={playerCollectedArtifactsAll}
            roster={roster}
            gameOver={gameOver}
            userID={r.userID}
          >
            <MazeComponent maze={maze} />
          </ScoreBoard>
        )}
    </>
  );
}
export default Game;

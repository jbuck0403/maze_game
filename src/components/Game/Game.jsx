//imports
import "./Game.css";
import { NavigationContext } from "../../App";

//react imports
import { useContext, useEffect, useState } from "react";
import { useSubscribe } from "@rocicorp/reflect/react";
import { useNavigate } from "react-router-dom";

//component imports
import MazeComponent from "../Maze/Maze";
import MazeTools from "../../mazeGeneration/mazeTools";
import { artifact, wall } from "../../mazeGeneration/mazeGenerator";
import MazeMovement from "../../mazeGeneration/mazeMovement";

//game variables
const inputLimit = 10;
const timeThreshold = 1000;
const refreshRate = timeThreshold / inputLimit;
const wallBreakInterval = timeThreshold * 10;
const wallBreakKey = "q";
const destroyBarricadesKey = " ";
let playerNum = -1;
let lastInputTime = 0;
let moveDirection;
let keyDown = [];
let movementTimeoutID;
let lastWallBreakTime = 0;

function Game({ r, startingPlayers }) {
  //protected route logic
  const navigate = useNavigate();
  const context = useContext(NavigationContext);

  useEffect(() => {
    if (!context.hasVisitedLobby) {
      navigate(context.homeRoute);
    }
  }, []);

  //game logic
  const mazeTool = new MazeTools(r);

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

      if (["w", "a", "s", "d"].includes(key)) {
        // r.mutate.addArtifactToMaze();
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
    r.mutate.spawnItem("a", 5);
    // r.mutate.addArtifactToMaze();

    window.addEventListener("keydown", movementKeyDownHandler);
    window.addEventListener("keydown", barricadeKeyHandler);
    window.addEventListener("keydown", removeBarricadeKeyHandler);
    window.addEventListener("keyup", movementKeyUpHandler);
    window.addEventListener("keydown", destroyWallsHandler);
    handleCharacterMovement(keyDown);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("keydown", movementKeyDownHandler);
      window.removeEventListener("keydown", barricadeKeyHandler);
      window.removeEventListener("keydown", removeBarricadeKeyHandler);
      window.removeEventListener("keyup", movementKeyUpHandler);
      clearTimeout(movementTimeoutID);
    };
  }, []);

  // //state variables
  // const [playerCollectedArtifacts, setPlayerCollectedArtifacts] = useState(0);

  // keep the maze up to date on each change
  const maze = useSubscribe(r, (tx) => tx.get("maze"), [[]]);
  const roster = useSubscribe(r, (tx) => tx.get("roster"), []);
  playerNum = roster.findIndex((player) => player === r.userID) + 1;

  const numCollectedArtifacts = useSubscribe(
    r,
    (tx) => tx.get("numCollectedArtifacts"),
    0
  );
  const playerCollectedArtifacts = startingPlayers.map((player) => {
    return useSubscribe(r, (tx) => tx.get(`player${player}Artifacts`), 0);
  });

  // maintain a record of all player positions
  const playerPositions = startingPlayers.map((player) => {
    return useSubscribe(r, (tx) => tx.get(`position${player}`), [1, 1]);
  });

  useEffect(() => {
    console.log("total", numCollectedArtifacts);
  }, [numCollectedArtifacts]);
  useEffect(() => {
    console.log("players", playerCollectedArtifacts);
  }, [playerCollectedArtifacts]);

  useEffect(() => {
    // show player colors
    if (playerPositions) {
      startingPlayers.forEach((player, idx) => {
        mazeTool.highlightCell(playerPositions[idx], player);
      });
    }
  }, [playerPositions]);

  return <>{mazeTool && roster && <MazeComponent maze={maze} />}</>;
}
export default Game;

//imports
import "./Game.css";

//react imports
import { useEffect, useState } from "react";
import { useSubscribe } from "@rocicorp/reflect/react";

//reflect imports
import { Reflect } from "@rocicorp/reflect/client";
import { mutators } from "../../../reflect/mutators";
import { useOrchestration } from "reflect-orchestrator";
import { orchestrationOptions } from "../../../reflect/orchestration-options";

//component imports
import MazeComponent from "../Maze/Maze";

//custom game tool imports
import MazeTools from "../../mazeGeneration/mazeTools";
import UserTools from "../../users/getUserID";

<<<<<<< HEAD
//find the userid via firebase or cookies, in that order
const userTool = new UserTools();
const userID = userTool.getUserID();

//variables
//reflect room variables
const gameID = 90;

=======
>>>>>>> dev
//game variables
const inputLimit = 10;
const timeThreshold = 1000;
const refreshRate = timeThreshold / inputLimit;
const startingPlayers = [1, 2, 3, 4];
let playerNum = -1;
let lastInputTime = 0;
let moveDirection;
let keyDown = [];
let movementTimeoutID;

//find the userid via firebase or cookies, in that order
const userTool = new UserTools();
const userID = userTool.getUserID();

//variables
//reflect room variables
const gameID = 20;
const server = "http://localhost:8080";

// create a new reflect room for multiplayer to sync maze and players
// export const r = new Reflect({
//   server: "http://localhost:8080",
//   roomID: gameID,
//   userID: userID,
//   mutators,
// });

// const mazeTool = new MazeTools(r);

//instantiate the maze tool

// const r = new Reflect({
//   server: "http://localhost:8080",
//   roomID: gameID,
//   userID: userID,
//   mutators,
// });
// const mazeTool = new MazeTools(r);

function Game({ r, mazeTool }) {
  console.log("mounted game", mazeTool);
  // const [r, setR] = useState(null);
  // const [mazeTool, setMazeTool] = useState(null);

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
          if (moveDirection) {
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
        if (!keyDown.includes(key)) {
          //do initial movement immediately on key press
          r.mutate.updatePlayerPosition({
            direction: key,
            id: playerNum,
            currentPlayers: startingPlayers,
          });
          //queue up continued movement for if key is held down
          keyDown.push(key);
          // handleCharacterMovement(keyDown);
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
      if (key === " ") {
        r.mutate.removeUsersBarricades(playerNum);
      }
    }

    // const reflect = new Reflect({
    //   server: "http://localhost:8080",
    //   roomID: gameID,
    //   userID: userID,
    //   mutators,
    // });
    // const mt = new MazeTools(reflect);

    // setR(reflect);
    // setMazeTool(mt);

    //init the maze and add player avatars
    r.mutate.initMaze(startingPlayers);
    r.mutate.addToPlayerRoster(r.userID);

    window.addEventListener("keydown", movementKeyDownHandler);
    window.addEventListener("keydown", barricadeKeyHandler);
    window.addEventListener("keydown", removeBarricadeKeyHandler);
    window.addEventListener("keyup", movementKeyUpHandler);
    handleCharacterMovement(keyDown);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("keydown", movementKeyDownHandler);
      window.removeEventListener("keydown", barricadeKeyHandler);
      window.removeEventListener("keydown", removeBarricadeKeyHandler);
      window.removeEventListener("keyup", movementKeyUpHandler);
      clearTimeout(movementTimeoutID);
    };
  }, []); // Empty dependency array means this effect runs once when the component mounts}

  // keep the maze up to date on each change
  const maze = useSubscribe(r, (tx) => tx.get("maze"), [[]]);
  const roster = useSubscribe(r, (tx) => tx.get("roster"), []);
  playerNum = roster.findIndex((player) => player === r.userID) + 1;

  // maintain a record of all player positions
  const playerPositions = startingPlayers.map((player) => {
    return useSubscribe(r, (tx) => tx.get(`position${player}`), [0, 0]);
  });

  useEffect(() => {
    // show player colors
    startingPlayers.forEach((player, idx) => {
      mazeTool.highlightCell(playerPositions[idx], player);
    });
  }, [playerPositions]);

  return <>{mazeTool && <MazeComponent maze={maze} />}</>;
}
export default Game;

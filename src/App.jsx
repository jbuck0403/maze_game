import "./App.css";

import { useEffect, useState } from "react";

import { Reflect } from "@rocicorp/reflect/client";
import { mutators, highlightCell } from "../reflect/mutators";
import { useSubscribe } from "@rocicorp/reflect/react";

import MazeComponent from "./components/maze";
import Spawner from "./itemSpawning/spawnItems";
import MazeMovement from "./mazeGeneration/mazeMovement";

const playerNum = 1;
const gameID = 73;
const inputLimit = 10;
const timeThreshold = 1000;
const refreshRate = timeThreshold / inputLimit;
let lastInputTime = 0;
let moveDirection;

export const r = new Reflect({
  server: "http://localhost:8080",
  roomID: gameID,
  userID: playerNum,
  mutators,
});

const startingPlayers = [playerNum, 2, 3, 4];
r.mutate.initMaze(startingPlayers);
const itemSpawner = new Spawner();
const mazeMovementTool = new MazeMovement();

let keyDown = [];

function handleCharacterMovement() {
  if (keyDown.length > 0) {
    // if the player is currently holding a key
    const currentTime = Date.now();
    // ensure the player can only move at a maximum rate
    if (currentTime - lastInputTime > refreshRate) {
      moveDirection = null;
      if (keyDown[0] === "w")
        moveDirection = "UP"; // check which key is being pressed
      else if (keyDown[0] === "a") moveDirection = "LEFT";
      else if (keyDown[0] === "s") moveDirection = "DOWN";
      else if (keyDown[0] === "d") moveDirection = "RIGHT";

      // if a key is being pressed
      if (moveDirection) {
        // process the key press into player movement
        r.mutate.updatePlayerPosition({
          direction: moveDirection,
          id: r.userID,
          currentPlayers: startingPlayers,
        });
        lastInputTime = currentTime; // update the time since the last key press
      }
    }
  }
  setTimeout(handleCharacterMovement, refreshRate); // call the movement function at a fixed rate
}

function App() {
  // checks which key is pressed for movement
  function movementKeyDownHandler(event) {
    const { key } = event;
    // console.log(key);
    if (["w", "a", "s", "d"].includes(key)) {
      if (!keyDown.includes(key)) {
        //do initial movement immediately on key press
        r.mutate.updatePlayerPosition({
          direction: key,
          id: r.userID,
          currentPlayers: startingPlayers,
        });
        //queue up continued movement for if key is held down
        keyDown.push(key);
      }
    }
  }

  function removeBarricadeKeyHandler(event) {
    const { key } = event;
    if (key === " ") {
      r.mutate.removeUsersBarricades(r.userID);
    }
  }

  function barricadeKeyHandler(event) {
    const { key } = event;
    //if the player hasn't fired a barricade and an arrow key was pressed
    if (key.slice(0, 5) === "Arrow") {
      r.mutate.setBarricade({
        playerNum: r.userID,
        direction: key.slice(5).toUpperCase(),
      });
    }
  }

  // checks when the player stops trying to move
  function movementKeyUpHandler(event) {
    const { key } = event;
    keyDown = keyDown.filter((e) => e !== key);
  }

  // keep the maze up to date on each change
  const maze = useSubscribe(r, (tx) => tx.get("maze"), [[]]);
  // maintain a record of all player positions
  const playerPositions = startingPlayers.map((player) => {
    return useSubscribe(r, (tx) => tx.get(`position${player}`), [0, 0]);
  });

  // show player colors
  startingPlayers.forEach((player, idx) => {
    highlightCell(playerPositions[idx], player);
  });

  // Add event listener when the component mounts
  useEffect(() => {
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
    };
  }, []); // Empty dependency array means this effect runs once when the component mounts

  return (
    <>
      <MazeComponent maze={maze} />
    </>
  );
}

export default App;

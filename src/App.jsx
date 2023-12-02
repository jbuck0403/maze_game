import "./App.css";

import { useEffect, useState } from "react";

import { Reflect } from "@rocicorp/reflect/client";
import { mutators, highlightPlayer } from "../reflect/mutators";
import { useSubscribe } from "@rocicorp/reflect/react";

import MazeComponent from "./components/maze";
import Spawner from "./itemSpawning/spawnItems";

const playerNum = 1;
const gameID = 71;
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

let keyDown = [];

function handleMovement() {
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
  setTimeout(handleMovement, refreshRate); // call the movement function at a fixed rate
}

function App() {
  // checks which key is pressed for movement
  function keyDownHandler(event) {
    const { key } = event;
    if (["w", "a", "s", "d"].includes(key)) {
      if (!keyDown.includes(key)) {
        keyDown.push(key);
      }
    }
  }

  // checks when the player stops trying to move
  function keyUpHandler(event) {
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
    highlightPlayer(playerPositions[idx], player);
  });

  // Add event listener when the component mounts
  useEffect(() => {
    window.addEventListener("keydown", keyDownHandler);
    window.addEventListener("keyup", keyUpHandler);
    handleMovement(keyDown);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("keydown", keyDownHandler);
      window.removeEventListener("keyup", keyUpHandler);
    };
  }, []); // Empty dependency array means this effect runs once when the component mounts

  console.log("Reached return");
  return (
    <>
      <div>
        <MazeComponent maze={maze} />
      </div>
    </>
  );
}

export default App;

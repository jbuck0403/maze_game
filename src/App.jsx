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
    const currentTime = Date.now();
    if (currentTime - lastInputTime > refreshRate) {
      moveDirection = null;
      if (keyDown[0] === "w") moveDirection = "UP";
      else if (keyDown[0] === "a") moveDirection = "LEFT";
      else if (keyDown[0] === "s") moveDirection = "DOWN";
      else if (keyDown[0] === "d") moveDirection = "RIGHT";

      if (moveDirection) {
        r.mutate.updatePlayerPosition({
          direction: moveDirection,
          id: r.userID,
          currentPlayers: startingPlayers,
        });
        lastInputTime = currentTime;
      }
    }
  }
  setTimeout(handleMovement, refreshRate);
}

function App() {
  // const onClick = () => {
  //   void r.mutate.increment(1);
  // };

  // OLD MOVEMENT FUNCTION
  // function handleMovement(event) {
  //   const currentTime = Date.now();
  //   if (currentTime - lastInputTime > timeThreshold / inputLimit) {
  //     const { key } = event;
  //     let moveDirection;
  //     switch (key) {
  //       case "w":
  //         moveDirection = "UP";
  //         break;
  //       case "a":
  //         moveDirection = "LEFT";
  //         break;
  //       case "s":
  //         moveDirection = "DOWN";
  //         break;
  //       case "d":
  //         moveDirection = "RIGHT";
  //         break;
  //       default:
  //         return false;
  //     }
  //     console.log(event.keyCode);
  //     r.mutate.updatePlayerPosition({
  //       direction: moveDirection,
  //       id: r.userID,
  //       currentPlayers: currentPlayers,
  //     });
  //     lastInputTime = currentTime;
  //     // itemSpawner.spawnItem("x", 1);
  //   }
  // }

  function keyDownHandler(event) {
    const { key } = event;
    if (["w", "a", "s", "d"].includes(key)) {
      if (!keyDown.includes(key)) {
        keyDown.push(key);
      }
    }
  }

  function keyUpHandler(event) {
    const { key } = event;
    keyDown = keyDown.filter((e) => e !== key);
  }

  const maze = useSubscribe(r, (tx) => tx.get("maze"), [[]]);
  const playerPositions = startingPlayers.map((player) => {
    return useSubscribe(r, (tx) => tx.get(`position${player}`), [0, 0]);
  });

  startingPlayers.forEach((player, idx) => {
    highlightPlayer(playerPositions[idx], player);
  });

  console.log(playerPositions[0]);

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

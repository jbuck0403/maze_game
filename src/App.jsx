import "./App.css";

import { useEffect, useState } from "react";

import { Reflect } from "@rocicorp/reflect/client";
import { mutators, highlightPlayer } from "../reflect/mutators";
import { useSubscribe } from "@rocicorp/reflect/react";

import MazeComponent from "./components/maze";

const playerNum = 1;
const gameID = 65;
const inputLimit = 20;
const timeThreshold = 1000;
let lastInputTime = 0;

const r = new Reflect({
  server: "http://localhost:8080",
  roomID: gameID,
  userID: playerNum,
  mutators,
});

const startingPlayers = [playerNum, 2];
r.mutate.initMaze(startingPlayers);

function App() {
  // const onClick = () => {
  //   void r.mutate.increment(1);
  // };

  function handleMovement(event) {
    const currentTime = Date.now();
    if (currentTime - lastInputTime > timeThreshold / inputLimit) {
      const { key } = event;
      let moveDirection;
      switch (key) {
        case "w":
          moveDirection = "UP";
          break;
        case "a":
          moveDirection = "LEFT";
          break;
        case "s":
          moveDirection = "DOWN";
          break;
        case "d":
          moveDirection = "RIGHT";
          break;
        default:
          return false;
      }
      r.mutate.updatePlayerPosition({
        direction: moveDirection,
        id: r.userID,
        currentPlayers: currentPlayers,
      });
      lastInputTime = currentTime;
    }
  }
  // const count = useSubscribe(r, (tx) => tx.get("count"), 0);
  const [currentPlayers, setCurrentPlayers] = useState(startingPlayers);
  const maze = useSubscribe(r, (tx) => tx.get("maze"), [[]]);
  const playerPositions = currentPlayers.map((player) => {
    return useSubscribe(r, (tx) => tx.get(`position${player}`), [0, 0]);
  });

  currentPlayers.forEach((player, idx) => {
    highlightPlayer(playerPositions[idx], player);
  });

  console.log(playerPositions[0]);

  // Add event listener when the component mounts
  useEffect(() => {
    window.addEventListener("keypress", handleMovement);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("keypress", handleMovement);
    };
  }, []); // Empty dependency array means this effect runs once when the component mounts

  return (
    <>
      <div>
        <MazeComponent maze={maze} />
      </div>
      {/* <div className="card">
        <button onClick={onClick}>count is {count}</button>
      </div> */}
    </>
  );
}

export default App;

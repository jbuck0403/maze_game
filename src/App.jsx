import "./App.css";

import { useEffect, useState } from "react";

import { Reflect } from "@rocicorp/reflect/client";
import { mutators } from "../reflect/mutators";
import { useSubscribe } from "@rocicorp/reflect/react";

import MazeComponent from "./components/maze";

import { populateMaze } from "../reflect/mutators";

const playerNum = 1;
const gameID = 1;

const r = new Reflect({
  server: "http://localhost:8080",
  roomID: gameID,
  userID: playerNum,
  mutators,
});

function App() {
  const onClick = () => {
    void r.mutate.increment(1);
  };

  function handleMovement(event) {
    const { key } = event;

    switch (key) {
      case "w":
        r.mutate.updatePlayerPosition({ direction: "UP", id: r.userID });
        break;
      case "a":
        r.mutate.updatePlayerPosition({ direction: "LEFT", id: r.userID });
        break;
      case "s":
        r.mutate.updatePlayerPosition({ direction: "DOWN", id: r.userID });
        break;
      case "d":
        r.mutate.updatePlayerPosition({ direction: "RIGHT", id: r.userID });
        break;
      default:
        break;
    }
    r.mutate.updateMaze({ id: r.userID, currentPlayers: currentPlayers });
  }

  const [currentPlayers, setCurrentPlayers] = useState([playerNum]);
  const count = useSubscribe(r, (tx) => tx.get("count"), 0);
  const playerPosition = useSubscribe(
    r,
    (tx) => tx.get(`position${r.userID}`),
    [0, 0]
  );
  console.log(playerPosition);
  const maze = useSubscribe(
    r,
    (tx) => tx.get("maze"),
    populateMaze(currentPlayers)
  );

  // Add event listener when the component mounts
  useEffect(() => {
    window.addEventListener("keydown", handleMovement);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("keydown", handleMovement);
    };
  }, []); // Empty dependency array means this effect runs once when the component mounts

  return (
    <>
      <div>
        <MazeComponent maze={maze} />
      </div>
      <div className="card">
        <button onClick={onClick}>count is {count}</button>
      </div>
    </>
  );
}

export default App;

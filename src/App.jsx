import "./App.css";

import { useEffect } from "react";

import { Reflect } from "@rocicorp/reflect/client";
import { mutators } from "../reflect/mutators";
import { useSubscribe } from "@rocicorp/reflect/react";

import MazeComponent from "./components/maze";

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
    // console.log(playerNum);
    const { key } = event;

    switch (key) {
      case "w":
        // console.log(playerNum);
        r.mutate.moveCharacter({ direction: "UP", id: r.userID });
        break;
      case "a":
        r.mutate.moveCharacter({ direction: "LEFT", id: r.userID });
        break;
      case "s":
        r.mutate.moveCharacter({ direction: "DOWN", id: r.userID });
        break;
      case "d":
        r.mutate.moveCharacter({ direction: "RIGHT", id: r.userID });
        break;
      default:
        break;
    }
  }

  const count = useSubscribe(r, (tx) => tx.get("count"), 0);
  const playerPosition = useSubscribe(r, (tx) => tx.get("position"), [0, 0]);
  const maze = useSubscribe(
    r,
    (tx) => tx.get("maze"),
    Array.from({ length: 25 }, () => Array(25).fill(0))
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

import "./App.css";

import { useEffect } from "react";

import { Reflect } from "@rocicorp/reflect/client";
import { mutators } from "../reflect/mutators";
import { useSubscribe } from "@rocicorp/reflect/react";

import MazeComponent from "./components/maze";

const r = new Reflect({
  server: "http://localhost:8080",
  roomID: "myRoom",
  userID: "myUser",
  mutators,
});

function App() {
  const onClick = () => {
    void r.mutate.increment(1);
  };

  const count = useSubscribe(r, (tx) => tx.get("count"), 0);
  const maze = useSubscribe(
    r,
    (tx) => tx.get("maze"),
    Array.from({ length: 25 }, () => Array(25).fill(0))
  );

  function handleMovement(event) {
    const { key } = event;

    switch (key) {
      case "w":
        r.mutate.move("UP");
        break;
      case "a":
        r.mutate.move("LEFT");
        break;
      case "s":
        r.mutate.move("DOWN");
        break;
      case "d":
        r.mutate.move("RIGHT");
        break;
      default:
        break;
    }
  }

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

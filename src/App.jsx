//imports
import "./App.css";

import Game from "./components/Game/Game";
import UserTools from "./users/getUserID";
import { orchestrationOptions } from "../reflect/orchestration-options";
// import { useOrchestration } from "reflect-orchestrator";
import { useOrchestration } from "@rocicorp/reflect-orchestrator";
import { mutators } from "../reflect/mutators";
import { useState, useEffect } from "react";
import MazeTools from "./mazeGeneration/mazeTools";
import { Reflect } from "@rocicorp/reflect/client";
import { nanoid } from "nanoid";
import Lobby from "./components/Lobby/Lobby";

// find the userid via firebase or cookies, in that order
const userTool = new UserTools();
const userID = userTool.getUserID();
// const userID = nanoid();
// const userID = "johnson";
const server = "http://localhost:8080";

//variables
//reflect room variables
// const gameID = 15;

// // create a new reflect room for multiplayer to sync maze and players
// export const r = new Reflect({
//   server,
//   roomID: gameID,
//   userID: userID,
//   mutators,
// });

function App() {
  const roomAssignment = useOrchestration(
    {
      server: server,
      roomID: "orchestrator",
      userID: userID,
      auth: userID,
    },
    orchestrationOptions
  );

  const [r, setR] = useState();
  const [mazeTool, setMazeTool] = useState();

  useEffect(() => {
    if (!roomAssignment) {
      setR(undefined);
      return;
    }
    const reflect = new Reflect({
      server: server,
      roomID: roomAssignment.roomID,
      userID: userID,
      auth: userID,
      mutators,
    });
    reflect.mutate.addToPlayerRoster(userID);

    setR(reflect);
    setMazeTool();
    return () => {
      void reflect?.close();
      setR(undefined);
    };
  }, [roomAssignment]);

  useEffect(() => {
    const mazeToolInit = new MazeTools(r);
    setMazeTool(mazeToolInit);
  }, [r]);

  return <>{r && mazeTool && <Lobby r={r} mazeTool={mazeTool} />}</>;
}
export default App;

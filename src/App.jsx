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
  return (
    <>
      <Lobby />
    </>
  );
}
export default App;

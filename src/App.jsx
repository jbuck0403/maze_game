//imports
import "./App.css";

// import UserTools from "./users/getUserID";
import Lobby from "./components/Lobby/Lobby";
import Home from "./components/Home/Home";
import Game from "./components/Game/Game";
// import { useNavigate } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { nanoid } from "nanoid";
import { useState } from "react";
import { orchestrationOptions } from "../reflect/orchestration-options";
import { useOrchestration } from "reflect-orchestrator";
import UserTools from "./users/getUserID";
import { usePresence } from "@rocicorp/reflect/react";

const userTool = new UserTools();
export const server = "http://localhost:8080";

function App() {
  const userID = userTool.getUserID();
  const roomAssignment = useOrchestration(
    {
      server: server,
      roomID: "orchestrator",
      userID: userID,
      auth: userID,
    },
    orchestrationOptions
  );

  console.log("$$$", roomAssignment);
  const [gameRoom, setGameRoom] = useState();
  const [startingPlayers, setStartingPlayers] = useState();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/lobby"
          element={
            <Lobby
              setGameRoom={setGameRoom}
              setStartingPlayers={setStartingPlayers}
              gameRoom={gameRoom}
              roomAssignment={roomAssignment}
            />
          }
        />
        <Route
          path="/game"
          element={<Game r={gameRoom} startingPlayers={startingPlayers} />}
        />
      </Routes>
    </Router>
  );
}
export default App;

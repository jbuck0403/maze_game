//imports
import "./App.css";

import UserTools from "./users/getUserID";
import Lobby from "./components/Lobby/Lobby";
import Home from "./components/Home/Home";
import Game from "./components/Game/Game";
import { useNavigate } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { nanoid } from "nanoid";
import { useEffect, useState } from "react";

function App() {
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
              gameRoom={gameRoom}
              setStartingPlayers={setStartingPlayers}
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

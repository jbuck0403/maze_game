//imports
import "./App.css";

import UserTools from "./users/getUserID";
import Lobby from "./components/Lobby/Lobby";
import Home from "./components/Home/Home";
import Game from "./components/Game/Game";
import { useNavigate } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { nanoid } from "nanoid";
import { useState } from "react";

function App() {
  const [gameRoom, setGameRoom] = useState();

  const getUserID = () => {
    const userID = nanoid();
    return userID;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby" element={<Lobby setGameRoom={setGameRoom} />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </Router>
  );
}
export default App;

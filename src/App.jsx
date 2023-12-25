//imports
import "./App.css";

// import UserTools from "./users/getUserID";
import Lobby from "./components/Lobby/Lobby";
import Home from "./components/Home/Home";
import Game from "./components/Game/Game";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { nanoid } from "nanoid";
import { useState, useContext } from "react";
import { orchestrationOptions } from "../reflect/orchestration-options";
import { useOrchestration } from "reflect-orchestrator";
import UserTools from "./users/getUserID";
import { usePresence } from "@rocicorp/reflect/react";
import { Navigate } from "react-router-dom";

const userTool = new UserTools();
export const server = "http://localhost:8080";

export const NavigationContext = React.createContext({
  hasVisitedHome: false,
  setHasVisitedHome: () => {},
  hasVisitedLobby: false,
  setHasVisitedLobby: () => {},
  resetNavigation: () => {},
  homeRoute: "/",
});

function App() {
  const [hasVisitedHome, setHasVisitedHome] = useState(false);
  const [hasVisitedLobby, setHasVisitedLobby] = useState(false);

  const resetNavigation = () => {
    setHasVisitedHome(false);
    setHasVisitedLobby(false);
  };

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

  console.log(roomAssignment);

  const [gameRoom, setGameRoom] = useState();
  const [startingPlayers, setStartingPlayers] = useState();

  function ProtectedRoute({ children, redirectTo, condition }) {
    return condition ? children : <Navigate to={redirectTo} />;
  }

  return (
    <NavigationContext.Provider
      value={{
        hasVisitedHome,
        setHasVisitedHome,
        hasVisitedLobby,
        setHasVisitedLobby,
        resetNavigation,
      }}
    >
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/lobby"
            element={
              <ProtectedRoute condition={hasVisitedHome} redirectTo={"/"}>
                <Lobby
                  setGameRoom={setGameRoom}
                  setStartingPlayers={setStartingPlayers}
                  gameRoom={gameRoom}
                  roomAssignment={roomAssignment}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/game"
            element={
              <ProtectedRoute condition={hasVisitedLobby} redirectTo={"/"}>
                <Game r={gameRoom} startingPlayers={startingPlayers} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </NavigationContext.Provider>
  );
}
export default App;
